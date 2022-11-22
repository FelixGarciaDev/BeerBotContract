require('dotenv').config()

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BeerBotClub contract with the address:", deployer.address);
  const maxSupply = Number(process.env.bsc_mainnet_BmClubMaxSupply);
  const fundsRequired = BigInt(process.env.bsc_mainnet_FundsRequired);
  const royaltysAddress = process.env.bsc_mainnet_SplitterContractAddress;
  const royaltyPercentage = Number(process.env.bsc_mainnet_SplitterContractRoyaltyBasisPoints);
  const mintEconomicsAddresses = process.env.bsc_mainnet_MintEconomicsAddresses.split(',');
  const mintEconomicsPercentages = process.env.bsc_mainnet_MintEconomicsPercentages.split(',');
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});