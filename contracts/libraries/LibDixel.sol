// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import {LibOracle} from "./LibOracle.sol";

    /**
    * @notice the structure of a Dixel
    * @param level uint the level of the NFT 1-4
    * @param URI string of the URI of the metadata of the NFT
    * @param levelURI an array of strings containing the metadata of each levelof the NFT
    * @param rarity uint of the rarity of a NFT based on its traits
    * @param stakeInitTime timestamp of when a NFT was staked
    * @param staked boolean. If a NFT is staked or not
     */
struct Dixel {
        uint256 level; // level of the dixel, will affect starm generation speed
        string URI; //URI pointing to the metadata of the dixel
        string [] levelURI; //array of ipfs hashes(URIs) pointing to the metadata of the next levels 
        uint256 rarity; // rarity of the Dixel, will affect starm generation speed
        uint256 stakeInitTime; // the time the staking started. Used to calculate Starm quantity
        bool staked; // If the Dixel is being staked or not
    }


library LibDixel {

    bytes32 constant supplyStorageSlot = keccak256("supplyStorage");
    bytes32 constant dixelStorageSlot = keccak256("dixelStorage");
    bytes32 constant creatorsStorageSlot = keccak256("creatorsStorage");

    uint256 constant maxMintedSupply = 800;
    uint256 constant maxTotalSupply = 1000;
    uint256 constant maxCollectors = 200;
    uint256 constant maxLotteryMintedSupply = 200;

    /**
    * @notice contains all the supplies of DXLs.
    * @param totalSupply the total supply of DXL
    * @param commonSupply number of common DXL minted
    * @param uncommonSupply number of uncommon DXL minted
    * @param rareSupply number of rare DXL minted
    * @param legendarySupply number of common DXL minted
    * @param mintedSupply number of DXL minted by payment
    * @param lotterySupply number of DXL minted from lottery tickets
    * @param collectorSupply number of collectors created
    * @param availableToGen number of remaining DXL that can be minted
     */
    struct SupplyStorage {
        uint256 totalSupply;
        uint256 commonSupply;
        uint256 uncommonSupply;
        uint256 rareSupply;
        uint256 legendarySupply;
        uint256 mintedSupply;
        uint256 lotterySupply;
        uint256 collectorsSupply;
        uint256 availableToGen;
    }

    /**
    * @notice all ERC721 data
    * @param dixels the array containing all existing DXL
    * @param name the name of the ERC721 NFT collection
    * @param symbol the symbol of the ERC721 NFT collection
    * @param owners mapping containing the owner of each NFT
    * @param balances number of NFT an address possesses
    * @param tokenApprovals The address approved to transfer on behalf of owner
    * @param operatorApprovals Verifies if an address is approved to transfer all NFTs on behalf of owner, returnstrue or false
     */
    struct DixelStorage{
        Dixel[] dixels;
        string name;
        string symbol;
        mapping(uint256 => address) owners;
        mapping(address => uint256) balances;
        mapping(uint256 => address) tokenApprovals;
        mapping(address => mapping(address => bool)) operatorApprovals;
    }

    /**
    * @notice all creators data
    * @param creatorsBalance the balance a creator can withdraw from contract
    * @param creator an array containing the addresses of the creators
     */
    struct CreatorsStorage {
        mapping(address => uint) creatorsBalance;
        address[2] creators;
    }

    /**
    * @notice fund the creators' balance
    * @param _value the value of the funds that will be shared between creators
     */
    function fundCreators (uint _value) internal {
        CreatorsStorage storage cs = creatorsStorage();
        uint part = _value / 2 ;
        for(uint i = 0; i < cs.creators.length; i++){
            cs.creatorsBalance[cs.creators[i]] += part;
        }

    }

    /**
    * @notice fetch the supplyStorage struct saved at a precise memory slot
    */
    function supplyStorage() internal pure returns (SupplyStorage storage ss) {
        bytes32 slot = supplyStorageSlot;
        assembly {
            ss.slot := slot
        }
    }

    /**
    * @notice fetch the DixelStorage struct saved at a precise memory slot
    */
    function dixelStorage() internal pure returns (DixelStorage storage ds){
        bytes32 slot = dixelStorageSlot;
        assembly {
            ds.slot := slot
        }
    }

    /**
    * @notice fetch the CreatorsStorage struct saved at a precise memory slot
    */
    function creatorsStorage() internal pure returns (CreatorsStorage storage cs){
        bytes32 slot = creatorsStorageSlot;
        assembly {
            cs.slot := slot
        }
    }

    /**
    * @dev randomly generates the rarity of the NFT to mint
    * @return rarity a uint between 1 to 4
    */
    function genRarity() internal returns (uint256 rarity) {
        SupplyStorage storage supplies = supplyStorage();
        
        require(supplies.availableToGen > 0, "limit reached");
        
        uint256 rand = LibOracle.getRandomNumber() % (supplies.availableToGen + 1);
        if (rand > 0 && rand <= supplies.commonSupply) return rarity = 1;
        else if (rand > supplies.commonSupply && rand  <= supplies.uncommonSupply) return rarity = 2;
        else if (rand > supplies.uncommonSupply && rand <= supplies.rareSupply) return rarity = 3;
        else if (rand > supplies.rareSupply && rand <= supplies.legendarySupply) return rarity = 4; 
        else revert("not in the scope");
    }

    /**
    * @notice assigns an array of addresses pointing to the metadata of each level of the dixel
    * @param _rarityIdentifier the actual rarity of the dixel
    * @param _mdtAddresses all possible arrays of addresses. One will become the levelURI array of the newly minted dixel.
    * @return mdtAddressArray
    */
    function assignAddress(uint256 _rarityIdentifier, string[][] memory _mdtAddresses) internal pure returns(string[] memory mdtAddressArray){
        require(_rarityIdentifier < 5, "RI not existing");
        if (_rarityIdentifier == 1) return mdtAddressArray = _mdtAddresses[0];
        if (_rarityIdentifier == 2) return mdtAddressArray = _mdtAddresses[1];
        if (_rarityIdentifier == 3) return mdtAddressArray = _mdtAddresses[2];
        if (_rarityIdentifier == 4) return mdtAddressArray = _mdtAddresses[3];
    }

    /**
    * @notice changes supply according to which rarity is minted
    * @param _rarity will decrease the supplies available
    */
    function changeSupplies(uint _rarity) internal{
        SupplyStorage storage supplies = supplyStorage();
                if (_rarity == 1){
            supplies.commonSupply--;
            supplies.uncommonSupply--;
            supplies.rareSupply--;
            supplies.legendarySupply--;
        } else if (_rarity == 2) {
            supplies.uncommonSupply--;
            supplies.rareSupply--;
            supplies.legendarySupply--;
        } else if (_rarity == 3) {
            supplies.rareSupply--;
            supplies.legendarySupply--;
        } else if (_rarity == 4){
            supplies.legendarySupply--;
        }
        supplies.totalSupply ++;
        supplies.availableToGen --;
    }
}