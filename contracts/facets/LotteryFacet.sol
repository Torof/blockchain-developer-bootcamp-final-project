//SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import {
    LibLottery, Winners
} from "../libraries/LibLottery.sol";
import {
    LibStarm
} from "../libraries/LibStarm.sol";
import {LibOracle} from "../libraries/LibOracle.sol";

contract LotteryFacet {

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     */
    event DixelLotteryWinners(address _winner);
        /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     */
    event StarmLotteryWinners(address _winner);

        /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     */
    event TicketsBought(address indexed _buyer, uint _amount);

        /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     */
    event RegisteredTickets(address indexed _buyer, uint _amount);

        /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     */
    event LotteryStarted(address indexed _starter, uint _init_time, address[] _winners);

        /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     */
    event StarmClaimed(address indexed _from, uint _amount);

    /**
     * @dev a user can check its balance in Starm
     * @param _owner the balance of the caller
     */
    function balanceOfStarm(address _owner) external view returns(uint) {
        LibStarm.StarmStorage storage starm = LibStarm.starmStorage();
        return starm._balances[_owner];
    }

    /**
    * @dev will be changed by  chainlink RNG for mainnet deployment
     */
    function _generateRandomnessLottery(string memory _string) internal view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, _string)));
    }

    /**
     * @param _amount number of lottery tickets to buy
     */
    function buyTicket(uint _amount) external {
        LibStarm.StarmStorage storage starm = LibStarm.starmStorage();
        require(starm._balances[msg.sender] >= LibLottery.ticketPrice * _amount, "not enough starm balance");
        LibLottery.LotteryStorage storage ls = LibLottery.lotteryStorage();
        ls.lotteryTickets[msg.sender] += _amount;
        LibStarm._burnStarm(msg.sender,(LibLottery.ticketPrice * _amount));
        emit TicketsBought(msg.sender, _amount);
    }

    /**
    * @notice 
    * @param _amount number of tickets to spend
    */
    function registerForLottery(uint _amount) external {
    LibLottery.LotteryStorage storage ls = LibLottery.lotteryStorage();
        require(ls.lotteryTickets[msg.sender] >= _amount, "not enough tickets");
        ls.lotteryTickets[msg.sender] -= _amount;
        for (uint i = 0; i <= _amount; i++) {
            ls.players.push(msg.sender);
        }
        ls.registeredTickets[msg.sender] += _amount;
        emit RegisteredTickets(msg.sender, _amount);
    }

    /**
     * @dev allow a user to withdraw the Starms won in the lottery
     */
    function withdrawLotteryStarm() external {
        LibStarm.StarmStorage storage starm = LibStarm.starmStorage();
        require(starm.starmToWithdraw[msg.sender] > 0, "no starm");
        uint amount = starm.starmToWithdraw[msg.sender];
        starm.starmToWithdraw[msg.sender] = 0;
        LibStarm._mintStarm(msg.sender, amount);
        emit StarmClaimed(msg.sender, amount);
    }

    /**
     * @dev initiate lottery and will select Dixel winners and Starm winners
     */
    function startLottery() public {
        LibStarm.StarmStorage storage starm = LibStarm.starmStorage();
        LibLottery.LotteryStorage storage ls = LibLottery.lotteryStorage();

        // require(block.timestamp >= ls.lastLaunchTime + LibLottery.oneDayCoolDown, "cool down");
        require(ls.players.length >= 20, "not enough players");
        address[] memory players = ls.players;

        uint rand = LibOracle.getRandomNumber();
        uint[] memory moreRand = LibOracle.expand(rand, 2); 

        uint p = moreRand[0] % players.length;
        uint p2 = moreRand[1] % players.length;

        address winnerD = players[p];
        address winnerS = players[p2];

        ls.freeMintTickets[winnerD] += 1;
        starm.starmToWithdraw[winnerS] += 200;

        Winners memory dayWinners = Winners(block.timestamp, winnerD, winnerS);

        for (uint i = 0; i < players.length; i++) {
            ls.registeredTickets[players[i]] = 0;
        }
        ls.allWinners.push(dayWinners);
        delete ls.players;
        ls.lastLaunchTime = block.timestamp;
    }

}
