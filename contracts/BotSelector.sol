// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract BotSelector{

    function getDecider(uint maxSupply, uint current, address sender)
    internal
    view
    returns (uint)
        {
            return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % 2;
        }

    function getRandomBotId(uint decider, uint maxSupply, uint current, address sender, uint normalLen, uint exoticLen) 
    internal          
    view
    returns(uint)
        {        
            if (decider == 1){
                return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % exoticLen;
            }
            if (decider == 0){
                return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % normalLen;
            }

            return uint(keccak256(abi.encodePacked(maxSupply, current, sender, block.number, block.difficulty))) % normalLen;
        }

}