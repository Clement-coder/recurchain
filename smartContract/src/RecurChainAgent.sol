// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title RecurChainAgent
 * @dev Manages automated USDC payments with scheduling and authorization
 */
contract RecurChainAgent is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable usdcToken;
    
    struct Agent {
        address owner;
        address[] recipients;
        uint256[] amounts;
        uint256 nextExecutionTime;
        uint256 interval;
        bool isActive;
        uint256 executionCount;
        uint256 totalPaid;
    }
    
    struct Payment {
        uint256 agentId;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bytes32 txHash;
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Payment[]) public agentPayments;
    mapping(address => uint256[]) public userAgents;
    
    uint256 public agentCounter;
    uint256 public platformFee = 10; // 0.1% (in basis points)
    address public feeCollector;
    
    event AgentCreated(
        uint256 indexed agentId,
        address indexed owner,
        uint256 interval
    );
    
    event PaymentExecuted(
        uint256 indexed agentId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event AgentPaused(uint256 indexed agentId);
    event AgentResumed(uint256 indexed agentId);
    event AgentCancelled(uint256 indexed agentId);
    
    modifier onlyAgentOwner(uint256 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }
    
    constructor(address _usdcToken, address _feeCollector) {
        usdcToken = IERC20(_usdcToken);
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Create a new payment agent
     */
    function createAgent(
        address[] memory _recipients,
        uint256[] memory _amounts,
        uint256 _interval, 
        uint256 _startTime
    ) external whenNotPaused returns (uint256) {
        require(_recipients.length == _amounts.length, "Length mismatch");
        require(_recipients.length > 0, "No recipients");
        require(_interval > 0, "Invalid interval");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "Invalid amount");
            totalAmount += _amounts[i];
        }
        
        agentCounter++;
        uint256 agentId = agentCounter;
        
        agents[agentId] = Agent({
            owner: msg.sender,
            recipients: _recipients,
            amounts: _amounts,
            nextExecutionTime: _startTime > block.timestamp ? _startTime : block.timestamp,
            interval: _interval,
            isActive: true,
            executionCount: 0,
            totalPaid: 0
        });
        
        userAgents[msg.sender].push(agentId);
        
        emit AgentCreated(agentId, msg.sender, _interval);
        
        return agentId;
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
        require(agent.isActive, "Agent not active");
        require(block.timestamp >= agent.nextExecutionTime, "Too early");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < agent.amounts.length; i++) {
            totalAmount += agent.amounts[i];
        }
        
        // Calculate fee
        uint256 fee = (totalAmount * platformFee) / 10000;
        uint256 totalWithFee = totalAmount + fee;
        
        // Transfer from owner to contract
        require(
            usdcToken.transferFrom(agent.owner, address(this), totalWithFee),
            "Transfer failed"
        );
        
        // Distribute to recipients
        for (uint256 i = 0; i < agent.recipients.length; i++) {
            require(
                usdcToken.transfer(agent.recipients[i], agent.amounts[i]),
                "Payment failed"
            );
            
            agentPayments[agentId].push(Payment({
                agentId: agentId,
                recipient: agent.recipients[i],
                amount: agent.amounts[i],
                timestamp: block.timestamp,
                txHash: blockhash(block.number - 1)
            }));
            
            emit PaymentExecuted(
                agentId,
                agent.recipients[i],
                agent.amounts[i],
                block.timestamp
            );
        }
        
        // Transfer fee to collector
        if (fee > 0) {
            require(usdcToken.transfer(feeCollector, fee), "Fee transfer failed");
        }
        
        // Update agent state
        agent.executionCount++;
        agent.totalPaid += totalAmount;
        agent.nextExecutionTime = block.timestamp + agent.interval;
    }
    
    /**
     * @dev Pause an agent
     */
    function pauseAgent(uint256 agentId) 
        external 
        onlyAgentOwner(agentId) 
    {
        agents[agentId].isActive = false;
        emit AgentPaused(agentId);
    }
    
    /**
     * @dev Resume an agent
     */
    function resumeAgent(uint256 agentId) 
        external 
        onlyAgentOwner(agentId) 
    {
        agents[agentId].isActive = true;
        emit AgentResumed(agentId);
    }
    
    /**
     * @dev Cancel and delete an agent
     */
    function cancelAgent(uint256 agentId) 
        external 
        onlyAgentOwner(agentId) 
    {
        delete agents[agentId];
        emit AgentCancelled(agentId);
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
     * @dev Get user's agents
     */
    function getUserAgents(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userAgents[user];
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 500, "Fee too high"); // Max 5%
        platformFee = _newFee;
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