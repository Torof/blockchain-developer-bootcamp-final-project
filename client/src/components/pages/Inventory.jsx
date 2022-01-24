import React from 'react'
import "./styles/Pages.css"

export default class InventoryAndLevel extends React.Component {
        state = {
            userDixels: [],
            starmBalance: 0,
            value: 0,
            show: false
        }

        componentDidMount = () => {
            this.setState(this.fetchUserDixels())
        }

        fetchUserDixels = async () => {
            const {
                dixelFacet,
                lotteryFacet,
                accounts
            } = this.props;

            let dixels = await dixelFacet.methods.getDixels().call();
            let length = dixels.length - 1;
            let starmBalance = await lotteryFacet.methods.balanceOfStarm(accounts[0]).call()
            let userDixels = [];

            for (let i = 0; i <= length; i++) {
                if ((await dixelFacet.methods.ownerOf(i).call()) === accounts[0]) {
                    let obj = {}
                    let jsonPage
                    obj.dixel = dixels[i]
                    obj.id = i
                    await fetch(`https://ipfs.io/ipfs/${obj.dixel.URI}`)
                    .then(async response => jsonPage = await response.json())
                    obj.imageURI = jsonPage.image
                    obj.dixelTraits = jsonPage.attributes
                    userDixels.push(obj);
                }
            }
            this.setState({
                userDixels: userDixels,
                starmBalance: starmBalance
            });
        };

        filter = async (value) => {
            await this.fetchUserDixels()
            let dixels = this.state.userDixels
            let filteredDixels = []

            if(Number(value) === 1) filteredDixels = dixels.filter(e => Number(e.dixel.rarity) === 1)
            else if(Number(value) === 2) filteredDixels = dixels.filter(e => Number(e.dixel.rarity) === 2)
            else if(Number(value) === 3) filteredDixels = dixels.filter(e => Number(e.dixel.rarity) === 3)
            else if(Number(value) === 4) filteredDixels = dixels.filter(e => Number(e.dixel.rarity) === 4)
            else if(Number(value) === 5) filteredDixels = dixels.filter(e => Number(e.dixel.level) === 1)
            else if(Number(value) === 6) filteredDixels = dixels.filter(e => Number(e.dixel.level) === 2)
            else if(Number(value) === 7) filteredDixels = dixels.filter(e => Number(e.dixel.level) === 3)
            else if(Number(value) === 8) filteredDixels = dixels.filter(e => Boolean(e.dixel.staked) === false)
            else if(Number(value) === 9) filteredDixels = dixels.filter(e => Boolean(e.dixel.staked) === true)
            else alert("command not recognized")
            this.setState({
                userDixels: filteredDixels
            })
        }

        handleChange = (event) => {
            this.setState({
                value: event.target.value
            });
        }

        displayAttributes = (attr) => {
            console.log(attr)
            console.log("head: ", attr[0].value)
            console.log("eyes: ", attr[1].value)
            console.log("mouth: ", attr[2].value)
            
        }

        handleMouseEnter = (e) => {
            e.target.style.cursor = "zoom-in" 
        }

    render() {
        return (
            <div>
                <p>starm balance: {this.state.starmBalance}</p>
                <p>Inventory</p>
                
                <label>
                            <select value={this.state.value} onChange={this.handleChange}>
                            <option value={0}>Select filter: </option> 
                            <option value={1}>common</option>
                            <option value={2}>uncommon</option>
                            <option value={3}>rare</option>
                            <option value={4}>legendary</option>
                            <option value={5}>Level 1</option>
                            <option value={6}>level 2</option>
                            <option value={7}>level 3</option>
                            <option value={8}>collectors</option>
                            <option value={9}>staked</option>
                            <option value={10}>not staked</option>
                        </select>
                        <button onClick={() => this.filter(this.state.value)}>Filter</button>
                        </label> 
                        <div className="card-list">
                        {this.state.userDixels.map((obj, i) => 
                    <div key={i} 
                    className="card" 
                    onClick={() => this.displayAttributes(obj.dixelTraits)}
                    onMouseEnter={this.handleMouseEnter}>
                    <img src={obj.imageURI} className="image" alt="dixel.png" />
                    <p>rarity : {obj.dixel.rarity}</p>
                    <p>level: {obj.dixel.level}</p>
                    <p>staked: {(obj.dixel.staked).toString()}</p>
                </div>)}
                        </div>
                
            </div>
        )
    }
}