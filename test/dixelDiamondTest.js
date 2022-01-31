const Diamond = artifacts.require('Diamond')
const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const LotteryFacet = artifacts.require('LotteryFacet')
const DixelFacet = artifacts.require('DixelFacet')
const GetterFacet = artifacts.require('GetterFacet')
let jsonData = require('../client/src/components/pages/addresses.json')

random = (modulus) => {
    let rand1 = Math.floor(Math.random() * 100) % modulus
    return rand1 % modulus
}

contract('Diamond', async (accounts) => {
    let diamond

    const zeroAddress = '0x0000000000000000000000000000000000000000'

    before(async () => {
        diamond = await Diamond.deployed();
        diamondCutFacet = new web3.eth.Contract(DiamondCutFacet.abi, diamond.address);
        diamondLoupeFacet = new web3.eth.Contract(DiamondLoupeFacet.abi, diamond.address);
        ownershipFacet = new web3.eth.Contract(OwnershipFacet.abi, diamond.address);
        web3.eth.defaultAccount = accounts[0];
        dixelFacetDiamond = new web3.eth.Contract(DixelFacet.abi, diamond.address)
        lotteryFacetDiamond = new web3.eth.Contract(LotteryFacet.abi, diamond.address)
        getterFacetDiamond = new web3.eth.Contract(GetterFacet.abi, diamond.address)
    })

    mintNFT = async (choice, account) => {
        //gets all existing NFTs
        let dixels = await getterFacetDiamond.methods.getDixels().call();
        let addressesArray = []
        let commonAvailable = jsonData.common;
        let uncommonAvailable = jsonData.uncommon;
        let rareAvailable = jsonData.rare;
        let legendaryAvailable = jsonData.legendary;

        dixels.forEach(e => {
            if (Number(e.rarity) === 1) {
                for (let i = 0; i < jsonData.common.length; i++) {
                    if (jsonData.common[i][0] === e.URI) {
                        commonAvailable.splice(i, 1)
                    }
                }
            }
            if (Number(e.rarity) === 2) {
                for (let i = 0; i < jsonData.uncommon.length; i++) {
                    if (jsonData.uncommon[i][0] === e.URI) {
                        uncommonAvailable.splice(i, 1)
                    }
                }
            }
            if (Number(e.rarity) === 3) {
                for (let i = 0; i < jsonData.rare.length; i++) {
                    if (jsonData.rare[i][0] === e.URI) {
                        rareAvailable.splice(i, 1)
                    }
                }
            }
            if (Number(e.rarity) === 4) {
                for (let i = 0; i < jsonData.legendary.length; i++) {
                    if (jsonData.legendary[i][0] === e.URI) {
                        legendaryAvailable.splice(i, 1)
                    }
                }
            }
        })

        //gets the price of minting at current time
        let currentPrice = await dixelFacetDiamond.methods.getDixelPrice().call();
        let commonChoice = random(commonAvailable.length)
        let uncommonChoice = random(uncommonAvailable.length)
        let rareChoice = random(rareAvailable.length)
        let legendaryChoice = random(legendaryAvailable.length)
        addressesArray.push(commonAvailable[commonChoice], uncommonAvailable[uncommonChoice], rareAvailable[rareChoice], legendaryAvailable[legendaryChoice])

        if(choice == 0) {
            //Mints a dixel that costs the mint price + gas fees
            await dixelFacetDiamond.methods.mintDixel(addressesArray).send({
                from: account,
                gas: 1000000,
                value: currentPrice
            }).on("receipt", (receipt) => {
                dixel = receipt.events.DixelMinted.returnValues._dixel
            })
        }
        else if(choice == 1) {
            //Mints a dixel with a ticket, only gas fees to pay
            await dixelFacetDiamond.methods.mintFreeDixel(addressesArray).send({
                from: account,
                gas: 1000000
            }).on("receipt", (receipt) => {
                dixel = receipt.events.DixelMinted.returnValues._dixel
            })
        }
        else console.log("error")
        
        return dixel
    }

    describe("Minting and transfering", () => {
        it("returns name and symbol", async () => {
            //gets the name of the NFT collection
            nameNFT = await dixelFacetDiamond.methods.name().call()
            //gets the symbol of the NFT collection
            symbolNFT = await dixelFacetDiamond.methods.symbol().call()

            assert.equal(nameNFT,"DIXEL")
            assert.equal(symbolNFT,"DXL")
        })

        it("mints 4 NFT, n°1,3,4 to account0 and n°2 to account1", async () => {
            dixelsBefore = await getterFacetDiamond.methods.getDixels().call();
            assert.isEmpty(dixelsBefore)
            //Mints one NFT ,paying price + gas fees, to address of accounts[0] and registers it to dixel1 variable
            dixel1 = await mintNFT(0, accounts[0])
            //Mints one NFT ,paying price + gas fees, to address of accounts[1] and registers it to dixel2 variable
            dixel2 = await mintNFT(0, accounts[1])
            dixel3 = await mintNFT(0, accounts[0])
            dixel4 = await mintNFT(0, accounts[0])

            assert.equal(await dixelFacetDiamond.methods.ownerOf(0).call(), accounts[0])
            assert.equal(await dixelFacetDiamond.methods.ownerOf(1).call(), accounts[1])
            assert.equal(await dixelFacetDiamond.methods.ownerOf(2).call(), accounts[0])
            assert.equal(await dixelFacetDiamond.methods.ownerOf(3).call(), accounts[0])


            //gets all existing NFTs
            dixels = await getterFacetDiamond.methods.getDixels().call();

            //checks that there are two more NFTs avec minting X2
            assert.equal(dixels.length, dixelsBefore.length + 4)

            //Registers NFT#1's URI and NFT#2's URI to variables
            NFT1URI = await dixelFacetDiamond.methods.tokenURI(0).call();
            NFT2URI = await dixelFacetDiamond.methods.tokenURI(1).call();

            //checks that NFT#1 and NFT#2 have the right URI
            assert.equal("https://ipfs.io/ipfs/"+ dixel1.URI, NFT1URI)
            assert.equal("https://ipfs.io/ipfs/" + dixel2.URI, NFT2URI)

            //Checks that the first minted dixel is the NFT #1
            assert.equal(dixel1.URI, dixels[0].URI)

            //Checks that the secondly minted dixel is the NFT #2
            assert.equal(dixel2.URI, dixels[1].URI)

            //checks that owner of NFT#1 is account[0]
            assert.equal(await dixelFacetDiamond.methods.ownerOf(0).call(), accounts[0])

            //checks that owner of NFT#2 is account[1]
            assert.equal(await dixelFacetDiamond.methods.ownerOf(1).call(), accounts[1])

        })

        it("transfers NFT 1 from account[0] to account[1] and back", async () => {
            //register owner of NFT#1 to a variable
            let ownerOfNFT1 = await dixelFacetDiamond.methods.ownerOf(0).call()

            //checks that owner of NFT#1 is accounts[0]
            assert.equal(accounts[0], ownerOfNFT1)

            //Transfer NFT#1 from accounts[0] to accounts[1]
            await dixelFacetDiamond.methods.transferFrom(accounts[0], accounts[1], 0).send({
                from: accounts[0],
                gas: 1000000
            }).on("receipt", (receipt) => {
                ownerOfNFT1 = receipt.events.Transfer.returnValues.to
            })

            //Checks that owner of NFT#1 is now account[1]
            assert.equal(ownerOfNFT1, accounts[1])

            //Transfers NFT#1 from accounts[1] to accounts[0]
            await dixelFacetDiamond.methods.transferFrom(accounts[1], accounts[0], 0).send({
                from: accounts[1],
                gas: 1000000
            }).on("receipt", (receipt) => {
                ownerOfNFT1 = receipt.events.Transfer.returnValues.to
            })

            //Cheks that owner of NFT#1 is now accounts[0]
            assert.equal(ownerOfNFT1, accounts[0])
        })
    })

    describe("Level up", () => {
        it("levels up NFT1 from level1  to level2",async () => {
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[0], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 1st element of levelURI array" )
            assert.equal((await getterFacetDiamond.methods.getDixels().call())[0].level, 1)
            await dixelFacetDiamond.methods.levelUp(0).send({
                from: accounts[0],
                gas: 1000000
            })

            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[1], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 2nd element of levelURI array" )
            assert.equal((await getterFacetDiamond.methods.getDixels().call())[0].level, 2)
        })

        it("levels up NFT1 from level2  to level3",async () => {
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[1], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 2nd element of levelURI array" )
            await dixelFacetDiamond.methods.levelUp(0).send({
                from: accounts[0],
                gas: 1000000
            })

            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[2], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 3rd element of levelURI array" )
            assert.equal((await getterFacetDiamond.methods.getDixels().call())[0].level, 3)
        })

        it("levels up NFT1 from level3  to level4",async () => {
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[2], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 3rd element of levelURI array" )
            await dixelFacetDiamond.methods.levelUp(0).send({
                from: accounts[0],
                gas: 1000000
            })

            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[3], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 4th element of levelURI array" )
            assert.equal((await getterFacetDiamond.methods.getDixels().call())[0].level, 4)
        })

        it("levels up NFT1 from level4  to level5",async () => {
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[3], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 4th element of levelURI array" )
            await dixelFacetDiamond.methods.levelUp(0).send({
                from: accounts[0],
                gas: 1000000
            })

            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].URI, await dixelFacetDiamond.methods.tokenURI(0).call() )
            assert.equal("https://ipfs.io/ipfs/" + (await getterFacetDiamond.methods.getDixels().call())[0].levelURI[4], await dixelFacetDiamond.methods.tokenURI(0).call(), "actual URI should be equal to the 5th element of levelURI array" )
            assert.equal((await getterFacetDiamond.methods.getDixels().call())[0].level, 5, "level should equal to 5")
        })

        it("reverts on level up and returns max limit reached", async () => {
            await dixelFacetDiamond.methods.levelUp(0).send({
                from: accounts[0],
                gas: 1000000
            }).catch((error) => {
                assert(error, "should revert with 'max level' error ")
            })
        })
    })

    

    describe("approvals and transfers", () => {
        it("approve account[1] to transfer NFT1 from account[0] to account[2] and transfers NFT1 from acc0 to acc2",async () => {
            isApproved = await dixelFacetDiamond.methods.getApproved(0).call()

            //checks that no one is approved to transfer NFT1
            assert.equal(isApproved, zeroAddress)

            await dixelFacetDiamond.methods.approve(accounts[1], 0).send({
                from: accounts[0],
                gas: 1000000
            })

            isApproved = await dixelFacetDiamond.methods.getApproved(0).call()

            assert.equal(isApproved, accounts[1])

            ownerOfNFT1 = await  dixelFacetDiamond.methods.ownerOf(0).call()

            assert.equal(ownerOfNFT1, accounts[0])

            await dixelFacetDiamond.methods.safeTransferFrom(accounts[0], accounts[2], 0).send({
                from: accounts[1],
                gas: 1000000
            })

            ownerOfNFT1 = await  dixelFacetDiamond.methods.ownerOf(0).call()

            assert.equal(ownerOfNFT1, accounts[2])

        })

        it("should not allow to send another NFT from accounts[0] by accounts[1]",async () => {
            isApproved = await dixelFacetDiamond.methods.getApproved(2).call()
            assert.notEqual(isApproved, accounts[1], "accounts[1] should not be approved to transfer NFT3 from accounts[0]" )
            assert.equal(await dixelFacetDiamond.methods.ownerOf(2).call(), accounts[0], "owner should be accounts[0]")

            await dixelFacetDiamond.methods.safeTransferFrom(accounts[0], accounts[2], 2).send({
                from: accounts[1],
                gas: 1000000
            }).catch((error) => {
                assert(error, "should revert with error ")
            })
        })

        it("approves accounts[1] to transfer all from accounts[0]", async () =>{

            assert.equal(await dixelFacetDiamond.methods.isApprovedForAll(accounts[0], accounts[1]).call(), false)

            await dixelFacetDiamond.methods.setApprovalForAll(accounts[1], true).send({
                from: accounts[0],
                gas: 1000000
            })


            assert.equal(await dixelFacetDiamond.methods.isApprovedForAll(accounts[0], accounts[1]).call(), true)
        })

        it("accounts[1] transfers NFT3 and NFT4 from accounts[0] to accounts[2]", async () => {

            assert.equal(await dixelFacetDiamond.methods.isApprovedForAll(accounts[0], accounts[1]).call(), true, "accounts[1] should be approved for all NFTs of accounts[0]")

            await dixelFacetDiamond.methods.safeTransferFrom(accounts[0], accounts[2], 2).send({
                from: accounts[1],
                gas: 1000000
            })

            assert.equal(await dixelFacetDiamond.methods.ownerOf(2).call(), accounts[2], "accounts[2] should be owner of NFT3")
            assert.equal(await dixelFacetDiamond.methods.ownerOf(3).call(), accounts[0],"accounts[0] should be owner of NFT4")
            assert.equal(await dixelFacetDiamond.methods.isApprovedForAll(accounts[0], accounts[1]).call(), true,"accounts[1] should be approved for all NFTs of accounts[0]")

            await dixelFacetDiamond.methods.transferFrom(accounts[0], accounts[2], 3).send({
                from: accounts[1],
                gas: 1000000
            })

            assert.equal(await dixelFacetDiamond.methods.ownerOf(3).call(), accounts[2], "accounts[2] should be owner of NFT4")
        })
    })

    describe("staking and unstaking", () => {

        it("stakes a NFT", async () => {
            //Checks that NFT#1 is not staked
            assert.equal(dixels[0].staked, false)

            //Stakes NFT#1 (from accounts[2])
            await dixelFacetDiamond.methods.stakeDix(0).send({
                from: accounts[2],
                gas: 1000000,
            }).on("receipt", (receipt) => {
                dixel = receipt.events.Staking.returnValues._dixel
            })
        
            //Checks that NFT#1 is staked
            assert.equal(dixel.staked, true)
        })

        it("unstakes a NFT", async () => {
            //Checks that NFT#1 is staked
            assert.equal((await getterFacetDiamond.methods.getDixels().call())[0].staked, true)

            //Unstakes NFT#1
            await dixelFacetDiamond.methods.unStakeDix(0).send({
                from: accounts[2],
                gas: 1000000,
            }).on("receipt", (receipt) => {
                dixel = receipt.events.UnStaking.returnValues._dixel
            })

            //Checks that NFT#1 is unstaked
            assert.equal(dixel.staked, false)
            assert.equal((await getterFacetDiamond.methods.getDixels().call())[0].staked, false)
        })

    })

    describe("Lottery", () => {
        it("buys 20 tickets and then 10 more", async () => {

            assert.equal(await getterFacetDiamond.methods.returnLotteryTickets().call(), 0)
            starmBalance = await lotteryFacetDiamond.methods.balanceOfStarm(accounts[0]).call({
                from: accounts[0]
            })

            await lotteryFacetDiamond.methods.buyTicket(20).send({
                from: accounts[0],
                gas: 1000000
            }).on("receipt", (receipt) => {
                boughtAmount = receipt.events.TicketsBought.returnValues._amount
            })


            assert.equal(boughtAmount,await getterFacetDiamond.methods.returnLotteryTickets().call())
            assert.equal(await getterFacetDiamond.methods.returnLotteryTickets().call(), 20)

            await lotteryFacetDiamond.methods.buyTicket(10).send({
                from: accounts[0],
                gas: 1000000
            }).on("receipt", (receipt) => {
                boughtAmount = receipt.events.TicketsBought.returnValues._amount
            })

            assert.equal(boughtAmount, 10)
            assert.equal(await getterFacetDiamond.methods.returnLotteryTickets().call(), 30)
        })

        it("registers 30 tickets", async () => {
            
            assert.equal(await getterFacetDiamond.methods.returnRegisteredTickets().call(), 0)

            await lotteryFacetDiamond.methods.registerForLottery(15).send({
                from: accounts[0],
                gas: 1000000
            }) 
            
            assert.equal(await getterFacetDiamond.methods.returnRegisteredTickets().call(), 15)

            await lotteryFacetDiamond.methods.registerForLottery(15).send({
                from: accounts[0],
                gas: 1000000
            })
            
            assert.equal(await getterFacetDiamond.methods.returnRegisteredTickets().call(), 30)

            assert.equal(await getterFacetDiamond.methods.returnLotteryTickets().call(), 0)
        })

        it("starts lottery", async() => {
            await lotteryFacetDiamond.methods.startLottery().send({
                from: accounts[0],
                gas: 1000000
            })
            winners = await getterFacetDiamond.methods.returnLotteryWinners().call()
            assert.equal(winners[1].dixelMintWinner, accounts[0])
            assert.equal(winners[1].dixelMintWinner, accounts[0])
            starmToClaim = await getterFacetDiamond.methods.returnStarmWon().call()
            mintTicket = await getterFacetDiamond.methods.returnFreeMintTickets().call()
            assert.equal(starmToClaim, 200)
            assert.equal(mintTicket, 1)
        })

        it("claims prizes", async () => {
            
            starmBalance = await lotteryFacetDiamond.methods.balanceOfStarm(accounts[0]).call()
            assert(await getterFacetDiamond.methods.returnStarmWon().call(), 200)
            await lotteryFacetDiamond.methods.withdrawLotteryStarm().send({
                from: accounts[0],
                gas: 1000000
            })
            starmBalance2 = await lotteryFacetDiamond.methods.balanceOfStarm(accounts[0]).call()
            assert(await getterFacetDiamond.methods.returnStarmWon().call(), 0)
            assert(starmBalance + 200, starmBalance2)

            NFTBalanceBeforeClaim = await dixelFacetDiamond.methods.balanceOf(accounts[0]).call()
            await mintNFT(1, accounts[0])
            NFTBalanceAfterClaim = await dixelFacetDiamond.methods.balanceOf(accounts[0]).call()
            assert.equal(Number(NFTBalanceBeforeClaim )+ 1, Number(NFTBalanceAfterClaim))
        })
    })
})