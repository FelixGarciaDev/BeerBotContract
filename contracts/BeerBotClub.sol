// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BotSelector.sol";

contract BeerBotClub is ERC721, ERC721Royalty, Ownable, BotSelector, PaymentSplitter  {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _idCounter;
    
    bool private pausedByContract;

    bool private onlyWhitelisteds;

    string private _customBaseUri;

    uint16[] private normalNumbers;
    uint16[] private exoticNumbers;

    uint256 public maxSupply;
    uint8 public exoticSupply;

    uint256 public fundsRequired;

    address public royaltysAddress;

    uint16 public royaltyPercentage;

    struct RoyaltyReceiver {
        address splitter;
        uint16 royaltyPercent;
    }

    mapping(uint256 => RoyaltyReceiver) royalties;

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
                    exoticSupply = 0;
                    fundsRequired = _fundsRequired;
                    royaltysAddress = _royaltysAddress;
                    royaltyPercentage = _royaltyPercentage;                    
                    _customBaseUri = "https://api.beerbot.club/";

                    for(uint16 i = 0; i < 9; i++) {
                        exoticNumbers.push(i);
                    }

                    for(uint16 i = 9; i < maxSupply; i++) {
                        normalNumbers.push(i);
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
            require(isPausedByContract(), "Minting NOT paused");
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
            require(isWhileListMode(), "whiteListMode NOT active");
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

    function _totalSupply() 
        public 
        view 
        returns (uint) {
        return _idCounter.current();
    }

    function _totalExoticSupply() 
        public 
        view 
        returns (uint) {
        return exoticSupply;
    }

    // Mint logic

    function actualMint(uint256 _current) 
        internal
        {            
            uint256 randomBotId;            
            uint256 resultNumber;
            uint decider;
            decider = 0;
            // decide from where to pick a number            
            if (_current > 250 && (normalNumbers.length +  exoticNumbers.length) > 2666 && exoticSupply < 3){                
                decider = getDecider(maxSupply, _current, msg.sender);
            }

            if (_current > 1333 && (normalNumbers.length +  exoticNumbers.length) > 1333 && exoticSupply < 6){
                decider = getDecider(maxSupply, _current, msg.sender);
            }

            if (_current > 2666 && exoticSupply < 9){
                decider = getDecider(maxSupply, _current, msg.sender);
            }

            // Generate a random bot id            
            //randomBotId = getRandomBotId(decider, maxSupply, exoticSupply, _current, msg.sender, normalNumbers.length, exoticNumbers.length);
            randomBotId = getRandomBotId(decider, maxSupply, exoticSupply, _current, msg.sender, normalNumbers.length, exoticNumbers.length);
            if (decider == 1){
                resultNumber = exoticNumbers[randomBotId];
                exoticNumbers[randomBotId] = exoticNumbers[exoticNumbers.length - 1];
                exoticNumbers.pop();
            } else {
                resultNumber = normalNumbers[randomBotId];
                normalNumbers[randomBotId] = normalNumbers[normalNumbers.length - 1];            
                normalNumbers.pop();
            }            
            // Set Royalties
            royalties[resultNumber] = RoyaltyReceiver({
                splitter: getRoyaltyAddress(),
                royaltyPercent: royaltyPercentage
            });
            // Mint the ramdon bot
            _safeMint(msg.sender, resultNumber);
            _idCounter.increment();      
            if (resultNumber >= 0 && resultNumber <= 8){
                exoticSupply++;
            }      
            if ((_idCounter.current() == 1333 || _idCounter.current() == 2666) && !isPausedByContract()){
                pauseByContract();
            }            
        }
    

    function mint(uint256 _amount) 
        public
        payable
        {
            require(!isPausedByContract(), "minting is paused");            
            // _idCounter to uint
            uint256 current;            
            current = _idCounter.current();                       
            require(current < maxSupply, "BEERBOTS SOLD OUT!");            
            require(_amount > 0 && _amount <= 10, "Invalid amount");
            require(current + _amount <= maxSupply, "Mint less BeerBots");
            require(msg.value >= fundsRequired*_amount,"Need more funds");
            
            if (onlyWhitelisteds == true){
                require(addressIsWhiteListed(msg.sender), "You are not whitelisted");
                actualMint(current);                
            }
            
            for (uint8 i = 0; i < _amount; i++) {
                actualMint(current);
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
            return string(abi.encodePacked(_baseURI(), tokenId.toString()));            
        }

        

    function withdraw() 
        external 
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

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721)
        {
            super._beforeTokenTransfer(from, to, tokenId);
            
        }
    
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721Royalty)
        {
            super._burn(tokenId);
        }

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
        }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Royalty)
        returns (bool)
        {
            return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
        }
    
    function setRoyaltyInfo(address _receiver, uint16 _royaltyFeesInBps) 
        external 
        onlyOwner 
        {
            royaltysAddress = _receiver;
            royaltyPercentage = _royaltyFeesInBps;
        }

}