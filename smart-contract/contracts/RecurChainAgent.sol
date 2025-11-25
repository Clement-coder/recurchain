// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "./lib/DataTypes.sol";
import "./lib/Events.sol";
import "./lib/Errors.sol";

/**
 * @title RecurChainAgent
 * @dev Manages automated USDC payments matching frontend agent configuration
 */
contract RecurChainAgent is Ownable, ReentrancyGuard, Pausable, DataTypes, Events, Errors {
    IERC20 public immutable usdcToken;

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Payment[]) public agentPayments;
    mapping(address => uint256[]) public userAgents;

    uint256 public agentCounter;
    uint256 public platformFee = 10; // 0.1% (in basis points)
    address public feeCollector;

    modifier onlyAgentOwner(uint256 agentId) {
        if (agents[agentId].owner != msg.sender) revert NotAgentOwner();
        _;
    }

    constructor(address _usdcToken, address _feeCollector) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        feeCollector = _feeCollector;
    }

    /**
     * @dev Create a new payment agent matching frontend form structure
     * @param _name Agent name (e.g., "Netflix Subscription")
     * @param _agentType Type of agent (subscription, salary, rent, etc.)
     * @param _description Optional description
     * @param _recipient Recipient address or account
     * @param _amount Payment amount in USDC (with decimals)
     * @param _frequency Payment frequency (daily, weekly, monthly, etc.)
     * @param _startDate Unix timestamp for first payment
     */
    function createAgent(
        string memory _name,
        AgentType _agentType,
        string memory _description,
        address _recipient,
        uint256 _amount,
        Frequency _frequency,
        uint256 _startDate
    ) external whenNotPaused returns (uint256) {
        // Validation
        if (bytes(_name).length == 0) revert InvalidName();
        if (_recipient == address(0)) revert InvalidRecipient();
        if (_amount == 0) revert InvalidAmount();
        if (_startDate < block.timestamp) revert InvalidStartDate();

        agentCounter++;
        uint256 agentId = agentCounter;

        // Calculate next execution time based on frequency
        uint256 nextExecution = _startDate;

        agents[agentId] = Agent({
            owner: msg.sender,
            name: _name,
            agentType: _agentType,
            description: _description,
            recipient: _recipient,
            amount: _amount,
            frequency: _frequency,
            startDate: _startDate,
            nextExecutionTime: nextExecution,
            isActive: true,
            executionCount: 0,
            totalPaid: 0,
            createdAt: block.timestamp
        });

        userAgents[msg.sender].push(agentId);

        emit AgentCreated(
            agentId,
            msg.sender,
            _name,
            _agentType,
            _frequency,
            _amount
        );

        return agentId;
    }

    /**
     * @dev Update an existing agent
     * @param agentId ID of the agent to update
     * @param _name New agent name
     * @param _description New description
     * @param _amount New payment amount
     * @param _frequency New payment frequency
     * @param _recipient New recipient address
     * @param _startDate New start date (pass 0 to keep current)
     */
    function updateAgent(
        uint256 agentId,
        string memory _name,
        string memory _description,
        uint256 _amount,
        Frequency _frequency,
        address _recipient,
        uint256 _startDate
    ) external onlyAgentOwner(agentId) {
        Agent storage agent = agents[agentId];

        // Check if agent is active
        if (!agent.isActive) revert AgentNotActive();

        // Track if we need to recalculate nextExecutionTime
        bool shouldRecalculateNext = false;

        // Update name if provided
        if (bytes(_name).length > 0) {
            agent.name = _name;
        }

        // Update description if provided
        if (bytes(_description).length > 0) {
            agent.description = _description;
        }

        // Update amount with validation
        if (_amount > 0) {
            agent.amount = _amount;
        }

        // Update recipient with validation
        if (_recipient != address(0)) {
            agent.recipient = _recipient;
        }

        // Update frequency - this affects next execution time
        if (agent.frequency != _frequency) {
            agent.frequency = _frequency;
            shouldRecalculateNext = true;
        }

        // Update startDate if provided and valid
        if (_startDate > 0) {
            if (_startDate < block.timestamp) revert InvalidStartDate();
            agent.startDate = _startDate;
            shouldRecalculateNext = true;
        }

        // Recalculate nextExecutionTime if startDate or frequency changed
        if (shouldRecalculateNext) {
            // If the agent hasn't been executed yet, use the new startDate
            if (agent.executionCount == 0) {
                agent.nextExecutionTime = agent.startDate;
            } else {
                // If already executed, calculate next run from current time
                agent.nextExecutionTime = calculateNextExecution(
                    block.timestamp,
                    agent.frequency
                );
            }
        }

        emit AgentUpdated(agentId, msg.sender, agent.name, agent.amount, agent.frequency);
    }

    /**
     * @dev Execute payment for an agent
     */
    function executePayment(uint256 agentId)
        external
        nonReentrant
        whenNotPaused
    {
        Agent storage agent = agents[agentId];

        if (!agent.isActive) revert AgentNotActive();
        if (block.timestamp < agent.nextExecutionTime) revert TooEarlyToExecute();

        uint256 amount = agent.amount;

        // Calculate platform fee
        uint256 fee = (amount * platformFee) / 10000;
        uint256 totalWithFee = amount + fee;

        // Transfer USDC from owner to contract
        bool transferSuccess = usdcToken.transferFrom(
            agent.owner,
            address(this),
            totalWithFee
        );
        if (!transferSuccess) revert TransferFailed();

        // Transfer to recipient
        bool recipientTransferSuccess = usdcToken.transfer(
            agent.recipient,
            amount
        );
        if (!recipientTransferSuccess) revert TransferFailed();

        // Transfer fee to collector
        if (fee > 0) {
            bool feeTransferSuccess = usdcToken.transfer(feeCollector, fee);
            if (!feeTransferSuccess) revert TransferFailed();
        }

        // Record payment
        agentPayments[agentId].push(
            Payment({
                agentId: agentId,
                recipient: agent.recipient,
                amount: amount,
                timestamp: block.timestamp,
                txHash: blockhash(block.number - 1)
            })
        );

        // Update agent state
        agent.executionCount++;
        agent.totalPaid += amount;

        // Calculate next execution time based on frequency
        agent.nextExecutionTime = calculateNextExecution(
            agent.nextExecutionTime,
            agent.frequency
        );

        emit PaymentExecuted(
            agentId,
            agent.recipient,
            amount,
            block.timestamp
        );
    }

    /**
     * @dev Calculate next execution time based on frequency
     */
    function calculateNextExecution(uint256 currentTime, Frequency frequency)
        internal
        pure
        returns (uint256)
    {
        if (frequency == Frequency.DAILY) {
            return currentTime + 1 days;
        } else if (frequency == Frequency.WEEKLY) {
            return currentTime + 7 days;
        } else if (frequency == Frequency.BI_WEEKLY) {
            return currentTime + 14 days;
        } else if (frequency == Frequency.MONTHLY) {
            return currentTime + 30 days;
        } else if (frequency == Frequency.QUARTERLY) {
            return currentTime + 90 days;
        } else if (frequency == Frequency.YEARLY) {
            return currentTime + 365 days;
        }
        return currentTime + 30 days; // Default to monthly
    }

    /**
     * @dev Pause an agent
     */
    function pauseAgent(uint256 agentId) external onlyAgentOwner(agentId) {
        agents[agentId].isActive = false;
        emit AgentPaused(agentId);
    }

    /**
     * @dev Resume a paused agent
     */
    function resumeAgent(uint256 agentId) external onlyAgentOwner(agentId) {
        agents[agentId].isActive = true;
        emit AgentResumed(agentId);
    }

    /**
     * @dev Cancel and delete an agent
     * @param agentId ID of the agent to cancel
     */
    function cancelAgent(uint256 agentId) external onlyAgentOwner(agentId) {
        Agent storage agent = agents[agentId];
        address owner = agent.owner;

        // Delete agent from storage
        delete agents[agentId];

        // Remove from user's agent list
        _removeAgentFromUserList(owner, agentId);

        emit AgentCancelled(agentId, msg.sender);
    }

    /**
     * @dev Internal function to remove agent from user's list
     * @param user Address of the user
     * @param agentId ID of the agent to remove
     */
    function _removeAgentFromUserList(address user, uint256 agentId) internal {
        uint256[] storage userAgentList = userAgents[user];
        uint256 length = userAgentList.length;

        for (uint256 i = 0; i < length; i++) {
            if (userAgentList[i] == agentId) {
                // Move the last element to the position being deleted
                userAgentList[i] = userAgentList[length - 1];
                // Remove the last element
                userAgentList.pop();
                break;
            }
        }
    }

    /**
     * @dev Get complete agent details
     */
    function getAgent(uint256 agentId)
        external
        view
        returns (
            address owner,
            string memory name,
            AgentType agentType,
            string memory description,
            address recipient,
            uint256 amount,
            Frequency frequency,
            uint256 startDate,
            uint256 nextExecutionTime,
            bool isActive,
            uint256 executionCount,
            uint256 totalPaid
        )
    {
        Agent storage agent = agents[agentId];
        return (
            agent.owner,
            agent.name,
            agent.agentType,
            agent.description,
            agent.recipient,
            agent.amount,
            agent.frequency,
            agent.startDate,
            agent.nextExecutionTime,
            agent.isActive,
            agent.executionCount,
            agent.totalPaid
        );
    }

    /**
     * @dev Get agent payment history
     */
    function getAgentPayments(uint256 agentId)
        external
        view
        returns (Payment[] memory)
    {
        return agentPayments[agentId];
    }

    /**
     * @dev Get all agents for a user
     */
    function getUserAgents(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userAgents[user];
    }

    /**
     * @dev Check if agent is ready for execution
     */
    function isAgentReadyForExecution(uint256 agentId)
        external
        view
        returns (bool)
    {
        Agent storage agent = agents[agentId];
        return
            agent.isActive &&
            block.timestamp >= agent.nextExecutionTime;
    }

    /**
     * @dev Get agent summary for display
     */
    function getAgentSummary(uint256 agentId)
        external
        view
        returns (
            string memory name,
            uint256 amount,
            string memory frequencyStr,
            address recipient,
            uint256 nextRun,
            bool isActive
        )
    {
        Agent storage agent = agents[agentId];
        return (
            agent.name,
            agent.amount,
            getFrequencyString(agent.frequency),
            agent.recipient,
            agent.nextExecutionTime,
            agent.isActive
        );
    }

    /**
     * @dev Convert frequency enum to string
     */
    function getFrequencyString(Frequency freq)
        internal
        pure
        returns (string memory)
    {
        if (freq == Frequency.DAILY) return "daily";
        if (freq == Frequency.WEEKLY) return "weekly";
        if (freq == Frequency.BI_WEEKLY) return "bi-weekly";
        if (freq == Frequency.MONTHLY) return "monthly";
        if (freq == Frequency.QUARTERLY) return "quarterly";
        if (freq == Frequency.YEARLY) return "yearly";
        return "monthly";
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 500, "Fee too high"); // Max 5%
        platformFee = _newFee;
    }

    /**
     * @dev Update fee collector address (only owner)
     */
    function updateFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        feeCollector = _newCollector;
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}