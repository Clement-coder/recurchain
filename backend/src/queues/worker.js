const { Worker } = require("bullmq");
const { runDueAgents } = require("../services/schedulerService");
const config = require("../config");

const worker = new Worker("agentQueue", async job => {
  await runDueAgents();
}, { connection: { host: config.redis.host, port: config.redis.port } });

module.exports = { worker };
