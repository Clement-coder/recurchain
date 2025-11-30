const Agent = require("../models/Agent");
const { executeAgent } = require("./contractService");

async function runDueAgents() {
  const now = new Date();
  const agents = await Agent.find({ active: true, paused: false, nextRun: { $lte: now } });
  for (const agent of agents) {
    try {
      await executeAgent(agent, agent.userId.walletAddress);
      agent.nextRun = new Date(agent.nextRun.getTime() + getInterval(agent.frequency));
      await agent.save();
    } catch (err) {
      console.error(err);
    }
  }
}

function getInterval(frequency) {
  switch(frequency) {
    case "daily": return 24*60*60*1000;
    case "weekly": return 7*24*60*60*1000;
    case "monthly": return 30*24*60*60*1000;
  }
}

module.exports = { runDueAgents };
