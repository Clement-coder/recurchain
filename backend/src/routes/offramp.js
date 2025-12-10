const express = require("express");
const router = express.Router();
const offrampController = require("../controllers/offramp");

router.get("/rate", offrampController.getRate);
router.post("/initiate", offrampController.initiateOfframp);
router.get("/status", offrampController.getStatus);

router.post("/beneficiaries", offrampController.createBeneficiary);
router.get("/beneficiaries", offrampController.getBeneficiaries);
router.get("/banks", offrampController.getBanks);
router.post("/resolve-account", offrampController.resolveAccount);

module.exports = router;