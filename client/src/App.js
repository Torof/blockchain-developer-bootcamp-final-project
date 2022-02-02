import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import DiamondContract from "./contracts/Diamond.json";
import DixelFacet from "./contracts/DixelFacet.json";
import LotteryFacet from "./contracts/LotteryFacet.json";
import GetterFacet from "./contracts/GetterFacet.json";

import Home from "./components/pages/Home";
import MintPage from "./components/pages/Mint";
import StakingPage from "./components/pages/Stake";
import LotteryPage from "./components/pages/Lottery";
import InventoryAndLevel from "./components/pages/Inventory";

import {
  Switch,
  Route,
  Link
} from "react-router-dom";


import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();


      // Use web3 to get the user's accounts.
      let accounts = await web3.eth.getAccounts();

      window.ethereum.on('accountsChanged',async function () {
        //reloads interface with accounts[0]
        accounts = await web3.eth.getAccounts();
        window.location.reload();
      })

      // SWITCH TO MUMBAI
      // await window.ethereum.request({
      //   method: 'wallet_switchEthereumChain',
      //   params: [{ chainId: '0x13881' }],
      // }).catch(async () => {
      //   await window.ethereum.request({
      //     method: 'wallet_addEthereumChain',
      //     params: [{ 
      //       chainId: '0x13881',
      //       rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
      //       chainName: 'MATIC',
      //     }],
      //   }).catch(error => console.log(error))
      // })

      //SWITCH TO RINKEBY
      await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4' }],
        })

      // Get the diamond contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DiamondContract.networks[networkId];

      //Dixel facet
      const dixelFacetInstance = new web3.eth.Contract(
        DixelFacet.abi,
        deployedNetwork && deployedNetwork.address,
      );


      //Lottery facet
      const lotteryFacetInstance = new web3.eth.Contract(
        LotteryFacet.abi,
        deployedNetwork && deployedNetwork.address,
      );

      //Lottery facet
      const getterFacetInstance = new web3.eth.Contract(
        GetterFacet.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state
      this.setState({ web3, accounts, dixelFacet: dixelFacetInstance, lotteryFacet: lotteryFacetInstance, getterFacet: getterFacetInstance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>
          <nav className="Navig">
            <ul>
              <li className="home">
              <Link to="/">Home</Link>
              </li>
              <li>
              <Link to="/stake">Stake</Link>
              </li>
              <li>
              <Link to="/lottery">Lottery</Link>
              </li>
              <li>
              <Link to="/mint">Mint</Link>
              </li>
              <li>
              <Link to="/inventory">Inventory</Link>
              </li>
            </ul>
          </nav>
          <Switch>
              <Route exact path="/" component={() => <Home accounts={this.state.accounts} dixelFacet={this.state.dixelFacet} getterFacet={this.state.getterFacet}/>}/>
              <Route path="/mint" component={() => <MintPage accounts={this.state.accounts} dixelFacet={this.state.dixelFacet} lotteryFacet={this.state.lotteryFacet} getterFacet={this.state.getterFacet}/>}/>
              <Route path="/stake" component ={() => <StakingPage accounts={this.state.accounts} dixelFacet={this.state.dixelFacet} lotteryFacet={this.state.lotteryFacet} getterFacet={this.state.getterFacet}/>}/>
              <Route path="/lottery" component={() => <LotteryPage accounts={this.state.accounts} dixelFacet={this.state.dixelFacet} lotteryFacet={this.state.lotteryFacet} getterFacet={this.state.getterFacet}/>}/>
              <Route path="/inventory" component={() => <InventoryAndLevel accounts={this.state.accounts} dixelFacet={this.state.dixelFacet} lotteryFacet={this.state.lotteryFacet} getterFacet={this.state.getterFacet}/>}/>
            </Switch>
        </div>
      </div>
    );
  }
}

export default App;
