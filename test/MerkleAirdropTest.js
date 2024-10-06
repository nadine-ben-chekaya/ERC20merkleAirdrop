const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("Merkle Airdrop Token", function () {
  let token, owner, addr1, addr2, addr3, addr4, addr5;
  let merkleTree, root;
  const RewardAmount = ethers.parseEther("100");

  beforeEach(async function () {
    // Deploy the MerkleAirdropToken contract
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    token = await ethers.deployContract("MerkleAirdropToken", [
      owner,
      RewardAmount,
    ]);
    await token.waitForDeployment();
    console.log("contreact address=", token.target);

    // Airdrop participants and their amounts
    const participants = [
      addr1.address,
      addr2.address,
      addr3.address,
      addr4.address,
    ];
    // Generate leaves by hashing the participants' address + amount
    const leaves = participants.map((x) => keccak256(x));

    // Create the Merkle Tree and get the root
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    root = merkleTree.getHexRoot();

    // Set the Merkle root in the contract
    await token.setMerkleRoot(root);
  });

  it("1.Should allow valid participants to claim tokens", async function () {
    // addr1 wants to claim
    const leaf = keccak256(addr1.address);
    const proof = merkleTree.getHexProof(leaf);
    // Claim tokens
    await token.connect(addr1).claimTokens(proof);
    // Check the balance of addr1
    expect(await token.balanceOf(addr1.address)).to.equal(RewardAmount);
  });

  it("2.Should not prevent double claiming", async function () {
    // addr1 claims double
    const leaf = keccak256(addr1.address);
    const proof = merkleTree.getHexProof(leaf);
    // First claim
    await token.connect(addr1).claimTokens(proof);
    // Trying to claim again should fail
    await expect(token.connect(addr1).claimTokens(proof)).to.be.revertedWith(
      "Tokens already claimed"
    );
  });

  it("3.Should reject claims with an invalid proof", async function () {
    // addr1 wants to claim with an invalid proof
    const invalidProof = [];
    // This should fail due to invalid proof
    await expect(
      token.connect(addr1).claimTokens(invalidProof)
    ).to.be.revertedWith("Invalid proof");
  });

  it("4.Should reject claims for non-participants", async function () {
    // addr5 claims (not part of the airdrop)
    const leaf = keccak256(addr5.address);
    const proof = merkleTree.getHexProof(leaf);
    // This should fail because addr2 is not in the list
    await expect(token.connect(addr2).claimTokens(proof)).to.be.revertedWith(
      "Invalid proof"
    );
  });
});
