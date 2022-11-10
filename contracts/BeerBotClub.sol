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
import "./BotSelector.sol";
import "./SelfPausable.sol";

contract BeerBotClub is ERC721, ERC721Enumerable, ERC721Royalty, Ownable, BotSelector, PaymentSplitter  {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _idCounter;
    
    bool private pausedByContract;

    bool private onlyWhitelisteds;

    uint256 public maxSupply;

    uint256 public fundsRequired;

    address public royaltysAddress;

    uint16 public royaltyPercentage;

    string private _customBaseUri;

    struct RoyaltyReceiver {
        address splitter;
        uint16 royaltyPercent;
    }

    mapping(uint256 => RoyaltyReceiver) royalties;

    uint16[] private _randomNumbers;

    mapping(address => uint8) public availableMintsForWhitelisteds;


    constructor(uint16 _maxSupply, 
                uint256 _fundsRequired, 
                address _royaltysAddress, 
                uint16 _royaltyPercentage, 
                address[] memory _payees, 
                uint256[] memory  _shares) 
                ERC721("BeerBot", "BBCLUB") 
                PaymentSplitter(_payees, _shares)
                payable
                {
                    pausedByContract = true;
                    onlyWhitelisteds = true;
                    maxSupply = _maxSupply;
                    fundsRequired = _fundsRequired;
                    royaltysAddress = _royaltysAddress;
                    royaltyPercentage = _royaltyPercentage;
                    _customBaseUri = "https://api.beerbot.club/";
                    for(uint16 i = 0; i < _maxSupply; i++) {
                        _randomNumbers.push(i);
                    }
                }

    function setBaseURI (string memory customBaseUri_) 
        external 
        onlyOwner
        {
            _customBaseUri = customBaseUri_;
        }

    function publicURI()
        external
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
        external        
        onlyOwner{
            fundsRequired = _newFundsRequired;
        }

    function getRequiredFunds()
        external
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

    // pause logic

    function pauseByContract()
        internal
        {
            pausedByContract = !pausedByContract;
        }

    function changePauseStatus()
        external
        onlyOwner
        {            
            pausedByContract = !pausedByContract;
        }


    function unpauseByContract()
        external
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

    // White list logic

    function unableWhiteListMode()
        external
        onlyOwner
        {
            bool whiteListModeStatus = isWhileListMode();
            require(whiteListModeStatus == true, "BeerBotClub: whiteListMode is NOT active");
            onlyWhitelisteds = !onlyWhitelisteds;
        }
    
    function isWhileListMode()
        public
        view
        returns (bool)
    {
        return onlyWhitelisteds;
    }    

    function setWhiteListedAddresses(address[] memory _whiteListeds)
        external
        onlyOwner
        {
            for(uint16 i = 0; i < _whiteListeds.length; i++) {
                availableMintsForWhitelisteds[_whiteListeds[i]] = 1;
            }
        }

    function addressIsWhiteListed(address _walletAddress)
        public
        view
        returns (bool)                
    {
        return isWhileListMode() && availableMintsForWhitelisteds[_walletAddress] == 1 ? true : false;   
    }

    // Mint logic

    function actualMint(uint256 _current ) 
        internal
        {
            uint256 modBy;
            uint256 randomBotId;            
            uint256 resultNumber;
            // generate a random bot id
            modBy = _randomNumbers.length;
            randomBotId = getRandomBotId(maxSupply, _current, msg.sender, modBy);            
            resultNumber = _randomNumbers[randomBotId];
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
            // pause minting logic
            // 1332, 2665, 3998
            if ((_idCounter.current() == 1332 || _idCounter.current() == 2665) && !isPausedByContract()){
                pauseByContract();
            }            
        }
    

    function mint() 
        public
        payable
        {
            uint256 current;
            require(!isPausedByContract(), "BeerBotClub: minting is paused");
            current = _idCounter.current();           
            require(current < maxSupply, "BeerBotClub: BEERBOTS SOLD OUT!");
            require(msg.value >= fundsRequired,"BeerBotClub: You need more funds to mint more BeerBots");
            // whiteList minting
            if (onlyWhitelisteds == true){
                require(addressIsWhiteListed(msg.sender), "You are not whitelisted, wait for the whitelist mode to end");
                actualMint(current);                
            }
            // normal minting
            actualMint(current);
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
            return string(abi.encodePacked(baseURI, tokenId.toString()));            
        }

        

    function withdraw() 
        public 
        payable
        onlyOwner        
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