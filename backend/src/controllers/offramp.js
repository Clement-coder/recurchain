const offrampService = require("../services/offrampService");

class OfframpController {
  async getRate(req, res) {
    try {
      const { currency } = req.query;
      if (!currency) {
        return res.status(400).json({ message: "Missing required field: currency" });
      }
      const result = await offrampService.getRate(currency);
      res.status(200).json({ message: "Offramp rate fetched successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error getting offramp rate", error: error.message });
    }
  }

  async initiateOfframp(req, res) {
    try {
      const { wallet_id, amount, beneficiary_id, asset } = req.body;
      if (!wallet_id || !amount || !beneficiary_id || !asset) {
        return res.status(400).json({ message: "Missing required fields: wallet_id, amount, beneficiary_id, asset" });
      }
      const result = await offrampService.initiateOfframp({ wallet_id, amount, beneficiary_id, asset });
      res.status(200).json({ message: "Offramp initiated successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error initiating offramp", error: error.message });
    }
  }

  async getStatus(req, res) {
    try {
      const { wallet_id, reference } = req.query;
      if (!wallet_id) {
        return res.status(400).json({ message: "Missing required field: wallet_id" });
      }
      const result = await offrampService.getStatus(wallet_id, reference);
      res.status(200).json({ message: "Offramp status fetched successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error getting offramp status", error: error.message });
    }
  }
}

module.exports = new OfframpController();