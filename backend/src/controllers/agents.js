// const Agent = require("../models/Agent");

async function createAgent(req, res) {
  // const data = req.body;
  // try {
  //   const agent = await Agent.create(data);
  //   res.json({ success: true, agent });
  // } catch(err) {
  //   res.status(400).json({ success: false, error: err.message });
  // }
  res.json({ success: true, message: "createAgent not implemented yet" });
}

async function getAgents(req, res) {
  // const userId = req.user.id;
  // const agents = await Agent.find({ userId });
  // res.json({ success: true, agents });
  res.json({ success: true, message: "getAgents not implemented yet" });
}

async function deleteAgent(req, res) {
  // const { agentId } = req.params;
  // const agent = await Agent.findById(agentId);
  // if (!agent) return res.status(404).json({ error: "Agent not found" });
  // agent.active = false;
  // await agent.save();
  // res.json({ success: true });
  res.json({ success: true, message: "deleteAgent not implemented yet" });
}

module.exports = { createAgent, getAgents, deleteAgent };
