// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract SoulBoundVC is ERC721, Ownable {
    using Strings for uint256;

    uint256 public tokenCounter;

    struct Credential {
        bytes32 hash;
        bool verified;
    }

    mapping(uint256 => Credential) private _credentials;

    event Issued(uint256 tokenId, bytes32 hash);

    constructor() ERC721("SoulBoundVC", "SBVC") {
        tokenCounter = 0;
    }

    function issue(address to, bytes32 credentialHash) public onlyOwner {
        uint256 newTokenId = tokenCounter;
        _safeMint(to, newTokenId);
        _credentials[newTokenId] = Credential(credentialHash, false);
        emit Issued(newTokenId, credentialHash);
        tokenCounter += 1;
    }

    function verify(uint256 tokenId, bytes32 credentialHash) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _credentials[tokenId].hash == credentialHash;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        bytes32 credentialHash = _credentials[tokenId].hash;
        bool verified = _credentials[tokenId].verified;

        string memory metadata = string(abi.encodePacked(
            '{"name": "SoulBoundVC #', tokenId.toString(), '", ',
            '"description": "An NFT with a soul-bound verifiable credential.", ',
            '"hash": "', Strings.toHexString(uint256(credentialHash)), '", ',
            '"verified": "', verified ? "true" : "false", '"}'
        ));

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(metadata))));
    }
}
