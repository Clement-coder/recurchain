const { contract, provider } = require('./contractService');
const Agent = require('../models/Agent');

function startIndexer() {
  contract.on('AgentCreated', async (agentId, user, args) => {
    // parse args and insert or update DB
    console.log('AgentCreated', agentId.toString());
    // Optional: fetch onchain details and sync to DB
  });

  contract.on('AgentExecuted', (agentId, user, receipt) => {
    console.log('AgentExecuted', agentId.toString());
    // update transaction records or agent nextRun based on event
  });

  // ... add AgentUpdated, AgentCancelled as needed
}

module.exports = { startIndexer };
