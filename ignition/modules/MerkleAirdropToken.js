const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ACCOUNT1_ADDRESS } = process.env;

const Erc20MAModule = buildModule("Erc20MAModule", (m) => {
  const Airdropcontract = m.contract("MerkleAirdropToken", [ACCOUNT1_ADDRESS]);

  return { Airdropcontract };
});

module.exports = Erc20MAModule;
