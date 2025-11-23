// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract DataTypes {
    // Agent types matching frontend
    enum AgentType {
        SUBSCRIPTION,
        SALARY,
        RENT,
        LOAN,
        INSURANCE,
        OTHER
    }

    // Payment frequencies matching frontend
    enum Frequency {
        DAILY,
        WEEKLY,
        BI_WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }

    struct Agent {
        address owner;
        string name;
        AgentType agentType;
        string description;
        address recipient;
        uint256 amount;
        Frequency frequency;
        uint256 startDate;
        uint256 nextExecutionTime;
        bool isActive;
        uint256 executionCount;
        uint256 totalPaid;
        uint256 createdAt;
    }

    struct Payment {
        uint256 agentId;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bytes32 txHash;
    }
}
