require('dotenv').config();
const { expect } = require("chai");
var fs = require('fs');

describe("All BeerBot can be minted and the exotics appear when they needed", () => {
    const setuprBeerBotClub = async ({ 
        maxSupply = 4000, 
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
            deplyedBeerBotClub
        };
    }

    describe("Minting ALL", () => {
        it("Mints 3 specials on each round", async () => {
            let counter = 0;
            let specialCounter = 0;

            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, somdeDudethree, 
                somdeDudeFour, someDudeFive, someDudeSix, someDudeSeven, someDudeEight, someDudeNine, 
                SomeDudeTen, someDudeEleven, holders, project, deployedSplitter, deplyedBeerBotClub } = await setuprBeerBotClub({ });

            const getIdOfMinted = async (wallet) => {
                const tx = await deplyedBeerBotClub.connect(wallet).mint(1,{
                    from: wallet.address,
                    value: ethers.utils.parseEther('20'),
                });
                let receipt = await tx.wait();
                info = receipt.logs[0];                
                let tokenMintedId = parseInt(Number(info.topics[3]));
                //console.log(tokenMintedId)
                return tokenMintedId;
            }
            
            const checkIfIdOfMintedIsSpecial = async (beerbotID) => {
                if (beerbotID >= 0 && beerbotID <= 8){
                    console.log("Beerbot number "+beerbotID+" was minted");
                    specialCounter++
                }
            }
            
            // unpause contract
            await deplyedBeerBotClub.connect(creator).unpauseByContract()

            // unable whitelist mode
            await deplyedBeerBotClub.connect(creator).unableWhiteListMode()
            
            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(someDudeOne);                
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);                
                counter++;
            }
            
            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(somdeDudeTwo);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(somdeDudethree);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }
            
            for (let i = 0; i <= 132; i++){ // 133
                let BeerbotMintedID = await getIdOfMinted(somdeDudeFour);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }

            //
            // 
            // 1333 BeerBots reached...check minting is paused... then unpause
            await expect(counter).to.be.eq(1333);
            await expect(specialCounter).to.be.eq(3),
            expect(await deplyedBeerBotClub.connect(creator)._totalExoticSupply()).to.be.eq(3);
            expect(await deplyedBeerBotClub.connect(creator)._totalSupply()).to.be.eq(1333);
            console.log("1333 BeerBots reached...check minting is paused... then unpause\n");
            await expect(deplyedBeerBotClub.connect(devDude).mint(1,{
                            from: devDude.address,
                            value: ethers.utils.parseEther('20'),
                        })).to.be.revertedWith("minting is paused");            
            await expect(deplyedBeerBotClub.connect(devDude).unpauseByContract()).to.be.revertedWith("Ownable: caller is not the owner" );
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            expect(await deplyedBeerBotClub.connect(creator).isPausedByContract()).to.be.eq(false);

            //
            //
            // Continue minting...
            for (let i = 0; i <= 267; i++){ // 268                
                let BeerbotMintedID = await getIdOfMinted(somdeDudeFour);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(someDudeFive);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }

            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(someDudeSix);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }

            for (let i = 0; i <= 264; i++){ // 265
                let BeerbotMintedID = await getIdOfMinted(someDudeSeven);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }

            //
            //
            // 2666 Beerbot reached...check minting is paused... then unpause
            await expect(counter).to.be.eq(2666);
            await expect(specialCounter).to.be.eq(6);
            expect(await deplyedBeerBotClub.connect(creator)._totalExoticSupply()).to.be.eq(6);
            expect(await deplyedBeerBotClub.connect(creator)._totalSupply()).to.be.eq(2666);
            console.log("2666 Beerbot reached...check minting is paused... then unpause\n")
            await expect(deplyedBeerBotClub.connect(devDude).mint(1,{
                from: devDude.address,
                value: ethers.utils.parseEther('20'),
            })).to.be.revertedWith("minting is paused");

            await expect(deplyedBeerBotClub.connect(devDude).unpauseByContract()).to.be.revertedWith("Ownable: caller is not the owner" );
            await deplyedBeerBotClub.connect(creator).unpauseByContract()
            expect(await deplyedBeerBotClub.connect(devDude).isPausedByContract()).to.be.eq(false);
            
            //
            //
            //continue minting
            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(someDudeEight);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }
            
            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(someDudeNine);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }
            
            for (let i = 0; i <= 399; i++){ // 400                
                let BeerbotMintedID = await getIdOfMinted(SomeDudeTen);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
            }
            
            for (let i = 0; i <= 123; i++){ // 124                
                let BeerbotMintedID = await getIdOfMinted(someDudeEleven);
                checkIfIdOfMintedIsSpecial(BeerbotMintedID);
                counter++;
                // console.log("the exotic supply is: "+await deplyedBeerBotClub.connect(creator)._totalExoticSupply());
                // console.log("the supply is: "+await deplyedBeerBotClub.connect(creator)._totalSupply());
            }

            // 10 Beerbots remaining...            
            // mint one more
            await deplyedBeerBotClub.connect(someDudeEleven).mint(1,{
                from: someDudeEleven.address,
                value: ethers.utils.parseEther('20'),
            });
            counter++;
            
            // 9 Beerbots remaining
            // Check that max Supply wouldnt be exceeded when minting more than remaining
            console.log("3991 BeerBots reached... Check that max Supply wouldnt be exceeded when minting more than remaining\n");
            for(let i = 10; i > 0; i--){
                stringAmount = (20*i).toString()                                
                // mint one by step
                if (i > 1){
                    await expect(deplyedBeerBotClub.connect(someDudeEleven).mint(i,{
                        from: someDudeEleven.address,
                        value: ethers.utils.parseEther(stringAmount),
                    })).to.be.revertedWith("Mint less BeerBots");   
                    // console.log("reverted, "+i)

                    await deplyedBeerBotClub.connect(someDudeEleven).mint(1,{
                        from: someDudeEleven.address,
                        value: ethers.utils.parseEther('20'),
                    });
                    counter++;
                    // console.log("minted 1 more")
                } else{
                    // try to mint after last beerbot was minted...
                    await expect(deplyedBeerBotClub.connect(someDudeEleven).mint(i,{
                        from: someDudeEleven.address,
                        value: ethers.utils.parseEther(stringAmount),
                    })).to.be.revertedWith("BEERBOTS SOLD OUT!");   
                }
            }
            
            // 4000 BeerBots reached... check that there is no more bots...
            console.log("4000 BeerBots reached... check that there is no more bots... \n");
            await expect(counter).to.be.eq(4000);
            await expect(specialCounter).to.be.eq(9);
            expect(await deplyedBeerBotClub.connect(creator)._totalExoticSupply()).to.be.eq(9);
            expect(await deplyedBeerBotClub.connect(creator)._totalSupply()).to.be.eq(4000);
            await expect(deplyedBeerBotClub.connect(artirstDude).mint(1,{from: artirstDude.address, value: ethers.utils.parseEther('20')})).to.be.revertedWith("BEERBOTS SOLD OUT!");

            let balanceOfDudeOne = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeOne.address);
            let balanceOfDudeTwo = await deplyedBeerBotClub.connect(creator).balanceOf(somdeDudeTwo.address);
            let balanceOfDudeThree = await deplyedBeerBotClub.connect(creator).balanceOf(somdeDudethree.address);
            let balanceOfDudeFour = await deplyedBeerBotClub.connect(creator).balanceOf(somdeDudeFour.address);
            let balanceOfDudeFive = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeFive.address);
            let balanceOfDudeSix = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeSix.address);
            let balanceOfDudeSeven = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeSeven.address);
            let balanceOfDudeEight = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeEight.address);
            let balanceOfDudeNine = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeNine.address);
            let balanceOfDudeTen = await deplyedBeerBotClub.connect(creator).balanceOf(SomeDudeTen.address);
            let balanceOfDudeEleven = await deplyedBeerBotClub.connect(creator).balanceOf(someDudeEleven.address);

            totalBalance = balanceOfDudeOne.add(balanceOfDudeTwo).add(balanceOfDudeThree).add(balanceOfDudeFour).add(balanceOfDudeFive).add(balanceOfDudeSix).add(balanceOfDudeSeven).add(balanceOfDudeEight).add(balanceOfDudeNine).add(balanceOfDudeTen).add(balanceOfDudeEleven);
            console.log("Checking and adding the balances of all the holders...")
            console.log(totalBalance)            
            await expect(deplyedBeerBotClub.ownerOf(4000)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(deplyedBeerBotClub.ownerOf(4001)).to.be.revertedWith("ERC721: invalid token ID");
            // console.log("almost all good");
            // check that every nft has an owner...
            let ids = [];
            for (let i = 0; i < 4000; i++){
                ids.push(i);
            }
            
            let owners = {}
            for (id of ids){
                owners[String(id)] = await deplyedBeerBotClub.connect(creator).ownerOf(id);
            }
            
            // console.log(owners)
            // var fs = require('fs');
            // var jsonData = JSON.stringify(owners);
            // fs.writeFile("owners.json", jsonData, function(err) {
            //     if (err) {
            //         console.log(err);
            //     }
            // });

        });

    });

});







// let firtsRoundIds = [];
            // for (let i = 0; i < 4000; i++){
            //     ids.push(i);
            // }
            
            // let FirtsRoundOwners = {}
            // for (firtsRoundID of firtsRoundIds){
            //     try {
            //         FirtsRoundOwners[String(id)] = await deplyedBeerBotClub.connect(creator).ownerOf(firtsRoundID);
            //     } catch (e) {
            //         continue
            //     }                
            // }

            // var jsonData = JSON.stringify(FirtsRoundOwners);
            // fs.writeFile("ownersFirtsRound.json", jsonData, function(err) {
            //     if (err) {
            //         console.log(err);
            //     }
            // });

            // let checkArray = [1,2,3,4,5,6,7,8,9];
            // let specialBeerBotCounter = 0;
            // for (special in checkArray){
            //     let dir = FirtsRoundOwners[String(special)]
            //     specialBeerBotCounter++;
            //     console.log(dir)
            // }