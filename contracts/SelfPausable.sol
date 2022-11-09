// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SelfPausable is Ownable{
    bool private pausedByContract;

    constructor()
        {
            pausedByContract = true;
        }

    function pauseByContract()
        public
        onlyOwner
        {
            pausedByContract = !pausedByContract;
        }

    function unpauseByContract()
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

}