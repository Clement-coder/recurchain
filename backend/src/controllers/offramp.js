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

  async createBeneficiary(req, res) {
    try {
      const { wallet_id, bank_code, account_number, account_name } = req.body;
      if (!wallet_id || !bank_code || !account_number || !account_name) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const result = await offrampService.createBeneficiary({ wallet_id, bank_code, account_number, account_name });
      res.status(201).json({ message: "Beneficiary created successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error creating beneficiary", error: error.message });
    }
  }

  async getBeneficiaries(req, res) {
    try {
      const { wallet_id } = req.query;
      if (!wallet_id) {
        return res.status(400).json({ message: "Missing required field: wallet_id" });
      }
      const result = await offrampService.getBeneficiaries(wallet_id);
      res.status(200).json({ message: "Beneficiaries fetched successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error getting beneficiaries", error: error.message });
    }
  }

  async getBanks(req, res) {
    try {
      const result = await offrampService.getBanks();
      res.status(200).json({ message: "Banks fetched successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error getting banks", error: error.message });
    }
  }

  async resolveAccount(req, res) {
    try {
      const { account_number, bank_code } = req.body;
      if (!account_number || !bank_code) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const result = await offrampService.resolveAccount({ account_number, bank_code });
      res.status(200).json({ message: "Account resolved successfully", data: result });
    } catch (error) {
      res.status(500).json({ message: "Error resolving account", error: error.message });
    }
  }
}

module.exports = new OfframpController();