github repository: https://github.com/torof/blockchain-developer-bootcamp-final-project

Deployed Dapp :  https://dixeland.eth.link/#/

address for NFT certification: 0x3E6a0889614e94892AA517D85Ce8A9AEdA1d1946


__DIXEL NFT__ 

This a Dapp that allows you to mint a randomly generated Dixel from 78 unique traits.
You can stake your NFTs to earn Starm as a reward. The rarity and the level of your Dixel will greatly influence the velocity of starm production.
Starm can be spent:
- to level up your Dixels.
- to buy lottery tickets to maybe win the right to mint a Dixel for free, transactions costs at your expense.

//Feature coming up: buy other Dixels for starm on our native Dixel marketplace
 
 _THE LOTTERY_ :

 The lottery can be entered by buying lottery tickets,with Starm, and then registering chosen spots in the lottery. The more tickets you buy, the more your odds of wining go up !!
 => Lottery rewards:
   - Earn a ticket to mint a Dixel for free !! (Transactions costs are at the user's expanse)
   - Earn Starm to level up your Dixel or to enter Lottery again and try your luck!

 _THE MARKETPLACE_ (upcoming):
- Buy and sell Dixels for Starm or ETH ! 

_THE DIXELS_:

   - Uniquely generated from over 78 possible traits.
   - There are 4 levels of rarity from common, uncommon, rare to legendary. Its rarity greatly influences Starm generation.
   - The rarity of a Dixel is based on the sum of the rarity of each traits it is composed of.
   - A Dixel can be level up, upgrading its starm generation capabilities and modifying its appearance !!
     => The last level is called "Collector" and only 200 Dixels can be transformed into collectors !


------------------------------------------------------------

_DIRECTORY STRUCTURE_:

This projects is built using React.js and Truffle.
- The front end of the project can be accessed in the folder ./client/src
- The folder ./client/src/components/pages contains all the pages that constitutes the Dapp.
- The contracts' ABIs and contracts' deployed addresses can be found in /client/contracts
- The solidity contracts can be found in ./contracts
- All network configuration, compiler's version ... can be found in the file truffle-config.js
- Tests can be found in ./test

_TEST INSTRUCTIONS_:



./test/dixelDiamond.js : $ truffle test --network Rinkeby
  Tests cannot be made locally (or only with a previous commit) because chainlink RNG is implemented.
  //All tests passing

_INSTALL_: 

$ cd client/
$ npm i

_BUILD_: 

$ npm run build

local testnet is configured on port :8545

