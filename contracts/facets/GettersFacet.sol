//SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import {LibDixel, Dixel} from "../libraries/LibDixel.sol";
import {LibLottery, Winners} from "../libraries/LibLottery.sol";
import {LibStarm} from "../libraries/LibStarm.sol";

contract Getters{

        /**
    * @return returns the array containing all the dixels
     */
    function getDixels() external view returns(Dixel[] memory) {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        return ds.dixels;
    }

    /**
     * @return supplies are return in a SupplyStorage struct
     */
    function returnSupplies() external pure returns(LibDixel.SupplyStorage memory supplies) {
        supplies = LibDixel.supplyStorage();
        return supplies;
    }

    /**
     * @return it returns a uint of the contract balance in ETH
     */
    function contractBalance() external view returns(uint) {
        return address(this).balance;
    }

        /**
     * @notice
     */
    function returnLotteryTickets() external view returns(uint) {
        LibLottery.LotteryStorage storage ls = LibLottery.lotteryStorage();
        return ls.lotteryTickets[msg.sender];
    }

    /**
     * @notice
     */
    function returnFreeMintTickets() external view returns(uint) {
    LibLottery.LotteryStorage storage ls = LibLottery.lotteryStorage();
        return ls.freeMintTickets[msg.sender];
    }

    /**
     * @notice
     */
    function returnRegisteredTickets() external view returns(uint) {
        LibLottery.LotteryStorage storage ls = LibLottery.lotteryStorage();
        return ls.registeredTickets[msg.sender];
    }

    /**
     * @notice
     */
    function returnStarmWon() external view returns(uint) {
        LibStarm.StarmStorage storage starm = LibStarm.starmStorage();
        return starm.starmToWithdraw[msg.sender];
    }

    /**
     * @notice
     */
    function returnLotteryWinners() external view returns(Winners[] memory) {
        return LibLottery.lotteryStorage().allWinners;
    }
}