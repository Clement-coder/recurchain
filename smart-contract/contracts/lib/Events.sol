// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataTypes.sol";

abstract contract Events is DataTypes {
    event AgentCreated(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        AgentType agentType,
        Frequency frequency,
        uint256 amount
    );

    event PaymentExecuted(
        uint256 indexed agentId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event AgentUpdated(
        uint256 indexed agentId,
        string name,
        uint256 amount,
        Frequency frequency
    );

    event AgentPaused(uint256 indexed agentId);
    event AgentResumed(uint256 indexed agentId);
    event AgentCancelled(uint256 indexed agentId);

    // Events from original contract, not in the provided snippet but good to keep
    event PlatformFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);
}


