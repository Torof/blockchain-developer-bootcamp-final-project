//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;


struct Winners {
    uint timestamp;
    address dixelMintWinner;
    address starmWinner;
}


library LibLottery {
    bytes32 constant ticketsStorageSlot = keccak256("ticketsStorage");
    bytes32 constant lotteryStorageSlot = keccak256("lotteryStorage");

    uint constant oneDayCoolDown = 86400;
    uint constant oneWeekCoolDown = 604800;
    uint constant oneMonthCoolDown = 2629743;
    uint constant ticketPrice = 500;

    /**
    * @notice all the variables about the lottery
    * @param
    * @param
    * @param
    * @param
    * @param
    * @param
    */
    struct LotteryStorage { 
    uint lastLaunchTime;
    address[] players;
    Winners[] allWinners;
    mapping(address => uint) lotteryTickets;
    mapping(address => uint) registeredTickets;
    mapping(address => uint) freeMintTickets;
    }


    /**
    * @notice fetch the LotteryStorage struct saved at a precise memory slot
    */
    function  lotteryStorage() internal pure returns (LotteryStorage storage ls){
        bytes32 slot = lotteryStorageSlot;
        assembly {
            ls.slot := slot
        }
    }
}

