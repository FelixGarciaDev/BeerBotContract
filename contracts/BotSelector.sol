// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract BotSelector{
    // uint decider;    

    // constructor(){        
    // }

    function getDecider(uint maxSupply, uint current, address sender)
    internal
    view
    returns (uint)
        {
            return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % 2;
        }

    function getRandomBotId(uint decider, uint maxSupply, uint8 exoticSupply, uint current, address sender, uint normalLen, uint exoticLen) 
    internal          
    view
    returns(uint)
        {        
            if (current > 250 && (normalLen +  exoticLen) > 2666 && exoticSupply < 3){                
                
                // decider = getDecider(maxSupply, current, msg.sender);

                if (decider == 1){
                    return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % exoticLen;
                }
                if (decider == 0){
                    return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % normalLen;
                }
            }

            if (current > 1333 && (normalLen +  exoticLen) > 1333 && exoticSupply < 6){
                
                // decider = getDecider(maxSupply, current, msg.sender);

                if (decider == 1){
                    return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % exoticLen;
                }
                if (decider == 0){
                    return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % normalLen;
                }
            }

            if (current > 2666 && exoticSupply < 9){
                
                // decider = getDecider(maxSupply, current, msg.sender);

                if (decider == 1){
                    return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % exoticLen;
                }
                if (decider == 0){
                    return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % normalLen;
                }
            }

            return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % normalLen;
        }

}