const express = require("express");
const { createAgent, getAgents, deleteAgent } = require("../controllers/agents");
const router = express.Router();

router.post("/", createAgent);
router.get("/", getAgents);
router.delete("/:agentId", deleteAgent);

module.exports = router;
