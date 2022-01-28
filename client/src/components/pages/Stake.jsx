import React from 'react'
import "./styles/Pages.css"

export default class StakingPage extends React.Component {
    state = { stakedDixels: [], unStakedDixels: [], userStarmBalance: 0 }

    componentDidMount = () => {
        this.setState(this.updateAll());
    }

    componentWillUnmount = () => {
        this.setState({
            stakedDixels: [], 
            unStakedDixels: [], 
            userStarmBalance: 0
        })
    }
    updateAll = async () => {
        const { lotteryFacet, getterFacet, dixelFacet, accounts } = this.props;
        let starmBalance = await lotteryFacet.methods.balanceOfStarm(accounts[0]).call();
        let dixels = await getterFacet.methods.getDixels().call();
        let length = dixels.length;
        let userDixels = [];
        let stakedDixels = []
        let unStakedDixels = []

        for (let i = 0; i <= length - 1; i++) {
            if ((await dixelFacet.methods.ownerOf(i).call()) === accounts[0]) {
                let obj = {}
                let jsonPage
                obj.dixel = dixels[i]
                obj.id = i;
                await fetch(`https://ipfs.io/ipfs/${obj.dixel.URI}`)
                .then(async response => jsonPage = await response.json())
                obj.imageURI = jsonPage.image
                obj.dixelTraits = jsonPage.attributes
                userDixels.push(obj);
            }

        }
        unStakedDixels = userDixels.filter(obj => obj.dixel.staked === false)
        stakedDixels = userDixels.filter(obj => obj.dixel.staked === true)

        this.setState({ stakedDixels: stakedDixels, unStakedDixels: unStakedDixels, userStarmBalance: starmBalance });
    };



    stakeDixel = async (value) => {
        let { dixelFacet, accounts } = this.props;
        await dixelFacet.methods.stakeDix(value).send({ from: accounts[0] }).catch((error) => {
            if (error.code === 4001) {
                return alert("transaction rejected")
            } else if (error.code === -32603) {
                if (error.message.includes("staking")) {
                    return alert("This dixel is already staked !")
                }
            } else {
                return alert("internal error")
            }
        })
        await this.updateAll()
    }

    unStakeDixel = async (value) => {
        let { dixelFacet, accounts } = this.props;
        await dixelFacet.methods.unStakeDix(value).send({ from: accounts[0] })
        .catch((error) => {
            if (error.code === 4001) {
                return alert("transaction rejected")
            } else if (error.code === -32603) {
                if (error.message.includes("not staked")) {
                    return alert("This dixel isn't staked !")
                }
            } else {
            return alert("internal error")
            }
        })
        await this.updateAll()
        this.setState(this.updateAll())
    }

    levelUpDixel = async (value) => {
        const { dixelFacet, accounts } = this.props;

        await dixelFacet.methods.levelUp(value).send({ from: accounts[0] })
        .catch((error) => {
            if (error.code === 4001) {
                return alert("transaction rejected")
            } else if (error.code === -32603) {
                if (error.message.includes("max lvl")) {
                    return alert("This this dixel is already at the maximul level !")
                } else if (error.message.includes("limit reached")) {
                    return alert("All the collectors have been minted :'(")
                }
            } else {
                return alert("internal error")
            }
        })
        await this.updateAll()
        this.setState(this.updateAll())
    }

    render() {
        return (
            <div>
                <div>
                    Starm balance: {this.state.userStarmBalance}
                </div>
                <div>
                <p>unstaked Dixels :</p>
                <div className="card-list">
                {this.state.unStakedDixels.map((obj, i) => <div key={i} className="card">
                    <div className={"space-b card-list"}>
                    <div>rarity: {obj.dixel.rarity}</div>
                    <div >level: {obj.dixel.level}</div>
                    </div>
                    
                    <img src={obj.imageURI} className="image" alt="dixel.png" />
                    <div>
                    <button onClick={() => this.stakeDixel(this.state.unStakedDixels[i].id)}>Stake</button>
                    <button onClick={() => this.levelUpDixel(obj.id)}>level up</button>
                    </div>
                    
                </div>)}
                </div>
                </div>
                <p>Staked Dixels :</p>
                <div className="card-list">
                    
                {this.state.stakedDixels.map((obj, i) => <div key={i} className="card">
                    <div className="card-list space-b">
                    <div>rarity: {obj.dixel.rarity}</div>
                    <div >level: {obj.dixel.level}</div>
                    </div>
                    <img src={obj.imageURI} className="image" alt="dixel.png" />
                    <p>starm to withdraw :  {(Math.round(new Date().getTime()/ 1000) - obj.dixel.stakeInitTime)* obj.dixel.rarity * obj.dixel.level}</p>
                    <div>
                    <button onClick={() => this.unStakeDixel(this.state.stakedDixels[i].id)}>Unstake</button>
                    </div>
                </div>)}
                </div>

                
            </div>
        )
    }
}