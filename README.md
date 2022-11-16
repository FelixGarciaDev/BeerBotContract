# BeerBot CLub contract

This contract was deployed on bnb chain.
```
BNB chain tesnet Contract address = 0x6cFDd82Cf27637Bc8467d889C28efb69A2c84bc9
```
intract with it in explorer [https://testnet.bscscan.com/address/0xe5f4e0d7d7118950bf4f2d2512c0c1d24fc467b2](https://testnet.bscscan.com/address/0xe5f4e0d7d7118950bf4f2d2512c0c1d24fc467b2).

### About this contract

This contract is one of the 3 contracts that make up the foundations of BeerBot Club.

- BeerBotClub Contract (the contract on this repo)
- [Team Splitter Contract](https://github.com/FelixGarciaDev/BeerBotSplitter)
- [Holders Splitter Contract](https://github.com/FelixGarciaDev/BeerBotHoldersSplitter)

This ERC-721 contract have some particularities like: 

- Allow minting for a limited time to whitelisted addresses only
- Pausing by rounds of 1333 mints each one

For more information about the BeerBot Club you can read [its whitepaper](https://beerbot.club/WhitepaperBeerBotClub.pdf)

### What does this contract do?
- Set BaseURI
- Set the required token amount for mint
- Set the royalties info
- Pause mint and other functions by rounds
- Pause mint and other functions at owner's will
- Add addresses to a whitelist
- And of course, Minting ;)
