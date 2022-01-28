import React from 'react'
import jsonData from './addresses.json'
import "./styles/Pages.css"

export default class MintPage extends React.Component {
        state = {
            showMint: "no",
            mintedDixel: null,
            mintedURI: "",
            freeMintTickets: 0
        }

        componentDidMount = async () => {
            this.setState(this.fetchFreeTickets())
        }

        random = (modulus) => {
            let array = new Uint32Array(10);
            let randArray = window.crypto.getRandomValues(array);
            let rand1 = Math.floor(Math.random() * 100)
            let rand2 = randArray[rand1 % randArray.length]
            return rand2 % modulus
        }

        fetchFreeTickets = async () => {
            const {
                getterFacet,
                accounts
            } = this.props;

            let freeMintTickets = await getterFacet.methods.returnFreeMintTickets().call({
                from: accounts[0]
            })

            this.setState({
                freeMintTickets
            })
        }

        mintDixel = async (choice) => {
            const {
                getterFacet,
                dixelFacet,
                accounts
            } = this.props;
            this.setState({
                showMint: "loading"
            })
            let dixels = await getterFacet.methods.getDixels().call();
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

            let dixel;
            let currentPrice = await dixelFacet.methods.getDixelPrice().call();
            let commonChoice = this.random(commonAvailable.length)
            let uncommonChoice = this.random(uncommonAvailable.length)
            let rareChoice = this.random(rareAvailable.length)
            let legendaryChoice = this.random(legendaryAvailable.length)
            addressesArray.push(commonAvailable[commonChoice], uncommonAvailable[uncommonChoice], rareAvailable[rareChoice], legendaryAvailable[legendaryChoice])
            
            if (choice === 1) {
                await dixelFacet.methods.mintDixel(addressesArray).send({
                        from: accounts[0],
                        value: currentPrice
                    })
                    .on("receipt", (receipt) => {
                        dixel = receipt.events.DixelMinted.returnValues._dixel  
                    })
                    .catch((error) => {
                        this.setState({
                            showMint: "no"
                        })
                        if (error.code === 4001) {
                            return alert("transaction rejected")
                        } else if (error.code === -32603) {
                            if (error.message.includes("Mint ended")) {
                                return alert("The sale has ended !")
                            }
                            else return alert("internal error")
                        } else {
                            console.log(error)
                        }
                    })
            } else if (choice === 2) {
                if(Number(this.state.freeMintTickets) === 0){
                    this.setState({showMint: "no"})
                    return alert("You don't have tickets")
                }
                await dixelFacet.methods.mintFreeDixel(addressesArray).send({
                        from: accounts[0]
                    })
                    .on("receipt", (receipt) => {
                        dixel = receipt.events.DixelMinted.returnValues._dixel
                    })
                    .catch((error) => {
                        this.setState({
                            showMint: "no"
                        })
                        if (error.code === 4001) {
                            return alert("transaction rejected")
                        } else if (error.code === -32603) {
                            if (error.message.includes("no tickets")) {
                                return alert("you don't have a ticket")
                            } else {
                                return alert("internal error")
                            }
                        } else console.log(error)
                    })
                    await this.fetchFreeTickets()
            }
            if (dixel !== undefined){
            let jsonURI = dixel.URI
            let jsonPage;
            await fetch(`https://ipfs.io/ipfs/${jsonURI}`)
            .then(async response => jsonPage = await response.json())
            
            this.setState({
                mintedDixel: dixel,
                showMint: "yes",
                imageURI: jsonPage.image
            })
            } else {console.log("no dixel found")}
        };

    render() {
        let image;
        if(this.state.showMint === "no") image = null;
        if(this.state.showMint === "loading") image = <img src="https://ipfs.io/ipfs/QmYeQUra7rkT4KMdV4KwSk51KxkkDuBG1Tm5R96zR2FxQj" alt="loading"/>;
        if(this.state.showMint === "yes") image = <div>
        <img src={this.state.imageURI} alt="Dixel.png" />
        <p>rarity:  {this.state.mintedDixel.rarity}
        </p>

    </div>;
        return (
            <div>
                <h1> Minting page </h1>
                <p>free mint tickets: {this.state.freeMintTickets}</p>
                <div>{image}</div>
                <div>
                    <button onClick={() => this.mintDixel(1)}>Mint</button>
                    <button onClick={() => this.mintDixel(2)}>Mint with ticket</button>
                </div>
                
            </div>
        )
    }
}