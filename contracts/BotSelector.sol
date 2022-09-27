// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract BotSelector{

    function getRandomBotId(uint number, uint current, address sender, uint256 modBy) 
    internal 
    view 
    returns(uint)
        {
            return uint(keccak256(abi.encodePacked(number, current, sender, block.number, block.difficulty))) % modBy;
        }

}