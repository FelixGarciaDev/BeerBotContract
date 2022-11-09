require('dotenv').config()

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BeerBotClub contract with the address:", deployer.address);
  // contract parameters
  const maxSupply = Number(process.env.bsc_testnet_BmClubMaxSupply);
  const fundsRequired = Number(process.env.bsc_testnet_FundsRequired);
  //const user_id = BigInt(req.params.id);
  //
  //
  // console.log(whiteListeTwoStartBalance)
  //           const weiValue = 20000000000000000000n;
  //           const ethValue = ethers.utils.formatEther(weiValue);            
  //           console.log(ethers.utils.parseEther('20'))
  //           console.log("the bnb value is: "+ethValue)
  //           console.log("The valid amoutn in testnet contract starts from: "+ethers.utils.formatEther(20))
  //           console.log("then we changed to: "+ethers.utils.formatEther(3000000))
  //           console.log("and it should be : "+ethers.utils.formatEther(10000000000000000n))
  const royaltysAddress = process.env.bscTesnetSplitterContractAddress;
  const royaltyPercentage = Number(process.env.bsc_testnet_SplitterContractRoyaltyBasisPoints);
  const mintEconomicsAddresses = process.env.bsc_testnet_MintEconomicsAddresses.split(',');
  const mintEconomicsPercentages = process.env.bsc_testnet_MintEconomicsPercentages.split(',');
  const mintEconomicsIntPercentages = mintEconomicsPercentages.map(str => {
      return Number(str);
  });

  const BeerBotClub = await ethers.getContractFactory("BeerBotClub");
  const deployed = await BeerBotClub.deploy(
    maxSupply,
    fundsRequired,
    royaltysAddress,
    royaltyPercentage,
    mintEconomicsAddresses,
    mintEconomicsIntPercentages
    );

  console.log("BeerBotClub is deployed at:", deployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});