import React from 'react'
import "./styles/Pages.css"

export default class LotteryPage extends React.Component {
        state = {
            dailyWinners: [],
            userDixelTickets: 0,
            userStarmToWithdraw: 0,
            userStarmBalance: 0,
            userLotteryTickets: 0,
            registeredTickets: 0,
            value: 0
        }

        componentDidMount = () => {
            this.setState(this.updateAll)
        }

        updateAll = async () => {
            let {
                getterFacet,
                lotteryFacet,
                accounts
            } = this.props
            let dailyWinners = await getterFacet.methods.returnLotteryWinners().call()
            let lotteryTickets = await getterFacet.methods.returnLotteryTickets().call({
                from: accounts[0]
            })
            let dixelTickets = await getterFacet.methods.returnFreeMintTickets().call({
                from: accounts[0]
            })
            let registeredTickets = await getterFacet.methods.returnRegisteredTickets().call({
                from: accounts[0]
            })
            let starmToWithdraw = await getterFacet.methods.returnStarmWon().call({
                from: accounts[0]
            })
            let starmBalance = await lotteryFacet.methods.balanceOfStarm(accounts[0]).call({
                from: accounts[0]
            })

            this.setState({
                dailyWinners: dailyWinners,
                userDixelTickets: dixelTickets,
                registeredTickets: registeredTickets,
                userStarmToWithdraw: starmToWithdraw,
                userStarmBalance: starmBalance,
                userLotteryTickets: lotteryTickets
            })
        }

        buyTickets = async (amount) => {
            let {
                lotteryFacet,
                accounts
            } = this.props
            await lotteryFacet.methods.buyTicket(amount).send({
                from: accounts[0]
            }).catch((error) => {
                if(error.code === 4001){
                    return alert("transaction rejected")
                } else if (error.code === -32603){
                    if(error.message.includes("starm balance")) {
                        return alert("You don't have enough starm !")
                    } else return alert("internal error")
                } else return error
            })
            await this.updateAll()
        }

        registerForLottery = async (amount) => {
            let {
                lotteryFacet,
                accounts
            } = this.props
            await lotteryFacet.methods.registerForLottery(amount).send({
                from: accounts[0]
            }).catch((error) => {
                if(error.code === 4001) alert("transaction rejected")
                else if (error.code === -32603) {
                    if(error.message.includes("not enough tickets")) alert("You don't have enough tickets")
                    else return alert("internal error")
                } else return console.log(error)
            })
            await this.updateAll()
        }

        startLottery = async () => {
            let {
                lotteryFacet,
                accounts
            } = this.props
            await lotteryFacet.methods.startLottery().send({
                from: accounts[0]
            })
            .catch((error) => {
                if(error.code === 4001) alert("transaction rejected")
                else if(error.code === -32603){
                    if(error.message.includes("not enough players")) return alert("They're are not enough enough players yet")
                    else return alert("internal error")
                } else return console.log(error)
            })
            await this.updateAll()
        }

        handleChange = (event) => {
            this.setState({
                value: event.target.value
            });
        }

        withdrawStarm = async () => {
            let {
                lotteryFacet,
                accounts
            } = this.props;
            await lotteryFacet.methods.withdrawLotteryStarm().send({
                from: accounts[0]
            })
            .on("receipt", (receipt) => {
                let returnValues = receipt.events.StarmClaimed.returnValues
                console.log(returnValues)
            })
            .catch((error) => {
                if(error.code === 4001) return alert("transaction rejected")
                else if(error.code === -32603){
                    if(error.message.includes("no starm")) alert("You don't have starm to withdraw")
                    else return alert("internal error")
                } else return console.log(error)
            })
            await this.updateAll()
        }

    render() {
        return (
            <div>
                <div>
                    <div>Lottery tickets: {this.state.userLotteryTickets}</div>
                    <div>Free Mint Tickets: {this.state.userDixelTickets}</div>
                    <div>Registered Tickets: {this.state.registeredTickets}</div>
                    <div>
                        <p>Starm to withdraw: {this.state.userStarmToWithdraw}</p>
                    </div>
                    <div>starm balance: {this.state.userStarmBalance}</div>
                </div>
                Lottery

                    <div>
                    <label>
                        How many tickets would you like to buy ?:
                            <select value={this.state.numTickets} onChange={this.handleChange}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <button onClick={() => this.buyTickets(this.state.value)}>Buy Ticket</button>
                    </label>                        
                    </div>
                    <div>
                    <label>
                        How many tickets would you like to register ?:
                            <select value={this.state.numTickets} onChange={this.handleChange}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <button onClick={() => this.registerForLottery(this.state.value)}>Register</button>
                    </label>                        
                    </div>

                <button onClick={this.startLottery}>Start lottery</button>
                <button onClick={this.withdrawStarm}>WithdrawStarm</button>

                <div className='card-list'>
                    daily winners: 
                {this.state.dailyWinners.slice(1, this.state.dailyWinners.length).map((e, i) => 
                    <div key={i} className="card">
                        <p>at: {e.timestamp}</p>
                        <p>free dixel winner: {e.dixelMintWinner}</p>
                        <p>Starm winner: {e.starmWinner}</p>
                    </div>
                )}
                </div>
            </div>
        )
    }
}