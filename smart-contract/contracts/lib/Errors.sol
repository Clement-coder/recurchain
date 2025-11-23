// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract Errors {
    error NotAgentOwner();
    error InvalidAmount();
    error InvalidRecipient();
    error InvalidStartDate();
    error AgentNotActive();
    error TooEarlyToExecute();
    error TransferFailed();
    error AgentNotFound();
    error InvalidName();

    error FeeTooHigh();
    error ZeroAddress();
}
