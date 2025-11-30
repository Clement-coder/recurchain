const axios = require("axios");
const config = require("../config");

async function verifyPrivyToken(token) {
  const res = await axios.get(`https://api.privy.io/v1/auth/verify`, {
    headers: { Authorization: `Bearer ${config.privyApiKey}`, "x-privy-token": token }
  });
  return res.data; // contains user info and wallet
}

module.exports = { verifyPrivyToken };
