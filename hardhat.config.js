require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require("dotenv").config();

const { PRIVATE_KEY_ACCOUNT1, ALCHEMY_API_KEY, ETHERSCAN_API_KEY } =
  process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY_ACCOUNT1],
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
