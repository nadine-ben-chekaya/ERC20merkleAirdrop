const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("Merkle Airdrop Token", function () {
  let token, owner, addr1, addr2;
  let merkleTree, root;

  beforeEach(async function () {
    // Deploy the MerkleAirdropToken contract
    const MerkleAirdropToken = await ethers.getContractFactory(
      "MerkleAirdropToken"
    );
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await ethers.deployContract("MerkleAirdropToken", [owner]);
    await token.waitForDeployment();
    console.log("contreact address=", token.target);

    // Airdrop participants and their amounts
    const participants = [
      { address: addr1.address, amount: ethers.parseEther("100") },
      { address: addr2.address, amount: ethers.parseEther("200") },
    ];

    // Generate leaves by hashing the participants' address + amount
    const leaves = participants.map((x) =>
      keccak256(
        ethers.solidityPacked(["address", "uint256"], [x.address, x.amount])
      )
    );

    // Create the Merkle Tree and get the root
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    root = merkleTree.getHexRoot();

    // Set the Merkle root in the contract
    await token.setMerkleRoot(root);
  });

  it("1.Should allow valid participants to claim tokens", async function () {
    // addr1 wants to claim 100 tokens
    const amount = ethers.parseEther("100");
    const leaf = keccak256(
      ethers.solidityPacked(["address", "uint256"], [addr1.address, amount])
    );
    const proof = merkleTree.getHexProof(leaf);
    // Claim tokens
    await token.connect(addr1).claimTokens(amount, proof);
    // Check the balance of addr1
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
  });

  it("2.Should prevent double claiming", async function () {
    // addr1 claims 100 tokens
    const amount = ethers.parseEther("100");
    const leaf = keccak256(
      ethers.solidityPacked(["address", "uint256"], [addr1.address, amount])
    );
    const proof = merkleTree.getHexProof(leaf);
    // First claim
    await token.connect(addr1).claimTokens(amount, proof);
    // Trying to claim again should fail
    await expect(
      token.connect(addr1).claimTokens(amount, proof)
    ).to.be.revertedWith("Tokens already claimed");
  });

  it("3.Should reject claims with an invalid proof", async function () {
    // addr1 wants to claim 100 tokens with an invalid proof
    const invalidProof = [];
    const amount = ethers.parseEther("100");
    // This should fail due to invalid proof
    await expect(
      token.connect(addr1).claimTokens(amount, invalidProof)
    ).to.be.revertedWith("Invalid proof");
  });

  it("4.Should reject claims for non-participants", async function () {
    // addr2 claims 300 tokens (not part of the airdrop)
    const amount = ethers.parseEther("300");
    const leaf = keccak256(
      ethers.solidityPacked(["address", "uint256"], [addr2.address, amount])
    );
    const proof = merkleTree.getHexProof(leaf);
    // This should fail because addr2 is not in the list
    await expect(
      token.connect(addr2).claimTokens(amount, proof)
    ).to.be.revertedWith("Invalid proof");
  });
});
