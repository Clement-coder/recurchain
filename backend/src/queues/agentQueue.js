const { Queue } = require("bullmq");
const config = require("../config");

const agentQueue = new Queue("agentQueue", { connection: { host: config.redis.host, port: config.redis.port } });

module.exports = { agentQueue };
