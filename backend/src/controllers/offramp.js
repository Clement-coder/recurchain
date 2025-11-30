const offrampService = require("../services/offrampService");

class OfframpController {
  async initiateOfframp(req, res) {
    try {
      const { amount, currency, bankDetails } = req.body;
      if (!amount || !currency || !bankDetails) {
        return res.status(400).json({ message: "Missing required fields: amount, currency, bankDetails" });
      }
      const result = await offrampService.initiateOfframp({ amount, currency, bankDetails });
      res.status(200).json({ message: "Offramp initiated successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error initiating offramp", error: error.message });
    }
  }
}

module.exports = new OfframpController();
