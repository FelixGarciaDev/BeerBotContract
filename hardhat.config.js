require('dotenv').config()
require("@nomiclabs/hardhat-waffle");

//require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: false
      }
    }
  },
  mocha: {
    timeout: 100000000
  },
  networks: {    
    polygon_mumbai: {
      url: process.env.polygon_mumbai_url,
      accounts: [
        process.env.polygon_mumbai_account
      ]
    }
  }
};