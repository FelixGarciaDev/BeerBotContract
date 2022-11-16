require('dotenv').config();
const { expect } = require("chai");

describe("BeerBotClub Collection", () => {
    const setuprBeerBotClub = async ({ 
        maxSupply = 3999,
        fundsRequiredInWeis = 20000000000000000000n, 
        SplitterContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
        SplitterContractPercentage = 700,
        
        mintEconomicsAddresses = [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // creator
            "0x976EA74026E726554dB657fA54763abd0C3a0aa9", // holders
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // leadDude
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // devDude
        ], 
        mintEconomicsPercentages = [
            22,
            70,            
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

            // await deployedBeerBotClubHolderSpliiter.connect(creator).splitToHolders(
            //     holdersAddresses, 
            //     holdersBPS,
            //     {
            //     from: creator.address,
            //     value: ethers.utils.parseEther('9000')
            //     }
            // );

            // Whitelisted addresses CANT mint while pause status is true
            await expect(deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                from: whiteListeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("minting is paused");

            // change pause status, only owner can do that
            await expect(deplyedBeerBotClub.connect(someDudeOne).unpauseByContract()).to.be.revertedWith('Ownable: caller is not the owner');
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(true);
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(false);

            // Whitelisted addresses CAN mint while pause status is false
            deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                from: whiteListeOne.address,
                value: ethers.utils.parseEther('20'),
            });

            // NOT whitelisted addresses CANT mint even if pause status is false
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("You are not whitelisted");

            // change whitelist mode status, only owner can do that
            await expect(deplyedBeerBotClub.connect(someDudeOne).unableWhiteListMode()).to.be.revertedWith('Ownable: caller is not the owner');
            whielistModeStatus = await deplyedBeerBotClub.connect(creator).isWhileListMode()
            expect(whielistModeStatus).to.equal(true);
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()
            whielistModeStatus = await deplyedBeerBotClub.connect(creator).isWhileListMode()
            expect(whielistModeStatus).to.equal(false);

            // ANYONE CAN mint when whitelist mode is false and pause status is false           
            await deplyedBeerBotClub.connect(whiteListeTwo).mint(1,{
                from: whiteListeTwo.address,
                value: ethers.utils.parseEther('20'),
            });

            await deplyedBeerBotClub.connect(somdeDudeTwo).mint(1,{
                from: somdeDudeTwo.address,
                value: ethers.utils.parseEther('20'),
            });

            // pause again
            await deplyedBeerBotClub.connect(creator).changePauseStatus()
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(true);

            // NOBODY can mint when whitelist mode is false and pause status is true
            await expect(deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                from: whiteListeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("minting is paused");

            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("minting is paused");
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
            await expect(deplyedBeerBotClub.connect(whiteListeTwo).mint(1,{
                from: whiteListeTwo.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("minting is paused");

            // change pause status
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            pauseStatus = await deplyedBeerBotClub.connect(creator).isPausedByContract()
            expect(pauseStatus).to.equal(false);

            // Whitelisted addresses CAN mint while pause status is false
            // Same addresses can mint five times or even more
            await Promise.all([              
                deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
                deplyedBeerBotClub.connect(whiteListeOne).mint(1,{
                    from: whiteListeOne.address,
                    value: ethers.utils.parseEther('20'),
                }),
            ]);

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
                        
            // mint the with required funds
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            }))

            // Try to mint with less of the required funds
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('10'),
            })).to.be.revertedWith("Need more funds");

            // change the required amount, only owner can do this
            await expect(deplyedBeerBotClub.connect(somdeDudeTwo).setRequiredFunds(ethers.utils.parseEther('30'))).to.be.revertedWith("Ownable: caller is not the owner" );
            await deplyedBeerBotClub.connect(creator).setRequiredFunds(ethers.utils.parseEther('30'));
            newAmount = await deplyedBeerBotClub.connect(creator).getRequiredFunds();
            await expect(newAmount).to.eq(ethers.utils.parseEther('30'));

            // Try to mint with less of the required funds AGAIN
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('10'),
            })).to.be.revertedWith("Need more funds");

            // mint the with required funds
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('30'),
            }))

        });

        it("The resqueted number of mints cant be 0 o less, cant be more than 10", async () => {
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

            // cant request 0 mints...
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(0,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("Invalid amount");

            // cant request more than 10 mints...            
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(11,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('220'),
            })).to.be.revertedWith("Invalid amount");

            // cant do 10 mints with less than fundsRequired*10
            await expect(deplyedBeerBotClub.connect(someDudeOne).mint(10,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("Need more funds");

            // cant request beetween 1 and 10 mints
            await Promise.all([
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(1,{
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('20'),
                }), 
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(2,{
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('40'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(3,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('60'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(4,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('80'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(5,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('100'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(6,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('120'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(7,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('140'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(8,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('160'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(9,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('180'),
                }),
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(10,{
                    from: somdeDudeTwo.address,
                    value: ethers.utils.parseEther('200'),
                }),
            ]);

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

            let contractStartBalance = await provider.getBalance(deplyedBeerBotClub.address);
            let creatorStartBalance = await provider.getBalance(creator.address);
            let leadStartBalance = await provider.getBalance(leadDude.address);
            let artistStartBalance = await provider.getBalance(artirstDude.address);
            let devStartBalance = await provider.getBalance(devDude.address);
            let holdersStartBalance = await provider.getBalance(holders.address);
            let projectStartBalance = await provider.getBalance(project.address);
            // just to see balances---------------------------------
            // console.log("Starting balances...");
            // console.log("contratc balance... " + contractStartBalance);
            // console.log("creatorBalance... "+creatorStartBalance);
            // console.log("leadBalance... "+leadStartBalance);
            // //console.log("artistBalance... "+artistStartBalance);
            // console.log("devBalance... "+devStartBalance);
            // console.log("holdersBalance... "+holdersStartBalance);
            // //console.log("projectBalance... "+projectStartBalance);
            // console.log("\n")
            //------------------------------------------------------
            console.log("some mints...\n")
            await Promise.all([
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(1,{
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('50'),
                }), 
                deplyedBeerBotClub.connect(somdeDudeTwo).mint(1,{
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('50'),
                })
            ]);
            
            let contractBalance = await provider.getBalance(deplyedBeerBotClub.address);
            const creatorShare = contractBalance.mul(ethers.utils.parseEther('22')).div(ethers.utils.parseEther('100'));
            const holderShare = contractBalance.mul(ethers.utils.parseEther('70')).div(ethers.utils.parseEther('100'));
            const leadShare = contractBalance.mul(ethers.utils.parseEther('5')).div(ethers.utils.parseEther('100'));
            const devShare = contractBalance.mul(ethers.utils.parseEther('3')).div(ethers.utils.parseEther('100'));
            //------------------------------------------------------
            // console.log("Now the contrac balance and shares are..")
            // console.log("contrac balance... " + contractBalance);
            // console.log("leadShare... " + leadShare);
            // console.log("devShare... " + devShare);
            // console.log("creatorShare... " + creatorShare);
            // console.log("HoldersShare... " + holderShare);
            // console.log("\n")
            //------------------------------------------------------
            // console.log("Now the release the shares")
            await expect(deplyedBeerBotClub.connect(someDudeOne)["release(address)"](holders.address)).to.be.revertedWith("Ownable: caller is not the owner" );
            let tx = await deplyedBeerBotClub.connect(creator)["release(address)"](holders.address);
            let receipt = await tx.wait();
            let gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice);

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
            //------------------------------------------------------
            // console.log("Ending balances...");
            // console.log("contract balance... " + contractBalance);
            // console.log("creatorBalance... "+creatorBalance);
            // console.log("leadBalance... "+leadBalance);
            // console.log("devBalance... "+devBalance);
            // console.log("holdersBalance... "+holdersBalance);
            //------------------------------------------------------
            expect(await contractBalance).to.eq(ethers.utils.parseEther('0'));
            expect(await leadBalance).to.eq(leadStartBalance.add(leadShare));
            expect(await devBalance).to.eq(devStartBalance.add(devShare));
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
            const tx = await deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            });
            let receipt = await tx.wait();
            info = receipt.logs[0]
            let tokenMintedId = parseInt(Number(info.topics[3]))
            // console.log("minted id: "+tokenMintedId);
            const tokenCeroRoyaltyInfo = await deplyedBeerBotClub.royaltyInfo(tokenMintedId, 100);
            // console.log("royalty info: "+tokenCeroRoyaltyInfo);
            expect(tokenCeroRoyaltyInfo[0]).to.equal(SplitterContractAddress);
            expect(tokenCeroRoyaltyInfo[1].toNumber()).to.equal(7)
        });

        it("Only owner can change the royalty info", async () => {
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
            let newRoyaltyAddress = "0x1F0BC69eC3c3A53afe46a1541B59326fdCf54df2";
            let newRoyaltyBasisPoints = 800;
            await expect(deplyedBeerBotClub.connect(whiteListeTwo).setRoyaltyInfo(newRoyaltyAddress, newRoyaltyBasisPoints)).to.be.revertedWith("Ownable: caller is not the owner" );
            await deplyedBeerBotClub.connect(creator).setRoyaltyInfo(newRoyaltyAddress, newRoyaltyBasisPoints)
            const tx = await deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
            });
            let receipt = await tx.wait();
            info = receipt.logs[0];
            let tokenMintedId = parseInt(Number(info.topics[3]))
            const tokenCeroRoyaltyInfo = await deplyedBeerBotClub.royaltyInfo(tokenMintedId, 100);            
            expect(tokenCeroRoyaltyInfo[0]).to.equal(newRoyaltyAddress);
            expect(tokenCeroRoyaltyInfo[1].toNumber()).to.equal(8);
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
                deplyedBeerBotClub.connect(someDudeOne).mint(1,{
                from: someDudeOne.address,
                value: ethers.utils.parseEther('20'),
                }), 
                deplyedBeerBotClub.connect(someDudeOne).mint(1,{
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
});