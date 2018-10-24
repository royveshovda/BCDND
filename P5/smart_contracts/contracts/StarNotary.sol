pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 { 
    struct Star { 
        string name;
        string dec;
        string mag;
        string cent;      
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStar; 
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => uint256) public starCoordinatesToTokenId;

    function createStar(string _name, string _dec, string _mag, string _cent, string _story, uint256 _tokenId) public { 
        require(checkIfStarExist(_dec, _mag, _cent) == false, "This start does already exists.");
        require(_exists(_tokenId) == false, "This token has already been used.");

        Star memory newStar = Star(_name, _dec, _mag, _cent, _story);
        bytes32 starCoordinates = starCoordinatesToSingleString(_dec, _mag, _cent);
        starCoordinatesToTokenId[starCoordinates] = _tokenId;
        
        tokenIdToStar[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function checkIfStarExist(string dec, string mag, string cent) public view returns (bool) {
        bytes32 starCoordinates = starCoordinatesToSingleString(dec, mag, cent);
        return starCoordinatesToTokenId[starCoordinates] != 0;
    }

    function starCoordinatesToSingleString(string dec, string mag, string cent) private pure returns (bytes32) {
        bytes memory coordinates = bytes(string(abi.encodePacked(dec, mag, cent)));
        bytes32 coordinatesHash = keccak256(coordinates);
        return coordinatesHash;
    }

    function tokenIdToStarInfo(uint256 _tokenId) public view returns(string name, string story, string deg, string mag, string cent) {
        Star memory s = tokenIdToStar[_tokenId];
        return (s.name, s.story, s.dec, s.mag, s.cent);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }
}