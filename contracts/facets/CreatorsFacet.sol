//SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import {
    Dixel,
    LibDixel
} from "../libraries/LibDixel.sol";

contract CreatorsFacet {

        /**
    * @notice
    */
    modifier isCreator() {
        LibDixel.CreatorsStorage storage cs = LibDixel.creatorsStorage();
        require(msg.sender == cs.creators[0] || msg.sender == cs.creators[1], "only creators");
        _;
    }


        /**
     *@notice
     */
    function creatorWithdrawal() external payable isCreator() {
        LibDixel.CreatorsStorage storage cs = LibDixel.creatorsStorage();
        uint withdrawal = cs.creatorsBalance[msg.sender];
        cs.creatorsBalance[msg.sender] = 0;
        payable(msg.sender).transfer(withdrawal);
    }

    /**
     *@notice
     */
    function checkCreatorBalance() external view isCreator() returns(uint) {
        LibDixel.CreatorsStorage storage cs = LibDixel.creatorsStorage();
        return cs.creatorsBalance[msg.sender];
    }
}