// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Base64.sol";
import "./BotSelector.sol";

contract BeerBotClub is ERC721, ERC721Enumerable, ERC721Royalty, Ownable, Pausable, BotSelector, PaymentSplitter  {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _idCounter;
    
    bool private pausedByContract;

    uint256 public maxSupply;

    uint256 public fundsRequired;

    address public royaltysAddress;

    uint16 public royaltyPercentage;

    struct RoyaltyReceiver {
        address splitter;
        uint16 royaltyPercent;
    }

    mapping(uint256 => RoyaltyReceiver) royalties;

    uint16[] private _randomNumbers;

    string private _customBaseUri;

    constructor(uint16 _maxSupply, 
                uint256 _fundsRequired, 
                address _royaltysAddress, 
                uint16 _royaltyPercentage, 
                address[] memory _payees, 
                uint256[] memory  _shares) 
                ERC721("BmBots", "BMBOTS") 
                PaymentSplitter(_payees, _shares)
                payable
                {
                    pausedByContract = false;
                    maxSupply = _maxSupply;
                    fundsRequired = _fundsRequired;
                    royaltysAddress = _royaltysAddress;
                    royaltyPercentage = _royaltyPercentage;
                    _customBaseUri = "https://bmbot.io/bmbots/";
                    for(uint16 i = 0; i < _maxSupply; i++) {
                        _randomNumbers.push(i);
                    }
                }

    function setBaseURI (string memory customBaseUri_) 
        public 
        onlyOwner
        {
            _customBaseUri = customBaseUri_;
        }

    function publicURI()
        public
        view
        returns (string memory)
        {
          return _customBaseUri;
        }

    function _baseURI() 
        internal 
        view
        override 
        returns (string memory) 
        {
            return _customBaseUri;
        }

    function setRequiredFunds(uint256 _newFundsRequired)
        public        
        onlyOwner{
            fundsRequired = _newFundsRequired;
        }

    function getRequiredFunds()
        public
        view
        returns (uint256 requiredfunds)
        {
            return fundsRequired;
        }

    function getRoyaltyAddress()
        internal
        view
        returns (address royaltyAddress)
        {
            return royaltysAddress;
        }

    function getCurrentNumberOfBots()
        public
        view
        returns (uint256 numberOfBots)
        {
            return _idCounter.current();
        }

    function pause() 
        public 
        onlyOwner 
        {
            _pause();
        }

    function unpause() 
        public 
        onlyOwner 
        {
            _unpause();
        }

    function pauseByContract()
        internal
        {
            pausedByContract = !pausedByContract;
        }

    function unpauseContract()
        public
        onlyOwner
        {
            bool pauseStatus = isPausedByContract();
            require(pauseStatus == true, "BmClub: minting is NOT paused");
            pausedByContract = !pausedByContract;
        }

    function isPausedByContract()
        public
        view
        returns (bool)
        {
            return pausedByContract;
        }


    function mint() 
        public
        payable
        {
            uint256 current = _idCounter.current();            
            require(!isPausedByContract(), "BmClub: minting is paused");            
            require(current < maxSupply, "No BmBots left :(");
            require(msg.value >= fundsRequired,"you need more MATIC to mint the BmBots");
            //--------------------------------------------------------------------------
            // generate a random bot id
            uint256 modBy = _randomNumbers.length;
            uint256 randomBotId = getRandomBotId(maxSupply, current, msg.sender, modBy);            
            uint256 resultNumber = _randomNumbers[randomBotId];
            _randomNumbers[randomBotId] = _randomNumbers[_randomNumbers.length - 1];            
            _randomNumbers.pop();
            // // Set Royalties
            royalties[randomBotId] = RoyaltyReceiver({
                splitter: getRoyaltyAddress(),
                royaltyPercent: royaltyPercentage
            });
            // mint the ramdon bot
            _safeMint(msg.sender, resultNumber);
            _idCounter.increment();
            //--------------------------------------------------------------------------
            // pause minting logic
            // 1332, 2665, 3998
            if (_idCounter.current() == 1332){
                pauseByContract();
            }
            if (_idCounter.current() == 2665){
                pauseByContract();
            }
        }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
        {
            require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

            string memory baseURI = _baseURI();
            string memory jsonURI = Base64.encode(abi.encodePacked(baseURI, tokenId.toString()));

            return string(abi.encodePacked("data:application/json;base64,", jsonURI));
        }

    function withdraw() 
        public 
        payable
        onlyOwner
        whenNotPaused
        {
            (bool sent, ) = payable(msg.sender).call{value: address(this).balance}("");
            require(sent, "Withdraw failed");
        }

    function release(address payable account) 
        public 
        virtual 
        override
        onlyOwner
        {
            super.release(account);
        }


    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
        {
            super._beforeTokenTransfer(from, to, tokenId);
            
        }
    
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721Royalty)
        {
            super._burn(tokenId);
        }

    // The following functions are for royalty info

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        public
        view
        virtual
        override
        returns (address receiver, uint256 royaltyAmount)
        {
            require(_exists(_tokenId), "Nonexistent token");
            receiver = royalties[_tokenId].splitter;
            royaltyAmount = (royalties[_tokenId].royaltyPercent * _salePrice) / 10000;

            return (receiver, royaltyAmount);
            //return (royaltysAddress, calculateRoyalty(_salePrice));
        }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
        {
            return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
        }
    
    function setRoyaltyInfo(address _receiver, uint16 _royaltyFeesInBips) 
        public 
        onlyOwner 
        {
            royaltysAddress = _receiver;
            royaltyPercentage = _royaltyFeesInBips;
        }

}