import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
  version: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    viaIR: true,   // <-- THIS FIXES “stack too deep”
  },
},


  networks: {
    basesepolia: {
      url: "https://sepolia.base.org",
      accounts: process.env.BASE_SEPOLIA_PRIVATE_KEY ? [process.env.BASE_SEPOLIA_PRIVATE_KEY] : [],
    },
  },

  etherscan: {
    apiKey: process.env.BASESCAN_API_KEY,   // <-- only one API key
    customChains: [
      {
        network: "basesepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api/v2",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;
