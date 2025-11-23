import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { RecurChainAgent } from "../typechain-types";
import { MockERC20 } from "../typechain-types";

describe("RecurChainAgent", function () {
  let recurChainAgent: RecurChainAgent;
  let usdcToken: MockERC20;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let feeCollector: any;

  // Enums from the contract
  const AgentType = {
    SUBSCRIPTION: 0,
    SALARY: 1,
    RENT: 2,
    LOAN: 3,
    INSURANCE: 4,
    OTHER: 5,
  };

  const Frequency = {
    DAILY: 0,
    WEEKLY: 1,
    BI_WEEKLY: 2,
    MONTHLY: 3,
    QUARTERLY: 4,
    YEARLY: 5,
  };

  beforeEach(async function () {
    [owner, addr1, addr2, feeCollector] = await ethers.getSigners();

    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    usdcToken = await MockERC20Factory.deploy("USD Coin", "USDC");

    const RecurChainAgentFactory = await ethers.getContractFactory(
      "RecurChainAgent"
    );
    recurChainAgent = await RecurChainAgentFactory.deploy(
      await usdcToken.getAddress(),
      feeCollector.address
    );

    // Mint some USDC for the owner to use
    await usdcToken.mint(owner.address, ethers.parseUnits("10000", 6));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await recurChainAgent.owner()).to.equal(owner.address);
    });

    it("Should set the right USDC token address", async function () {
      expect(await recurChainAgent.usdcToken()).to.equal(
        await usdcToken.getAddress()
      );
    });

    it("Should set the right fee collector", async function () {
      expect(await recurChainAgent.feeCollector()).to.equal(
        feeCollector.address
      );
    });

    it("Should set the default platform fee", async function () {
      expect(await recurChainAgent.platformFee()).to.equal(10); // Default from contract
    });
  });

  describe("Agent Management", function () {
    const agentName = "Netflix Subscription";
    const agentType = AgentType.SUBSCRIPTION;
    const description = "Monthly Netflix payment";
    const recipient = addr1.address;
    const amount = ethers.parseUnits("100", 6);
    const frequency = Frequency.MONTHLY;
    let startDate: number;

    beforeEach(async function () {
      startDate = (await time.latest()) + 3600; // 1 hour from now
    });

    it("Should allow a user to create a payment agent", async function () {
      await expect(
        recurChainAgent.createAgent(
          agentName,
          agentType,
          description,
          recipient,
          amount,
          frequency,
          startDate
        )
      )
        .to.emit(recurChainAgent, "AgentCreated")
        .withArgs(1, owner.address, agentName, agentType, frequency, amount);

      const agent = await recurChainAgent.agents(1);
      expect(agent.owner).to.equal(owner.address);
      expect(agent.name).to.equal(agentName);
      expect(agent.recipient).to.equal(recipient);
      expect(agent.amount).to.equal(amount);
      expect(agent.frequency).to.equal(frequency);
      expect(agent.startDate).to.equal(startDate);
      expect(agent.isActive).to.be.true;

      const userAgents = await recurChainAgent.getUserAgents(owner.address);
      expect(userAgents.length).to.equal(1);
      expect(userAgents[0]).to.equal(1);
    });

    it("Should revert if name is empty", async function () {
      await expect(
        recurChainAgent.createAgent(
          "",
          agentType,
          description,
          recipient,
          amount,
          frequency,
          startDate
        )
      ).to.be.revertedWithCustomError(recurChainAgent, "InvalidName");
    });

    it("Should revert if recipient is zero address", async function () {
      await expect(
        recurChainAgent.createAgent(
          agentName,
          agentType,
          description,
          ethers.ZeroAddress,
          amount,
          frequency,
          startDate
        )
      ).to.be.revertedWithCustomError(recurChainAgent, "InvalidRecipient");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        recurChainAgent.createAgent(
          agentName,
          agentType,
          description,
          recipient,
          0,
          frequency,
          startDate
        )
      ).to.be.revertedWithCustomError(recurChainAgent, "InvalidAmount");
    });

    it("Should revert if start date is in the past", async function () {
      await expect(
        recurChainAgent.createAgent(
          agentName,
          agentType,
          description,
          recipient,
          amount,
          frequency,
          (await time.latest()) - 100
        )
      ).to.be.revertedWithCustomError(recurChainAgent, "InvalidStartDate");
    });

    it("Should allow updating an agent", async function () {
      await recurChainAgent.createAgent(
        agentName,
        agentType,
        description,
        recipient,
        amount,
        frequency,
        startDate
      );

      const newName = "New Subscription Name";
      const newAmount = ethers.parseUnits("120", 6);
      const newFrequency = Frequency.WEEKLY;
      const newRecipient = addr2.address;
      const newDescription = "Updated desc";

      await expect(
        recurChainAgent.updateAgent(
          1,
          newName,
          newDescription,
          newAmount,
          newFrequency,
          newRecipient
        )
      )
        .to.emit(recurChainAgent, "AgentUpdated")
        .withArgs(1, newName, newAmount, newFrequency);

      const updatedAgent = await recurChainAgent.agents(1);
      expect(updatedAgent.name).to.equal(newName);
      expect(updatedAgent.description).to.equal(newDescription);
      expect(updatedAgent.amount).to.equal(newAmount);
      expect(updatedAgent.frequency).to.equal(newFrequency);
      expect(updatedAgent.recipient).to.equal(newRecipient);
    });

    it("Should pause an agent", async function () {
      await recurChainAgent.createAgent(
        agentName,
        agentType,
        description,
        recipient,
        amount,
        frequency,
        startDate
      );
      await expect(recurChainAgent.pauseAgent(1))
        .to.emit(recurChainAgent, "AgentPaused")
        .withArgs(1);
      expect((await recurChainAgent.agents(1)).isActive).to.be.false;
    });

    it("Should resume an agent", async function () {
      await recurChainAgent.createAgent(
        agentName,
        agentType,
        description,
        recipient,
        amount,
        frequency,
        startDate
      );
      await recurChainAgent.pauseAgent(1); // First pause it
      await expect(recurChainAgent.resumeAgent(1))
        .to.emit(recurChainAgent, "AgentResumed")
        .withArgs(1);
      expect((await recurChainAgent.agents(1)).isActive).to.be.true;
    });

    it("Should cancel an agent", async function () {
      await recurChainAgent.createAgent(
        agentName,
        agentType,
        description,
        recipient,
        amount,
        frequency,
        startDate
      );
      await expect(recurChainAgent.cancelAgent(1))
        .to.emit(recurChainAgent, "AgentCancelled")
        .withArgs(1);
      // Check that agent is effectively deleted (all fields should be default/zero)
      const agent = await recurChainAgent.agents(1);
      expect(agent.owner).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Payment Execution", function () {
    const agentName = "Monthly Salary";
    const agentType = AgentType.SALARY;
    const description = "Employee salary";
    const recipient = addr1.address;
    const amount = ethers.parseUnits("500", 6);
    const frequency = Frequency.MONTHLY;
    let startDate: number;
    let agentId: number;

    beforeEach(async function () {
      startDate = (await time.latest()) + 1; // Start immediately
      await recurChainAgent.createAgent(
        agentName,
        agentType,
        description,
        recipient,
        amount,
        frequency,
        startDate
      );
      agentId = 1;
      // Approve RecurChainAgent contract to spend owner's USDC
      await usdcToken.approve(
        await recurChainAgent.getAddress(),
        ethers.parseUnits("1000", 6)
      );
    });

    it("Should execute a payment successfully", async function () {
      const initialRecipientBalance = await usdcToken.balanceOf(recipient);
      const initialFeeCollectorBalance = await usdcToken.balanceOf(
        feeCollector.address
      );

      await expect(recurChainAgent.executePayment(agentId)).to.emit(
        recurChainAgent,
        "PaymentExecuted"
      );

      const finalRecipientBalance = await usdcToken.balanceOf(recipient);
      const finalFeeCollectorBalance = await usdcToken.balanceOf(
        feeCollector.address
      );

      expect(finalRecipientBalance - initialRecipientBalance).to.equal(amount);

      const fee = (amount * BigInt(10)) / BigInt(10000);
      expect(finalFeeCollectorBalance - initialFeeCollectorBalance).to.equal(
        fee
      );

      const agent = await recurChainAgent.agents(agentId);
      expect(agent.executionCount).to.equal(1);
      expect(agent.totalPaid).to.equal(amount);
      expect(agent.nextExecutionTime).to.be.gt(startDate); // Next execution should be updated
    });

    it("Should revert if agent is not active", async function () {
      await recurChainAgent.pauseAgent(agentId);
      await expect(
        recurChainAgent.executePayment(agentId)
      ).to.be.revertedWithCustomError(recurChainAgent, "AgentNotActive");
    });

    it("Should revert if too early to execute", async function () {
      await time.increase(1); // Advance time just past startDate
      await recurChainAgent.executePayment(agentId); // Execute first payment
      // Try to execute again immediately, should be too early
      await expect(
        recurChainAgent.executePayment(agentId)
      ).to.be.revertedWithCustomError(recurChainAgent, "TooEarlyToExecute");
    });
  });

  describe("Getters", function () {
    const agentName = "Quarterly Rent";
    const agentType = AgentType.RENT;
    const description = "Quarterly rent payment";
    const recipient = addr1.address;
    const amount = ethers.parseUnits("1000", 6);
    const frequency = Frequency.QUARTERLY;
    let startDate: number;
    let agentId: number;

    beforeEach(async function () {
      startDate = (await time.latest()) + 3600; // 1 hour from now
      await recurChainAgent.createAgent(
        agentName,
        agentType,
        description,
        recipient,
        amount,
        frequency,
        startDate
      );
      agentId = 1;
    });

    it("Should return correct agent details", async function () {
      const [
        ownerAddr,
        name,
        type,
        desc,
        recip,
        amt,
        freq,
        startD,
        nextExec,
        isActive,
        execCount,
        totalPaid,
      ] = await recurChainAgent.getAgent(agentId);

      expect(ownerAddr).to.equal(owner.address);
      expect(name).to.equal(agentName);
      expect(type).to.equal(agentType);
      expect(desc).to.equal(description);
      expect(recip).to.equal(recipient);
      expect(amt).to.equal(amount);
      expect(freq).to.equal(frequency);
      expect(startD).to.equal(startDate);
      expect(nextExec).to.equal(startDate);
      expect(isActive).to.be.true;
      expect(execCount).to.equal(0);
      expect(totalPaid).to.equal(0);
    });

    it("should return correct agent summary", async function () {
      const [name, amt, freqStr, recip, nextRun, isActive] =
        await recurChainAgent.getAgentSummary(agentId);

      expect(name).to.equal(agentName);
      expect(amt).to.equal(amount);
      expect(freqStr).to.equal("quarterly");
      expect(recip).to.equal(recipient);
      expect(nextRun).to.equal(startDate);
      expect(isActive).to.be.true;
    });

    it("Should correctly calculate next execution time", async function () {
      // Test calculateNextExecution for a specific frequency
      const oneDay = 24 * 60 * 60;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay; // Approximation
      const oneQuarter = 90 * oneDay;
      const oneYear = 365 * oneDay;

      const currentTime = (await time.latest());
      
      expect(await recurChainAgent.calculateNextExecution(currentTime, Frequency.DAILY)).to.equal(currentTime + oneDay);
      expect(await recurChainAgent.calculateNextExecution(currentTime, Frequency.WEEKLY)).to.equal(currentTime + oneWeek);
      expect(await recurChainAgent.calculateNextExecution(currentTime, Frequency.BI_WEEKLY)).to.equal(currentTime + (2 * oneWeek));
      expect(await recurChainAgent.calculateNextExecution(currentTime, Frequency.MONTHLY)).to.equal(currentTime + oneMonth);
      expect(await recurChainAgent.calculateNextExecution(currentTime, Frequency.QUARTERLY)).to.equal(currentTime + oneQuarter);
      expect(await recurChainAgent.calculateNextExecution(currentTime, Frequency.YEARLY)).to.equal(currentTime + oneYear);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 50; // 0.5%
      await expect(recurChainAgent.updatePlatformFee(newFee))
        .to.emit(recurChainAgent, "PlatformFeeUpdated")
        .withArgs(newFee); // Note: Events are not used in new code
      expect(await recurChainAgent.platformFee()).to.equal(newFee);
    });

    it("Should revert if non-owner tries to update platform fee", async function () {
      await expect(
        recurChainAgent.connect(addr1).updatePlatformFee(50)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert if fee is too high", async function () {
      await expect(
        recurChainAgent.updatePlatformFee(501)
      ).to.be.revertedWith("Fee too high"); // Note: Error is a string, not custom error
    });

    it("Should allow owner to update fee collector", async function () {
      const newCollector = addr2.address;
      await expect(recurChainAgent.updateFeeCollector(newCollector))
        .to.emit(recurChainAgent, "FeeCollectorUpdated")
        .withArgs(newCollector); // Note: Events are not used in new code
      expect(await recurChainAgent.feeCollector()).to.equal(newCollector);
    });

    it("Should revert if non-owner tries to update fee collector", async function () {
      await expect(
        recurChainAgent.connect(addr1).updateFeeCollector(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert if fee collector is zero address", async function () {
      await expect(
        recurChainAgent.updateFeeCollector(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address"); // Note: Error is a string, not custom error
    });

    it("Should allow owner to pause and unpause contract", async function () {
      await expect(recurChainAgent.pause())
        .to.emit(recurChainAgent, "Paused")
        .withArgs(owner.address);
      expect(await recurChainAgent.paused()).to.be.true;

      await expect(recurChainAgent.unpause())
        .to.emit(recurChainAgent, "Unpaused")
        .withArgs(owner.address);
      expect(await recurChainAgent.paused()).to.be.false;
    });

    it("Should revert if non-owner tries to pause/unpause", async function () {
      await expect(
        recurChainAgent.connect(addr1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        recurChainAgent.connect(addr1).unpause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});