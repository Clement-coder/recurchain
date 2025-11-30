const axios = require("axios");
const config = require("../config");

class OfframpService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async initiateOfframp(data) {
    try {
      const response = await this.api.post("/payouts", data);
      return response.data;
    } catch (error) {
      console.error("Error initiating offramp:", error.response.data);
      throw new Error(error.response.data.message || "Error initiating offramp");
    }
  }
}

module.exports = new OfframpService(config.offramp.apiKey, config.offramp.baseUrl);
