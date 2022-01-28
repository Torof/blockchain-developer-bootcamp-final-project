import React from 'react'
import "./styles/Pages.css"



export default class Home extends React.Component {
    state = {supplies: []}

    componentDidMount = async () => {
        const {
            getterFacet,
            accounts
        } = this.props;
        let result = await getterFacet.methods.returnSupplies().call();
        let supplies = [
            (800 - result[1]),
            (150 - (result[2] - result[1])),
            (45 - (result[3] -result[2])),
            (5 -(result[4] - result[3])),
            result[7],
        ];
        let account = accounts[0]
        this.setState({supplies, account})
    }


    render() {
        return (
            <div>
                <p> account: {this.state.account}</p>
                <div>
                    <p>common: {this.state.supplies[0]}</p>
                    <p>uncommon: {this.state.supplies[1]}</p>
                    <p>rare: {this.state.supplies[2]}</p>
                    <p>legendary:{this.state.supplies[3]}</p>
                    <p>collectors:{this.state.supplies[4]}</p>

                </div>
            </div>
        )
    }
}

// uint256 dixSupply;
//         uint256 commonSupply;
//         uint256 uncommonSupply;
//         uint256 rareSupply;
//         uint256 legendarySupply;
//         uint256 mintedSupply;
//         uint256 lotterySupply;
//         uint256 collectorsSupply;
//         uint256 availableToGen;