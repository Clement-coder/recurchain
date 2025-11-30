const axios = require("axios");
const config = require("../config");

class OfframpService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        "x-service-key": this.apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  async getRate(currency) {
    try {
      const response = await this.api.get(`/rate/offramp?currency=${currency}`);
      return response.data;
    } catch (error) {
      console.error("Error getting offramp rate:", error.response.data);
      throw new Error(error.response.data.message || "Error getting offramp rate");
    }
  }

  async initiateOfframp(data) {
    try {
      const response = await this.api.post("/offramp", data);
      return response.data;
    } catch (error) {
      console.error("Error initiating offramp:", error.response.data);
      throw new Error(error.response.data.message || "Error initiating offramp");
    }
  }

  async getStatus(wallet_id, reference) {
    try {
      let url = `/status/offramp?wallet_id=${wallet_id}`;
      if (reference) {
        url += `&reference=${reference}`;
      }
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error getting offramp status:", error.response.data);
      throw new Error(error.response.data.message || "Error getting offramp status");
    }
  }
}

module.exports = new OfframpService(config.offramp.apiKey, config.offramp.baseUrl);