require('dotenv').config();
const { expect } = require("chai");
// const { BigNumber } = require('ethers');

// pause checkpoint // 1332, 2665, 3998

//                             30000000n
//                    43843885000000000n
//    0.02 MATIC      20000000000000000n
//    0.30 MATIC     300000000000000000n
//    1    MATIC    1000000000000000000n
//   20    MATIC   20000000000000000000n
//               9999943843885000000000n  

describe("BeerBotClub Collection", () => {
    const setuprBeerBotClub = async ({ 
        maxSupply = 3999,
        fundsRequiredInWeis = 20000000000000000000n, 
        SplitterContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
        SplitterContractPercentage = 700,
        
        mintEconomicsAddresses = [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // creator
            "0x976EA74026E726554dB657fA54763abd0C3a0aa9", // holders
            "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", // project
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // leadDude
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // devDude
        ], 
        mintEconomicsPercentages = [
            7,
            75,
            10,
            5,
            3
        ]
    }) => {
        const [
            creator, 
            leadDude, 
            artirstDude, 
            devDude, 
            someDudeOne, 
            somdeDudeTwo, 
            holders, 
            project,
            whiteListeOne,
            whiteListeTwo,
        ] = await ethers.getSigners();
        
        const BeerBotClub = await ethers.getContractFactory("BeerBotClub");
        const deplyedBeerBotClub = await BeerBotClub.deploy(
            maxSupply, 
            fundsRequiredInWeis, 
            SplitterContractAddress, 
            SplitterContractPercentage, 
            mintEconomicsAddresses, 
            mintEconomicsPercentages
        );

        return {
            creator,
            leadDude,
            artirstDude,
            devDude,
            someDudeOne,
            somdeDudeTwo,
            holders,
            project,            
            whiteListeOne,
            whiteListeTwo,
            deplyedBeerBotClub
        };
    }

    describe("Deployment... Pausing... WhiteListing... Minting...", () => {
        it("Deploys BeerBotClub and Splitter contracts correctly", async () => {
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
            
            console.log("BeerBotClub deployed at... " + deplyedBeerBotClub.address);
        });

        it("Sets max supply to passed param", async () => {
            const maxSupply = 2000;
      
            const { deplyedBeerBotClub } = await setuprBeerBotClub({ maxSupply });
      
            const returnedMaxSupply = await deplyedBeerBotClub.maxSupply();
            expect(maxSupply).to.equal(returnedMaxSupply);
        });

        it ("Only owner can set the whitelisted addresses", async () => {
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
            // whiteList some addresses
            whiteListedAddresses = [whiteListeOne.address, whiteListeTwo.address]
            await expect(deplyedBeerBotClub.connect(somdeDudeTwo).setWhiteListedAddresses(whiteListedAddresses)).to.be.revertedWith('Ownable: caller is not the owner');
            await deplyedBeerBotClub.connect(creator).setWhiteListedAddresses(whiteListedAddresses);
        });        

        it("Only owner can unpause contract", async () =>{
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
            // query the pause status
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            // at start it must be true
            expect(pauseStatus).to.equal(true);
            // try to change the pause status with random address
            await expect(deplyedBeerBotClub.connect(someDudeOne).unpauseByContract()).to.be.revertedWith('Ownable: caller is not the owner');            
            // change pause status
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(false);
        });

        it("Whitelisted addresses CANT mint while pause status is true\n Whitelisted addresses CAN mint while pause status is false\n NOT whitelisted addresses CANT mint even if pause status is false\n ANYONE CAN mint when whitelist mode is false and pause status is false\n NOBODY can mint when whitelist mode is false and pause status is true", async () =>{
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });

            // query the pause status            
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()

            // query the onlyWhitelisteds mode
            whielistModeStatus = await deplyedBeerBotClub.connect(creator).isWhileListMode()

            // at start both must be true
            expect(pauseStatus).to.equal(true);
            expect(whielistModeStatus).to.equal(true);

            // whiteList some addresses, only owner can do that
            whiteListedAddresses = [whiteListeOne.address, whiteListeTwo.address]
            await expect(deplyedBeerBotClub.connect(somdeDudeTwo).setWhiteListedAddresses(whiteListedAddresses)).to.be.revertedWith('Ownable: caller is not the owner');
            await deplyedBeerBotClub.connect(creator).setWhiteListedAddresses(whiteListedAddresses);
            // console.log(await deplyedBeerBotClub.connect(creator).addressIsWhiteListed(creator.address))
            // console.log(await deplyedBeerBotClub.connect(creator).addressIsWhiteListed(someDudeOne.address))
            // console.log(await deplyedBeerBotClub.connect(creator).addressIsWhiteListed(whiteListeOne.address))
            // console.log(await deplyedBeerBotClub.connect(creator).addressIsWhiteListed(whiteListeTwo.address))

            // Whitelisted addresses CANT mint while pause status is true
            await expect(deplyedBeerBotClub.connect(whiteListeOne).mint({
                from: whiteListeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("BeerBotClub: minting is paused");

            // change pause status, only owner can do that
            await expect(deplyedBeerBotClub.connect(someDudeOne).unpauseByContract()).to.be.revertedWith('Ownable: caller is not the owner');
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(true);
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(false);

            // Whitelisted addresses CAN mint while pause status is false
            deplyedBeerBotClub.connect(whiteListeOne).mint({
                from: whiteListeOne.address,
                value: ethers.utils.parseEther('20'),
            });

            // NOT whitelisted addresses CANT mint even if pause status is false
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("You are not whitelisted, wait for the whitelist mode to end");

            // change whitelist mode status, only owner can do that
            await expect(deplyedBeerBotClub.connect(someDudeOne).unableWhiteListMode()).to.be.revertedWith('Ownable: caller is not the owner');
            whielistModeStatus = await deplyedBeerBotClub.connect(creator).isWhileListMode()
            expect(whielistModeStatus).to.equal(true);
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()
            whielistModeStatus = await deplyedBeerBotClub.connect(creator).isWhileListMode()
            expect(whielistModeStatus).to.equal(false);

            // ANYONE CAN mint when whitelist mode is false and pause status is false           
            await deplyedBeerBotClub.connect(whiteListeTwo).mint({
                from: whiteListeTwo.address,
                value: ethers.utils.parseEther('20'),
            });

            await deplyedBeerBotClub.connect(somdeDudeTwo).mint({
                from: somdeDudeTwo.address,
                value: ethers.utils.parseEther('20'),
            });

            // pause again
            await deplyedBeerBotClub.connect(creator).changePauseStatus()
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(true);

            // NOBODY can mint when whitelist mode is false and pause status is true
            await expect(deplyedBeerBotClub.connect(whiteListeOne).mint({
                from: whiteListeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("BeerBotClub: minting is paused");

            await expect(deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("BeerBotClub: minting is paused");
        });

        it("Whilisted addresses in whitelisted mode only can mint up to five times", async () =>{
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });

            // query the pause status
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()

            // query the onlyWhitelisteds mode
            whielistModeStatus = await deplyedBeerBotClub.connect(creator).isWhileListMode()

            // at start both must be true
            expect(pauseStatus).to.equal(true);
            expect(whielistModeStatus).to.equal(true);

            // whiteList some addresses
            whiteListedAddresses = [whiteListeOne.address, whiteListeTwo.address]
            await expect(deplyedBeerBotClub.connect(somdeDudeTwo).setWhiteListedAddresses(whiteListedAddresses)).to.be.revertedWith('Ownable: caller is not the owner');
            await deplyedBeerBotClub.connect(creator).setWhiteListedAddresses(whiteListedAddresses);

            // Whitelisted addresses CANT mint while pause status is true
            await expect(deplyedBeerBotClub.connect(whiteListeTwo).mint({
                from: whiteListeTwo.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("BeerBotClub: minting is paused");

            // change pause status
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(false);

            // Whitelisted addresses CAN mint while pause status is false
            // Same addresses can mint five times or even more
            await Promise.all([              
                deplyedBeerBotClub.connect(whiteListeOne).mint({
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint({
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint({
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint({
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint({
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
            ]);

        });

        it("Has a minting limit", async () => {
            const maxSupply = 2;      
            const { creator, deplyedBeerBotClub } = await setuprBeerBotClub({ maxSupply });
            // unpause contract
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            // unable whitelist mode
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()
            // Mint all
            await Promise.all([              
              deplyedBeerBotClub.connect(creator).mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
              }),
              deplyedBeerBotClub.connect(creator).mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
              })
            ]);
      
            // Assert the last minting
            await expect(deplyedBeerBotClub.connect(creator).mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("BeerBotClub: BEERBOTS SOLD OUT!");
        });

        it("The amout of needed BNB can change... and only owner can change it", async () => {
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
            const provider = ethers.provider;
            // unpause contract
            await deplyedBeerBotClub.connect(creator).unpauseByContract()

            // unable whitelist mode
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()

            // check the original amount
            originalAmount = await deplyedBeerBotClub.connect(creator).getRequiredFunds();
            await expect(originalAmount).to.eq(ethers.utils.parseEther('20'));

            // let whiteListeTwoStartBalance = await provider.getBalance(holders.address);
            // console.log(whiteListeTwoStartBalance)
            // const weiValue = 20000000000000000000n;
            // const ethValue = ethers.utils.formatEther(weiValue);            
            // console.log(ethers.utils.parseEther('20'))
            // console.log("the bnb value is: "+ethValue)
            // console.log("The valid amoutn in testnet contract starts from: "+ethers.utils.formatEther(20))
            // console.log("then we changed to: "+ethers.utils.formatEther(3000000))
            // console.log("and it should be : "+ethers.utils.formatEther(10000000000000000n))
                        
            // mint the with required funds
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            }))

            // Try to mint with less of the required funds
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('10'),
            })).to.be.revertedWith("BeerBotClub: You need more funds to mint more BeerBots");

            // change the required amount, only owner can do this
            // await expect(deplyedBeerBotClub.connect(somdeDudeTwo).setRequiredFunds(35000000000000000000n)).to.be.revertedWith("Ownable: caller is not the owner" ); 
            // await deplyedBeerBotClub.connect(creator).setRequiredFunds(20000000000000000000n);
            await expect(deplyedBeerBotClub.connect(somdeDudeTwo).setRequiredFunds(ethers.utils.parseEther('30'))).to.be.revertedWith("Ownable: caller is not the owner" );
            await deplyedBeerBotClub.connect(creator).setRequiredFunds(ethers.utils.parseEther('30'));
            newAmount = await deplyedBeerBotClub.connect(creator).getRequiredFunds();
            await expect(newAmount).to.eq(ethers.utils.parseEther('30'));

            // Try to mint with less of the required funds AGAIN
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('10'),
            })).to.be.revertedWith("BeerBotClub: You need more funds to mint more BeerBots");

            // mint the with required funds
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('30'),
            }))

        });

    });
    
    describe("customBaseURI...", () => {
        it("The original baseURI is correct", async () => {            
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });            
    
            const baseURI = await deplyedBeerBotClub.publicURI();
            // const stringifiedTokenURI = await tokenURI.toString();
            const expectedBaseURI = "https://api.beerbot.club/";
            
            expect(expectedBaseURI).to.equal(baseURI);
        });
    
        it("BaseURI can change and only owner can change it", async () => {
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
            
            // Checl original base uri
            const baseURI = await deplyedBeerBotClub.publicURI();
            const expectedBaseURI = "https://api.beerbot.club/";          
            expect(expectedBaseURI).to.equal(baseURI);

            // Only owner can changes the uri
            await expect(deplyedBeerBotClub.connect(somdeDudeTwo).setBaseURI("https://someDudeOneURI/")).to.be.revertedWith('Ownable: caller is not the owner');

            // Change the uri        
            await deplyedBeerBotClub.connect(creator).setBaseURI("ipfs://someIpfsKey/bmbots/")
            const newBaseURI = await deplyedBeerBotClub.publicURI();
            const expectedNewBaseURI = "ipfs://someIpfsKey/bmbots/";
            
            expect(expectedNewBaseURI).to.equal(newBaseURI);
        });
    
      });

    describe("Mint Economics...", async () => {
        it("Only creator splits the bmclub contract balance", async () => {
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
            // unpause contract
            await deplyedBeerBotClub.connect(creator).unpauseByContract()

            // unable whitelist mode
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()

            const provider = ethers.provider;

            let creatorStartBalance = await provider.getBalance(creator.address);
            let leadStartBalance = await provider.getBalance(leadDude.address);
            let artistStartBalance = await provider.getBalance(artirstDude.address);
            let devStartBalance = await provider.getBalance(devDude.address);
            let holdersStartBalance = await provider.getBalance(holders.address);
            let projectStartBalance = await provider.getBalance(project.address);

            // console.log("creatorBalance... "+creatorStartBalance);
            // console.log("leadBalance... "+leadStartBalance);
            // console.log("artistBalance... "+artistStartBalance);
            // console.log("devBalance... "+devStartBalance);
            // console.log("holdersBalance... "+holdersStartBalance);
            // console.log("projectBalance... "+projectStartBalance);
      
            await Promise.all([
                deplyedBeerBotClub.connect(somdeDudeTwo).mint({
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('20'),
                }), 
                deplyedBeerBotClub.connect(somdeDudeTwo).mint({
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('20'),
                })
            ]);
            
            let contractBalance = await provider.getBalance(deplyedBeerBotClub.address);
            const holderShare = contractBalance.mul(ethers.utils.parseEther('75')).div(ethers.utils.parseEther('100'));
            const projectShare = contractBalance.mul(ethers.utils.parseEther('10')).div(ethers.utils.parseEther('100'));
            const leadShare = contractBalance.mul(ethers.utils.parseEther('5')).div(ethers.utils.parseEther('100'));
            const devShare = contractBalance.mul(ethers.utils.parseEther('3')).div(ethers.utils.parseEther('100'));
            const creatorShare = contractBalance.mul(ethers.utils.parseEther('7')).div(ethers.utils.parseEther('100'));
            
            // console.log("contrac balance... " + contractBalance);
            // console.log("creatorShare... " + holderShare);
            // console.log("projectShare... " + projectShare);
            // console.log("leadShare... " + leadShare);
            // console.log("devShare... " + devShare);
            // console.log("creatorShare... " + creatorShare);
            // console.log("...")

            await expect(deplyedBeerBotClub.connect(someDudeOne)["release(address)"](holders.address)).to.be.revertedWith("Ownable: caller is not the owner" );
            let tx = await deplyedBeerBotClub.connect(creator)["release(address)"](holders.address);
            let receipt = await tx.wait();
            let gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice);

            tx = await deplyedBeerBotClub.connect(creator)["release(address)"](project.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));

            tx = await deplyedBeerBotClub.connect(creator)["release(address)"](leadDude.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));
            
            tx = await deplyedBeerBotClub.connect(creator)["release(address)"](devDude.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));

            tx = await deplyedBeerBotClub.connect(creator)["release(address)"](creator.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));
            
            contractBalance = await provider.getBalance(deplyedBeerBotClub.address);
            let creatorBalance = await provider.getBalance(creator.address);
            let leadBalance = await provider.getBalance(leadDude.address);
            let artistBalance = await provider.getBalance(artirstDude.address);
            let devBalance = await provider.getBalance(devDude.address);
            let holdersBalance = await provider.getBalance(holders.address);
            let projectBalance = await provider.getBalance(project.address);

            // console.log("contrac balance... " + contractBalance);
            // console.log("creatorBalance... "+creatorBalance);
            // console.log("leadBalance... "+leadBalance);
            // console.log("artistBalance... "+artistBalance);
            // console.log("devBalance... "+devBalance);
            // console.log("holdersBalance... "+holdersBalance);
            // console.log("projectBalance... "+projectBalance);

            expect(await contractBalance).to.eq(ethers.utils.parseEther('0'));
            expect(await leadBalance).to.eq(leadStartBalance.add(leadShare));
            expect(await devBalance).to.eq(devStartBalance.add(devShare));
            expect(await projectBalance).to.eq(projectStartBalance.add(projectShare));
            expect(await holdersBalance).to.eq(holdersStartBalance.add(holderShare));
            expect(await creatorBalance).to.eq(creatorStartBalance.add(creatorShare).sub(gasSpent));

        });
    });

    describe("Royalties...", async () => {
        it("Should support the ERC721 and ERC2981 standards and tokens should return the correct royalty info", async () => {
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
            // unpause contract
            await deplyedBeerBotClub.connect(creator).unpauseByContract()

            // unable whitelist mode
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()

            //
            const ERC721InterfaceId = "0x80ac58cd";
            const ERC2981InterfaceId = "0x2a55205a";
            var isERC721 = await deplyedBeerBotClub.supportsInterface(ERC721InterfaceId);
            var isER2981 = await deplyedBeerBotClub.supportsInterface(ERC2981InterfaceId); 
            expect(isERC721).to.equal(true);
            expect(isER2981).to.equal(true);

            //
            const SplitterContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";            
            const tx = await deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            });
            let receipt = await tx.wait();
            info = receipt.logs[0]
            let tokenMintedId = parseInt(Number(info.topics[3]))
            const tokenCeroRoyaltyInfo = await deplyedBeerBotClub.royaltyInfo(tokenMintedId, 100);
            expect(tokenCeroRoyaltyInfo[0]).to.equal(SplitterContractAddress);
            expect(tokenCeroRoyaltyInfo[1].toNumber()).to.equal(7)
        });

    });

    describe("Withdraws...", async () => {
        it("Withdraws the correct balance to the correct address", async () => {
            const { 
                creator, 
                leadDude, 
                artirstDude, 
                devDude, 
                someDudeOne, 
                somdeDudeTwo, 
                holders, 
                project, 
                whiteListeOne,  
                whiteListeTwo, 
                deplyedBeerBotClub 
            } = await setuprBeerBotClub({ });
        
            // unpause contract
            await deplyedBeerBotClub.connect(creator).unpauseByContract()

            // unable whitelist mode
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()

            await Promise.all([
                deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
                }), 
                deplyedBeerBotClub.connect(someDudeOne).mint({
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
                })
            ]);
        
            const provider = ethers.provider;
            let balanceStart = await provider.getBalance(creator.address);
            const tx = await deplyedBeerBotClub.connect(creator).withdraw();
            const receipt = await tx.wait();
            const gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            expectedBalance = balanceStart.add(ethers.utils.parseEther('40'));
            expect(await creator.getBalance()).to.eq(expectedBalance.sub(gasSpent));

        });
        
        it("Only creator can withdraw the funds", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deplyedBeerBotClub } = await setuprBeerBotClub({ });
    
          await expect(deplyedBeerBotClub.connect(somdeDudeTwo).withdraw()).to.be.revertedWith("Ownable: caller is not the owner" );
        });
    });



// //------------------------------------------------------------------------------------------------------------------------------------

// describe("All bots can be minted...", () => {
//     const setuprBeerBotClub = async ({ 
//         maxSupply = 3999, 
//         fundsRequiredInWeis = 20000000000000000000n, 
//         SplitterContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
//         SplitterContractPercentage = 700,
        
//         mintEconomicsAddresses = [
//             "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // creator
//             "0x976EA74026E726554dB657fA54763abd0C3a0aa9", // holders
//             "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", // project
//             "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // leadDude
//             "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // devDude
//         ], 
//         mintEconomicsPercentages = [
//             7,
//             75,
//             10,
//             5,
//             3
//         ]
//     }) => {
//         const [creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, , 
//             somdeDudethree, somdeDudeFour, someDudeFive, someDudeSix, someDudeSeven, 
//             someDudeEight, someDudeNine, SomeDudeTen, someDudeEleven, holders, project] = await ethers.getSigners();        
//         const BeerBotClub = await ethers.getContractFactory("BeerBotClub");        
//         const deplyedBeerBotClub = await BeerBotClub.deploy(maxSupply, fundsRequiredInWeis, SplitterContractAddress, SplitterContractPercentage, mintEconomicsAddresses, mintEconomicsPercentages);

//         return {
//             creator,
//             leadDude,
//             artirstDude,
//             devDude,
//             someDudeOne,
//             somdeDudeTwo,            
//             somdeDudethree, 
//             somdeDudeFour, 
//             someDudeFive, 
//             someDudeSix, 
//             someDudeSeven, 
//             someDudeEight, 
//             someDudeNine, 
//             SomeDudeTen,
//             someDudeEleven,
//             holders,
//             project,            
//             deplyedBeerBotClub
//         };
//     }

//     describe("Minting ALL", () => {
//         it("pause and unpause by each round, only creator can unpause minting, bot 4000 does not exist, limit is reached, each nft has an unique id and have their respective owner", async () => {
//             const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, somdeDudethree, 
//                 somdeDudeFour, someDudeFive, someDudeSix, someDudeSeven, someDudeEight, someDudeNine, 
//                 SomeDudeTen, someDudeEleven, holders, project, deployedSplitter, deplyedBeerBotClub } = await setuprBeerBotClub({ });
//             let counter = 0;
//             // console.log("is pause by contract? " +  await deplyedBeerBotClub.connect(devDude).isPausedByContract());
//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(someDudeOne).mint({from: someDudeOne.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }
            
//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(somdeDudeTwo).mint({from: somdeDudeTwo.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }

//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(somdeDudethree).mint({from: somdeDudethree.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }
            
//             for (let i = 0; i <= 131; i++){ // 132
//                 await deplyedBeerBotClub.connect(somdeDudeFour).mint({from: somdeDudeFour.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }
//             // 1332 bot id reached...check minting is paused... then unpause
//             console.log("1332 bot id reached...check minting is paused... then unpause");
//             await expect(deplyedBeerBotClub.connect(devDude).mint({
//                             from: devDude.address,
//                             value: ethers.utils.parseEther('20'),
//                         })).to.be.revertedWith("BmClub: minting is paused" );

//             await expect(deplyedBeerBotClub.connect(devDude).unpauseContract()).to.be.revertedWith("Ownable: caller is not the owner" );
//             await deplyedBeerBotClub.connect(creator).unpauseContract()
//             expect(await deplyedBeerBotClub.connect(creator).isPausedByContract()).to.be.eq(false);
//             // continue minting
//             for (let i = 0; i <= 267; i++){ // 268
//                 await deplyedBeerBotClub.connect(somdeDudeFour).mint({from: somdeDudeFour.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }

//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(someDudeFive).mint({from: someDudeFive.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }

//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(someDudeSix).mint({from: someDudeSix.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }

//             for (let i = 0; i <= 264; i++){ // 265
//                 await deplyedBeerBotClub.connect(someDudeSeven).mint({from: someDudeSeven.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }
//             // 2665 bot id reached...check minting is paused... then unpause
//             console.log("2665 bot id reached...check minting is paused... then unpause")
//             await expect(deplyedBeerBotClub.connect(devDude).mint({
//                 from: devDude.address,
//                 value: ethers.utils.parseEther('20'),
//             })).to.be.revertedWith("BmClub: minting is paused" );

//             await expect(deplyedBeerBotClub.connect(devDude).unpauseContract()).to.be.revertedWith("Ownable: caller is not the owner" );
//             await deplyedBeerBotClub.connect(creator).unpauseContract()
//             expect(await deplyedBeerBotClub.connect(devDude).isPausedByContract()).to.be.eq(false);
//             //continue minting
//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(someDudeEight).mint({from: someDudeEight.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }

//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(someDudeNine).mint({from: someDudeNine.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }

//             for (let i = 0; i <= 399; i++){ // 400
//                 await deplyedBeerBotClub.connect(SomeDudeTen).mint({from: SomeDudeTen.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }

//             for (let i = 0; i <= 133; i++){ // 134
//                 await deplyedBeerBotClub.connect(someDudeEleven).mint({from: someDudeEleven.address, value: ethers.utils.parseEther('20')})
//                 counter++;
//             }
//             // console.log(counter);
//             // console.log("in contract counter... "+ await deplyedBeerBotClub.connect(devDude).getCurrentNumberOfBots());
            
//             // console.log("is pause by contract? " +  await deplyedBeerBotClub.connect(devDude).isPausedByContract());
//             // 3998 bot id reached... check that there is no more bots...
//             console.log("3998 bot id reached... check that there is no more bots...")
//             await expect(deplyedBeerBotClub.connect(artirstDude).mint({from: artirstDude.address, value: ethers.utils.parseEther('20')})).to.be.revertedWith("No BeerBotClub left :(");

//             let balanceOfDudeOne = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeOne.address);
//             let balanceOfDudeTwo = await deplyedBeerBotClub.connect(creator).balanceOf(somdeDudeTwo.address);
//             let balanceOfDudeThree = await deplyedBeerBotClub.connect(creator).balanceOf(somdeDudethree.address);
//             let balanceOfDudeFour = await deplyedBeerBotClub.connect(creator).balanceOf(somdeDudeFour.address);
//             let balanceOfDudeFive = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeFive.address);
//             let balanceOfDudeSix = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeSix.address);
//             let balanceOfDudeSeven = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeSeven.address);
//             let balanceOfDudeEight = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeEight.address);
//             let balanceOfDudeNine = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeNine.address);
//             let balanceOfDudeTen = await deplyedBeerBotClub.connect(creator).balanceOf(SomeDudeTen.address);
//             let balanceOfDudeEleven = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeEleven.address);

//             totalBalance = balanceOfDudeOne.add(balanceOfDudeTwo).add(balanceOfDudeThree).add(balanceOfDudeFour).add(balanceOfDudeFive).add(balanceOfDudeSix).add(balanceOfDudeSeven).add(balanceOfDudeEight).add(balanceOfDudeNine).add(balanceOfDudeTen).add(balanceOfDudeEleven);
//             console.log("the total of nfts is...")
//             console.log(totalBalance)
//             await expect(deplyedBeerBotClub.ownerOf(3999)).to.be.revertedWith("ERC721: invalid token ID");
//             await expect(deplyedBeerBotClub.ownerOf(4000)).to.be.revertedWith("ERC721: invalid token ID");
//             console.log("almost all good");
//             // check that every nft has an owner...
//             let ids = [];
//             for (let i = 0; i < 3999; i++){
//                 ids.push(i);
//             }
            
//             let owners = {}
//             for (id of ids){
//                 owners[String(id)] = await deplyedBeerBotClub.connect(creator).ownerOf(id);
//             }
            
//             //console.log(owners)
//         });
//     });

});