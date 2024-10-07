// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdropToken is ERC20, Ownable {
    bytes32 public merkleRoot; // Store the Merkle root
    mapping(address => bool) public claimed; // Keep track of who has claimed

    constructor(address initialOwner) ERC20("MerkleToken", "MTKN")Ownable(initialOwner) {
         _mint(msg.sender, 1000000 * 10 ** 18); // Initial supply
    }

    // Set the new Merkle root for the current airdrop
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

     // Function to claim tokens
    function claimTokens(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!claimed[msg.sender], "Tokens already claimed");

        // Compute the leaf node (address + amount)
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

        // Verify the proof
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid Data, verify your address,amount or proof");

        claimed[msg.sender] = true; // Mark as claimed

        _transfer(owner(), msg.sender, amount); // Transfer the tokens
    }
}
