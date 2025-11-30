const express = require("express");
const router = express.Router();
const offrampController = require("../controllers/offramp");

router.post("/initiate", offrampController.initiateOfframp);

module.exports = router;
