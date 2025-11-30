const Web3 = require("web3");
const fs = require("fs");
const config = require("../config");

const web3 = new Web3(config.contract.networkUrl);
const abi = JSON.parse(fs.readFileSync(config.contract.abiPath));
const contract = new web3.eth.Contract(abi, config.contract.address);

async function executeAgent(agent, userWallet) {
  // stub: call smart contract function
  return await contract.methods.runAgent(agent.id).send({ from: userWallet });
}

module.exports = { executeAgent };
