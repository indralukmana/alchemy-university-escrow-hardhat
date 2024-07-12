require("@nomicfoundation/hardhat-toolbox");

// dotenv
require("dotenv").config();

const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.17",
  paths: {
    artifacts: "./app/src/artifacts",
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/sNKs55JvK0YF7BwIQZjM_wDhDxSPMGkP",
      accounts: [PRIVATE_KEY],
    },
  },
};
