const { ethers } = require("ethers");
const fs = require("fs");

async function generateData() {
  // Generate random wallet addresses
  const addr1 = ethers.Wallet.createRandom();
  const addr2 = ethers.Wallet.createRandom();
  const addr3 = ethers.Wallet.createRandom();
  const addr4 = ethers.Wallet.createRandom();

  // Define participant data with addresses and amounts in ether
  const participants = [
    {
      address: addr1.address,
      amount: ethers.parseEther("100").toString(),
    },
    {
      address: addr2.address,
      amount: ethers.parseEther("200").toString(),
    },
    {
      address: addr3.address,
      amount: ethers.parseEther("300").toString(),
    },
    {
      address: addr4.address,
      amount: ethers.parseEther("200").toString(),
    },
  ];

  // Save the data to data.json
  fs.writeFileSync(
    "ParticipantData.json",
    JSON.stringify({ participants }, null, 2)
  );

  console.log("Data generated and saved to ParticipantData.json");
}

generateData().catch(console.error);
