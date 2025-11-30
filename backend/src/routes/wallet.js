const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ balance: 1000 }));
router.post("/send", (req, res) => res.json({ success: true, txHash: "0x123" }));

module.exports = router;
