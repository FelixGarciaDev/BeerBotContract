var fs = require('fs')

const contractPath = "./artifacts/contracts/BeerBotCLub.sol/BeerBotClub.json";
const obj = JSON.parse(fs.readFileSync(contractPath));
const size = Buffer.byteLength(obj.deployedBytecode, 'utf8') / 2;
console.log('contract size is', size);

//24576 is the limit