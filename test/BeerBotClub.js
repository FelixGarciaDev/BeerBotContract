require('dotenv').config();
const { expect } = require("chai");
const { BigNumber } = require('ethers');

// pause checkpoint // 1332, 2665, 3998

//                             30000000n
//                    43843885000000000n
//    0.02 MATIC      20000000000000000n
//    0.30 MATIC     300000000000000000n
//    1    MATIC    1000000000000000000n
//   20    MATIC   20000000000000000000n
//               9999943843885000000000n  

describe("BeerBotClub Collection", () => {
    const setupBmBots = async ({ 
        maxSupply = 3998, 
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
        const [creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project] = await ethers.getSigners();
        
        const BmBots = await ethers.getContractFactory("BmBots");
        const deployedBmBots = await BmBots.deploy(maxSupply, fundsRequiredInWeis, SplitterContractAddress, SplitterContractPercentage, mintEconomicsAddresses, mintEconomicsPercentages);

        return {
            creator,
            leadDude,
            artirstDude,
            devDude,
            someDudeOne,
            somdeDudeTwo,
            holders,
            project,            
            deployedBmBots
        };
    }

    describe("Deployment...", () => {
        it("Deploys BmBot and Splitter contracts correctly", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedBmBots } = await setupBmBots({ });
            
            console.log("BmBots deployed at... " + deployedBmBots.address);
        });

        it("Sets max supply to passed param", async () => {
            const maxSupply = 2000;
      
            const { deployedBmBots } = await setupBmBots({ maxSupply });
      
            const returnedMaxSupply = await deployedBmBots.maxSupply();
            expect(maxSupply).to.equal(returnedMaxSupply);
        });

        it("Has a minting limit", async () => {
            const maxSupply = 2;
      
            const { creator, deployedBmBots } = await setupBmBots({ maxSupply });
      
            // Mint all
            await Promise.all([              
              deployedBmBots.connect(creator).mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
              }),
              deployedBmBots.connect(creator).mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
              })
            ]);
      
            // Assert the last minting
            await expect(deployedBmBots.connect(creator).mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("No BmBots left :(");
        });

        it("The amout of needed MATIC can change...", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
            
            originalAmount = await deployedBmBots.connect(creator).getRequiredFunds();
            await deployedBmBots.connect(creator).setRequiredFunds(30000000000000000000n);
            expect(originalAmount).to.eq(ethers.utils.parseEther('20'));
            expect(await deployedBmBots.connect(creator).getRequiredFunds()).to.eq(ethers.utils.parseEther('30'));
            await expect(deployedBmBots.connect(creator).mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("you need more MATIC to mint the BmBots");
        });
      
        it("Only the creator can change the needed amout of MATIC", async () => {
        const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
    
        await expect(deployedBmBots.connect(somdeDudeTwo).setRequiredFunds(35000000000000000000n)).to.be.revertedWith("Ownable: caller is not the owner" );
        });

    });
    
    describe("customBaseURI...", () => {
        it("The original baseURI is correct", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
            
            await deployedBmBots.mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
            });
    
            const baseURI = await deployedBmBots.publicURI();
            // const stringifiedTokenURI = await tokenURI.toString();
            const expectedBaseURI = "https://bmbot.io/bmbots/";
            
            expect(expectedBaseURI).to.equal(baseURI);
        });
    
        it("BaseURI can change", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
            
            await deployedBmBots.mint({
                from: creator.address,
                value: ethers.utils.parseEther('20'),
            });
    
            const baseURI = await deployedBmBots.publicURI();
            const expectedBaseURI = "https://bmbot.io/bmbots/";
            
            expect(expectedBaseURI).to.equal(baseURI);
        
            await deployedBmBots.setBaseURI("ipfs://someIpfsKey/bmbots/")
            const newBaseURI = await deployedBmBots.publicURI();
            const expectedNewBaseURI = "ipfs://someIpfsKey/bmbots/";
            
            expect(expectedNewBaseURI).to.equal(newBaseURI);
        });
    
        it ("Only creator can change baseURI", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
        
            const baseURI = await deployedBmBots.publicURI();
            const expectedBaseURI = "https://bmbot.io/bmbots/";
            
            expect(expectedBaseURI).to.equal(baseURI);
        
            await expect(deployedBmBots.connect(somdeDudeTwo).setBaseURI("https://someDudeOneURI/")).to.be.revertedWith("Ownable: caller is not the owner" );
        });
      });

    describe("Mint Economics...", async () => {
        it("Only creator splits the bmclub contract balance", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });

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
                deployedBmBots.connect(somdeDudeTwo).mint({
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('20'),
                }), 
                deployedBmBots.connect(somdeDudeTwo).mint({
                  from: somdeDudeTwo.address,
                  value: ethers.utils.parseEther('20'),
                })
            ]);
            
            let contractBalance = await provider.getBalance(deployedBmBots.address);
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

            await expect(deployedBmBots.connect(someDudeOne)["release(address)"](holders.address)).to.be.revertedWith("Ownable: caller is not the owner" );
            let tx = await deployedBmBots.connect(creator)["release(address)"](holders.address);
            let receipt = await tx.wait();
            let gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice);

            tx = await deployedBmBots.connect(creator)["release(address)"](project.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));

            tx = await deployedBmBots.connect(creator)["release(address)"](leadDude.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));
            
            tx = await deployedBmBots.connect(creator)["release(address)"](devDude.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));

            tx = await deployedBmBots.connect(creator)["release(address)"](creator.address);
            receipt = await tx.wait();
            gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));
            
            contractBalance = await provider.getBalance(deployedBmBots.address);
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
        it("Should support the ERC721 and ERC2981 standards", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
            const ERC721InterfaceId = "0x80ac58cd";
            const ERC2981InterfaceId = "0x2a55205a";
            var isERC721 = await deployedBmBots.supportsInterface(ERC721InterfaceId);
            var isER2981 = await deployedBmBots.supportsInterface(ERC2981InterfaceId); 
            expect(isERC721).to.equal(true);
            expect(isER2981).to.equal(true);
        });
    
        it("Should return the correct royalty info", async () => {
            const SplitterContractAddress = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedBmBots } = await setupBmBots({ SplitterContractAddress });
            // console.log(deployedSplitter.address);
            const tx = await deployedBmBots.connect(creator).mint({ from: creator.address, value: ethers.utils.parseEther('20') });
            let receipt = await tx.wait();
            info = receipt.logs[0]
            let tokenMintedId = parseInt(Number(info.topics[3]))
            const tokenCeroRoyaltyInfo = await deployedBmBots.royaltyInfo(tokenMintedId, 100);
            
            expect(tokenCeroRoyaltyInfo[0]).to.equal(SplitterContractAddress);
            expect(tokenCeroRoyaltyInfo[1].toNumber()).to.equal(7)

        });

    });

    describe("Withdraws...", async () => {
        it("Withdraws the correct balance to the correct address", async () => {
        const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
          
          await Promise.all([
            deployedBmBots.connect(someDudeOne).mint({
              from: someDudeOne.address,
              value: ethers.utils.parseEther('20'),
            }), 
            deployedBmBots.connect(someDudeOne).mint({
              from: someDudeOne.address,
              value: ethers.utils.parseEther('20'),
            })
          ]);
    
          const provider = ethers.provider;
          let balanceStart = await provider.getBalance(creator.address);
          const tx = await deployedBmBots.connect(creator).withdraw();
          const receipt = await tx.wait();
          const gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice);
          expectedBalance = balanceStart.add(ethers.utils.parseEther('40'));
          expect(await creator.getBalance()).to.eq(expectedBalance.sub(gasSpent));
    
        });
        
        it("Only creator can withdraw the funds", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
    
          await expect(deployedBmBots.connect(somdeDudeTwo).withdraw()).to.be.revertedWith("Ownable: caller is not the owner" );
        });
      });
});


//------------------------------------------------------------------------------------------------------------------------------------

describe("All bots can be minted...", () => {
    const setupBmBots = async ({ 
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
        const [creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, , 
            somdeDudethree, somdeDudeFour, someDudeFive, someDudeSix, someDudeSeven, 
            someDudeEight, someDudeNine, SomeDudeTen, someDudeEleven, holders, project] = await ethers.getSigners();        
        const BmBots = await ethers.getContractFactory("BmBots");        
        const deployedBmBots = await BmBots.deploy(maxSupply, fundsRequiredInWeis, SplitterContractAddress, SplitterContractPercentage, mintEconomicsAddresses, mintEconomicsPercentages);

        return {
            creator,
            leadDude,
            artirstDude,
            devDude,
            someDudeOne,
            somdeDudeTwo,            
            somdeDudethree, 
            somdeDudeFour, 
            someDudeFive, 
            someDudeSix, 
            someDudeSeven, 
            someDudeEight, 
            someDudeNine, 
            SomeDudeTen,
            someDudeEleven,
            holders,
            project,            
            deployedBmBots
        };
    }

    describe("Minting ALL", () => {
        it("pause and unpause by each round, only creator can unpause minting, bot 4000 does not exist, limit is reached, each nft has an unique id and have their respective owner", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, somdeDudethree, 
                somdeDudeFour, someDudeFive, someDudeSix, someDudeSeven, someDudeEight, someDudeNine, 
                SomeDudeTen, someDudeEleven, holders, project, deployedSplitter, deployedBmBots } = await setupBmBots({ });
            let counter = 0;
            // console.log("is pause by contract? " +  await deployedBmBots.connect(devDude).isPausedByContract());
            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(someDudeOne).mint({from: someDudeOne.address, value: ethers.utils.parseEther('20')})
                counter++;
            }
            
            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(somdeDudeTwo).mint({from: somdeDudeTwo.address, value: ethers.utils.parseEther('20')})
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(somdeDudethree).mint({from: somdeDudethree.address, value: ethers.utils.parseEther('20')})
                counter++;
            }
            
            for (let i = 0; i <= 131; i++){ // 132
                await deployedBmBots.connect(somdeDudeFour).mint({from: somdeDudeFour.address, value: ethers.utils.parseEther('20')})
                counter++;
            }
            // 1332 bot id reached...check minting is paused... then unpause
            console.log("1332 bot id reached...check minting is paused... then unpause");
            await expect(deployedBmBots.connect(devDude).mint({
                            from: devDude.address,
                            value: ethers.utils.parseEther('20'),
                        })).to.be.revertedWith("BmClub: minting is paused" );

            await expect(deployedBmBots.connect(devDude).unpauseContract()).to.be.revertedWith("Ownable: caller is not the owner" );
            await deployedBmBots.connect(creator).unpauseContract()
            expect(await deployedBmBots.connect(creator).isPausedByContract()).to.be.eq(false);
            // continue minting
            for (let i = 0; i <= 267; i++){ // 268
                await deployedBmBots.connect(somdeDudeFour).mint({from: somdeDudeFour.address, value: ethers.utils.parseEther('20')})
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(someDudeFive).mint({from: someDudeFive.address, value: ethers.utils.parseEther('20')})
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(someDudeSix).mint({from: someDudeSix.address, value: ethers.utils.parseEther('20')})
                counter++;
            }

            for (let i = 0; i <= 264; i++){ // 265
                await deployedBmBots.connect(someDudeSeven).mint({from: someDudeSeven.address, value: ethers.utils.parseEther('20')})
                counter++;
            }
            // 2665 bot id reached...check minting is paused... then unpause
            console.log("2665 bot id reached...check minting is paused... then unpause")
            await expect(deployedBmBots.connect(devDude).mint({
                from: devDude.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("BmClub: minting is paused" );

            await expect(deployedBmBots.connect(devDude).unpauseContract()).to.be.revertedWith("Ownable: caller is not the owner" );
            await deployedBmBots.connect(creator).unpauseContract()
            expect(await deployedBmBots.connect(devDude).isPausedByContract()).to.be.eq(false);
            //continue minting
            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(someDudeEight).mint({from: someDudeEight.address, value: ethers.utils.parseEther('20')})
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(someDudeNine).mint({from: someDudeNine.address, value: ethers.utils.parseEther('20')})
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400
                await deployedBmBots.connect(SomeDudeTen).mint({from: SomeDudeTen.address, value: ethers.utils.parseEther('20')})
                counter++;
            }

            for (let i = 0; i <= 133; i++){ // 134
                await deployedBmBots.connect(someDudeEleven).mint({from: someDudeEleven.address, value: ethers.utils.parseEther('20')})
                counter++;
            }
            // console.log(counter);
            // console.log("in contract counter... "+ await deployedBmBots.connect(devDude).getCurrentNumberOfBots());
            
            // console.log("is pause by contract? " +  await deployedBmBots.connect(devDude).isPausedByContract());
            // 3998 bot id reached... check that there is no more bots...
            console.log("3998 bot id reached... check that there is no more bots...")
            await expect(deployedBmBots.connect(artirstDude).mint({from: artirstDude.address, value: ethers.utils.parseEther('20')})).to.be.revertedWith("No BmBots left :(");

            let balanceOfDudeOne = await deployedBmBots.connect(creator).balanceOf(someDudeOne.address);
            let balanceOfDudeTwo = await deployedBmBots.connect(creator).balanceOf(somdeDudeTwo.address);
            let balanceOfDudeThree = await deployedBmBots.connect(creator).balanceOf(somdeDudethree.address);
            let balanceOfDudeFour = await deployedBmBots.connect(creator).balanceOf(somdeDudeFour.address);
            let balanceOfDudeFive = await deployedBmBots.connect(creator).balanceOf(someDudeFive.address);
            let balanceOfDudeSix = await deployedBmBots.connect(creator).balanceOf(someDudeSix.address);
            let balanceOfDudeSeven = await deployedBmBots.connect(creator).balanceOf(someDudeSeven.address);
            let balanceOfDudeEight = await deployedBmBots.connect(creator).balanceOf(someDudeEight.address);
            let balanceOfDudeNine = await deployedBmBots.connect(creator).balanceOf(someDudeNine.address);
            let balanceOfDudeTen = await deployedBmBots.connect(creator).balanceOf(SomeDudeTen.address);
            let balanceOfDudeEleven = await deployedBmBots.connect(creator).balanceOf(someDudeEleven.address);

            totalBalance = balanceOfDudeOne.add(balanceOfDudeTwo).add(balanceOfDudeThree).add(balanceOfDudeFour).add(balanceOfDudeFive).add(balanceOfDudeSix).add(balanceOfDudeSeven).add(balanceOfDudeEight).add(balanceOfDudeNine).add(balanceOfDudeTen).add(balanceOfDudeEleven);
            console.log("the total of nfts is...")
            console.log(totalBalance)
            await expect(deployedBmBots.ownerOf(3999)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(deployedBmBots.ownerOf(4000)).to.be.revertedWith("ERC721: invalid token ID");
            console.log("almost all good");
            // check that every nft has an owner...
            let ids = [];
            for (let i = 0; i < 3999; i++){
                ids.push(i);
            }
            
            let owners = {}
            for (id of ids){
                owners[String(id)] = await deployedBmBots.connect(creator).ownerOf(id);
            }
            
            //console.log(owners)
        });
    });

});