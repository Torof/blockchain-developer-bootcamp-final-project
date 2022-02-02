// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamond Standard: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import "./libraries/LibDiamond.sol";
import {LibLottery, Winners} from "./libraries/LibLottery.sol";
import {LibDixel} from "./libraries/LibDixel.sol";
import {LibStarm} from "./libraries/LibStarm.sol";
import {LibOracle} from "./libraries/LibOracle.sol"; 
import "./interfaces/IDiamondLoupe.sol";
import "./interfaces/IDiamondCut.sol";
import "./interfaces/IERC173.sol";
import "./interfaces/IERC165.sol";
import "./interfaces/IERC721.sol";
import "./interfaces/IERC721Receiver.sol";
import "./interfaces/LinkTokenInterface.sol";

contract Diamond {
    // more arguments are added to this struct
    // this avoids stack too deep errors
    struct DiamondArgs {
        address owner;
    }

    constructor(IDiamondCut.FacetCut[] memory _diamondCut, DiamondArgs memory _args) payable {
        LibDiamond.diamondCut(_diamondCut, address(0), new bytes(0));
        LibDiamond.setContractOwner(_args.owner);
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        // adding ERC165 data
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;
        ds.supportedInterfaces[type(IERC721).interfaceId] = true;
        ds.supportedInterfaces[type(IERC721Receiver).interfaceId] = true;

        //Init variables
        LibLottery.lotteryStorage().allWinners.push( Winners({timestamp: 0, dixelMintWinner: address(0),starmWinner: address(0)}));
        LibDixel.SupplyStorage storage supplies = LibDixel.supplyStorage();
        LibDixel.DixelStorage storage dxs = LibDixel.dixelStorage();
        LibOracle.VRF storage vrf = LibOracle.vrfStorage();

        //Dixel supplies
        supplies.commonSupply = 800;
        supplies.uncommonSupply = 950;
        supplies.rareSupply = 995;
        supplies.legendarySupply = 1000;
        supplies.availableToGen = 1000;

        //ERC721
        dxs.name = "DIXEL";
        dxs.symbol = "DXL";

        //VRF MUMBAI
        // vrf.vrfCoordinator = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
        // vrf.linkToken = 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255;
        // vrf.keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        // vrf.fee = 0.1 * 10 ** 15;
        // vrf.LINK = LinkTokenInterface(0x8C7382F9D8f56b33781fE506E897a4F1e2d17255);

        //VRF Rinkeby
        vrf.vrfCoordinator = 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B;
        vrf.linkToken = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709;
        vrf.keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        vrf.fee = 0.1 * 10 ** 18;
        vrf.LINK = LinkTokenInterface(0x01BE23585060835E02B77ef475b0Cc51aA1e0709);

        //init address with starm for testing
        LibStarm._mintStarm(msg.sender, 100000);
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
        address facet = address(bytes20(ds.facetAddressAndSelectorPosition[msg.sig].facetAddress));
        require(facet != address(0), "Diamond: Function does not exist");
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }
}
