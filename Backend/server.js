const express = require("express");
const fs = require("fs");
const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const app = express();
const port = 3000;
let merkleTree, root;

// Load JSON data from the file
function loadData() {
  const data = fs.readFileSync("ParticipantData.json");
  return JSON.parse(data);
}

// GET request to get Merkle Root
app.get("/getMerkleRoot", (req, res) => {
  const data = loadData();
  const participants = data.participants;

  // Generate leaves by hashing the participants' address + amount
  const leaves = participants.map((x) =>
    ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [x.address, x.amount]
    )
  );

  // Create the Merkle Tree and get the root
  merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  root = merkleTree.getHexRoot();
  console.log("Merkle root=", root);

  res.send(root);
});

//GET request to get the proof by specific address
app.get("/getMetkleProof/:address", (req, res) => {
  const data = loadData();
  const participant = data.participants.find(
    (p) => p.address === req.params.address
  );
  if (participant) {
    const leaf = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [participant.address, participant.amount]
    );
    const proof = merkleTree.getHexProof(leaf);

    console.log(`Merkle Proof of address: ${req.params.address}= `, proof);
    res.send(proof);
  } else {
    res.status(404).json({ message: "Participant not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// server that will respond to 2 get requests:
// 1. getMerkleRoot   *
// 2. getMetkleProof(address)
// 3. info about claims should be stored in a local json file   *
