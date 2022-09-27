require('dotenv').config()

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BeerBotClub contract with the address:", deployer.address);
  // contract parameters
  const maxSupply = Number(process.env.BmClubMaxSupply);
  const fundsRequired = Number(process.env.MaticFundsRequired);
  const royaltysAddress = process.env.mumbaiSplitterContractAddress;
  const royaltyPercentage = Number(process.env.SplitterContractRoyaltyBasisPoints);
  const mintEconomicsAddresses = process.env.mumbaiMintEconomicsAddresses.split(',');
  const mintEconomicsPercentages = process.env.mumbaiMintEconomicsPercentages.split(',');
  const mintEconomicsIntPercentages = mintEconomicsPercentages.map(str => {
      return Number(str);
  });

  const BeerBotClub = await ethers.getContractFactory("BeerBotClub");
  const deployed = await BeerBotClub.deploy(maxSupply,
                                            fundsRequired,
                                            royaltysAddress,
                                            royaltyPercentage,
                                            mintEconomicsAddresses,
                                            mintEconomicsIntPercentages);

  console.log("BeerBotClub is deployed at:", deployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});