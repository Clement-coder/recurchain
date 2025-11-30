const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.SERVER_PORT || 5000,
  postgres: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  privyApiKey: process.env.PRIVY_API_KEY,
  contract: {
    address: process.env.CONTRACT_ADDRESS,
    abiPath: process.env.CONTRACT_ABI_PATH,
    networkUrl: process.env.NETWORK_URL
  },
  jwtSecret: process.env.JWT_SECRET,
  offramp: {
    apiKey: process.env.OFFRAMP_API_KEY,
    baseUrl: "https://api.bread.africa/identity",
  },
};
