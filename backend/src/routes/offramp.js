const express = require("express");
const router = express.Router();
const offrampController = require("../controllers/offramp");

router.get("/rate", offrampController.getRate);
router.post("/initiate", offrampController.initiateOfframp);
router.get("/status", offrampController.getStatus);

module.exports = router;