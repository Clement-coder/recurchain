const { expect } = require("chai");
const { ethers } = require("hardhat");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function findEventFromReceipt(contract, receipt, eventName) {
  const parsed = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
  return parsed.find((p) => p.name === eventName) || null;
}

describe("RecurChainAgent - Issue #5 Tests", function () {
  let recurChainAgent;
  let usdcToken;
  let owner, user1, recipient;
  let agentId; // string form (decimal) for safe comparisons

  beforeEach(async function () {
    [owner, user1, recipient] = await ethers.getSigners();

    // Deploy mock USDC (support both constructor shapes: (name,symbol,decimals) or (name,symbol))
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    try {
      usdcToken = await MockERC20.deploy("USDC", "USDC", 6);
      await usdcToken.waitForDeployment();
    } catch (e) {
      // fallback if mock only accepts (name, symbol)
      usdcToken = await MockERC20.deploy("USDC", "USDC");
      await usdcToken.waitForDeployment();
    }

    // Deploy RecurChainAgent
    const RecurChainAgent = await ethers.getContractFactory("RecurChainAgent");
    recurChainAgent = await RecurChainAgent.deploy(
      await usdcToken.getAddress(),
      owner.address
    );
    await recurChainAgent.waitForDeployment();

    // Create a test agent (user1 must be a signer; createAgent is external)
    const tx = await recurChainAgent.connect(user1).createAgent(
      "Test Agent",
      0, // SUBSCRIPTION (AgentType enum index)
      "Test Description",
      recipient.address,
      ethers.parseUnits("100", 6),
      3, // MONTHLY (Frequency enum index)
      Math.floor(Date.now() / 1000) + 86400
    );

    const receipt = await tx.wait();

    const evt = findEventFromReceipt(recurChainAgent, receipt, "AgentCreated");
    if (!evt) throw new Error("AgentCreated event not found in receipt logs");
    // Normalize agentId to string for comparisons
    agentId = evt.args.agentId.toString();
  });

  describe("cancelAgent", function () {
    it("should delete agent and emit event with user address", async function () {
      await expect(recurChainAgent.connect(user1).cancelAgent(agentId))
        .to.emit(recurChainAgent, "AgentCancelled")
        .withArgs(agentId, user1.address);

      // Verify agent is deleted
      const agent = await recurChainAgent.agents(agentId);
      expect(agent.owner).to.equal(ZERO_ADDRESS);
    });

    it("should remove agent from user's list", async function () {
      await recurChainAgent.connect(user1).cancelAgent(agentId);

      const userAgents = await recurChainAgent.getUserAgents(user1.address);
      const userAgentsStr = userAgents.map((a) => a.toString());
      expect(userAgentsStr).to.not.include(agentId);
    });

    it("should revert if not owner", async function () {
      await expect(
        recurChainAgent.connect(owner).cancelAgent(agentId)
      ).to.be.revertedWithCustomError(recurChainAgent, "NotAgentOwner");
    });

    it("should handle multiple agents correctly", async function () {
      // Create second agent
      const tx2 = await recurChainAgent.connect(user1).createAgent(
        "Test Agent 2",
        0,
        "Test",
        recipient.address,
        ethers.parseUnits("50", 6),
        3,
        Math.floor(Date.now() / 1000) + 86400
      );
      const receipt2 = await tx2.wait();
      const evt2 = findEventFromReceipt(recurChainAgent, receipt2, "AgentCreated");
      if (!evt2) throw new Error("AgentCreated event not found for second agent");
      const agentId2 = evt2.args.agentId.toString();

      // Cancel first agent
      await recurChainAgent.connect(user1).cancelAgent(agentId);

      // Check user still has second agent
      const userAgents = await recurChainAgent.getUserAgents(user1.address);
      const userAgentsStr = userAgents.map((a) => a.toString());
      expect(userAgentsStr).to.include(agentId2);
      expect(userAgentsStr).to.not.include(agentId);
    });
  });

  describe("updateAgent", function () {
    it("should update agent and emit event with user address", async function () {
      await expect(
        recurChainAgent.connect(user1).updateAgent(
          agentId,
          "Updated Name",
          "Updated Description",
          ethers.parseUnits("200", 6),
          1, // WEEKLY
          recipient.address,
          0 // Keep current startDate
        )
      )
        .to.emit(recurChainAgent, "AgentUpdated")
        .withArgs(
          agentId,
          user1.address,
          "Updated Name",
          ethers.parseUnits("200", 6),
          1
        );
    });

    it("should revert if agent is not active", async function () {
      // Pause the agent
      await recurChainAgent.connect(user1).pauseAgent(agentId);

      await expect(
        recurChainAgent.connect(user1).updateAgent(
          agentId,
          "Updated Name",
          "Updated Description",
          ethers.parseUnits("200", 6),
          1,
          recipient.address,
          0
        )
      ).to.be.revertedWithCustomError(recurChainAgent, "AgentNotActive");
    });

    it("should revert if not owner", async function () {
      await expect(
        recurChainAgent.connect(owner).updateAgent(
          agentId,
          "Updated Name",
          "Updated Description",
          ethers.parseUnits("200", 6),
          1,
          recipient.address,
          0
        )
      ).to.be.revertedWithCustomError(recurChainAgent, "NotAgentOwner");
    });

    it("should allow partial updates", async function () {
      const originalAgent = await recurChainAgent.getAgent(agentId);

      await recurChainAgent.connect(user1).updateAgent(
        agentId,
        "New Name",
        "",
        0,
        originalAgent.frequency,
        ZERO_ADDRESS,
        0 // Keep current startDate
      );

      const updatedAgent = await recurChainAgent.getAgent(agentId);
      expect(updatedAgent.name).to.equal("New Name");
      expect(updatedAgent.amount).to.equal(originalAgent.amount);
      expect(updatedAgent.recipient).to.equal(originalAgent.recipient);
    });

    it("should update startDate and recalculate nextExecutionTime", async function () {
      const originalAgent = await recurChainAgent.getAgent(agentId);
      const newStartDate = Math.floor(Date.now() / 1000) + 172800; // 2 days from now

      await recurChainAgent.connect(user1).updateAgent(
        agentId,
        "",
        "",
        0,
        originalAgent.frequency,
        ZERO_ADDRESS,
        newStartDate
      );

      const updatedAgent = await recurChainAgent.getAgent(agentId);
      expect(updatedAgent.startDate).to.equal(newStartDate);
      // Since executionCount is 0, nextExecutionTime should be set to new startDate
      expect(updatedAgent.nextExecutionTime).to.equal(newStartDate);
    });

    it("should revert if new startDate is in the past", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // 1 day ago

      await expect(
        recurChainAgent.connect(user1).updateAgent(
          agentId,
          "",
          "",
          0,
          3, // MONTHLY
          ZERO_ADDRESS,
          pastDate
        )
      ).to.be.revertedWithCustomError(recurChainAgent, "InvalidStartDate");
    });

    it("should recalculate nextExecutionTime when frequency changes", async function () {
      const originalAgent = await recurChainAgent.getAgent(agentId);
      const originalNextExecution = originalAgent.nextExecutionTime;

      // Change frequency from MONTHLY to WEEKLY
      await recurChainAgent.connect(user1).updateAgent(
        agentId,
        "",
        "",
        0,
        1, // WEEKLY
        ZERO_ADDRESS,
        0
      );

      const updatedAgent = await recurChainAgent.getAgent(agentId);
      expect(updatedAgent.frequency).to.equal(1); // WEEKLY

      // For agents that haven't been executed (executionCount == 0),
      // nextExecutionTime should remain as startDate
      if (originalAgent.executionCount === 0n) {
        expect(updatedAgent.nextExecutionTime).to.equal(originalAgent.startDate);
      }
    });

    it("should keep nextExecutionTime unchanged when only name/amount/recipient updates", async function () {
      const originalAgent = await recurChainAgent.getAgent(agentId);

      await recurChainAgent.connect(user1).updateAgent(
        agentId,
        "Just Name Change",
        "Just Description Change",
        ethers.parseUnits("150", 6),
        originalAgent.frequency, // Same frequency
        recipient.address,
        0 // No startDate change
      );

      const updatedAgent = await recurChainAgent.getAgent(agentId);
      expect(updatedAgent.nextExecutionTime).to.equal(originalAgent.nextExecutionTime);
    });
  });

  describe("Event Indexing", function () {
    it("should emit indexed parameters for frontend filtering", async function () {
      const filter = recurChainAgent.filters.AgentCancelled(agentId, user1.address);

      await recurChainAgent.connect(user1).cancelAgent(agentId);

      const events = await recurChainAgent.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.agentId.toString()).to.equal(agentId);
      expect(events[0].args.user).to.equal(user1.address);
    });
  });
});