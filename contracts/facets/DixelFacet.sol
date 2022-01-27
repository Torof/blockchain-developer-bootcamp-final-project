//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import {
    Dixel,
    LibDixel
} from "../libraries/LibDixel.sol";
import {
    LibLottery
} from "../libraries/LibLottery.sol";
import {
    LibStarm
} from "../libraries/LibStarm.sol";
import "../ERC721.sol";

contract DixelFacet is ERC721 {
    /**
     * @dev is emitted when a Dixel is created
     */
    event DixelMinted(address _minter, uint _id, uint _mintPrice, Dixel _dixel);

    /**
     * @dev is emitted when a Dixel is put in staking
     */
    event Staking(uint _id, bool _isStaked, Dixel _dixel);

    /**
     * @dev is emitted when a Dixel is unStaked
     */
    event UnStaking(uint _id, bool _isStaked, uint _starmProduced, Dixel _dixel);

    /**
     * @dev is emitted when a Dixel is leveled up
     */
    event LevelUp(uint _tokenId, uint _oldLevel, uint _newLevel, Dixel _dixel);



    modifier isOwner(uint _tokenId) {
        require(msg.sender == ownerOf(_tokenId), "not owner");
        _;
    }

    modifier exists(uint _tokenId) {
        require(_exists(_tokenId), "NFT doesn't exist");
        _;
    }


    /**
     * @dev sets the price of the mint in function of the current supply
     */
    function getDixelPrice() public view returns(uint256) {
        LibDixel.SupplyStorage storage supplies = LibDixel.supplyStorage();
        uint currentSupply = supplies.mintedSupply;
        require(currentSupply <= LibDixel.maxMintedSupply, "Mint ended");
        if (currentSupply >= 1850) {
            return 100000000000000000; // 1850  - 1880 0.1ETH
        } else if (currentSupply >= 1700) {
            return 80000000000000000; // 1700 - 1850 0.08 ETH
        } else if (currentSupply >= 1150) {
            return 60000000000000000; // 1150 - 1700 0.06 ETH
        } else if (currentSupply >= 650) {
            return 50000000000000000; // 650 - 1150 0.05 ETH
        } else if (currentSupply >= 250) {
            return 30000000000000000; // 250 - 650 0.03 ETH
        } else {
            return 10000000000000000; // 0 - 250 0.01 ETH
        }
    }


    /**
     * @dev allow to mint a new Dixel for a price set in getDixelPrice()
     * @dev there is a security issue with the addresses as anyone
     * @param _addresses set of URI addresses for the future NFT's addresses.
     * Emits a {DixelMinted} event
     */
    function mintDixel(string[][] memory _addresses) external payable {
        LibDixel.SupplyStorage storage supplies = LibDixel.supplyStorage();
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(supplies.mintedSupply< LibDixel.maxMintedSupply, "all minted");
        require(getDixelPrice() == msg.value, "not enough ether");
        uint rarity = LibDixel.genRarity();
        LibDixel.changeSupplies(rarity);

        string[] memory mAddressArray = LibDixel.assignAddress(rarity, _addresses);
        Dixel memory tempDix = Dixel(1, mAddressArray[0], mAddressArray, rarity, 0, false);
        ds.dixels.push(tempDix);

        mint(msg.sender, ds.dixels.length - 1);
        LibDixel.fundCreators(msg.value);
        supplies.mintedSupply++;
        supplies.totalSupply++;
        emit DixelMinted(msg.sender, ds.dixels.length, msg.value, tempDix);
    }


    /**
     * @dev mint a Dixel for free with a won lottery ticket. User will still have to pay gas fee
     * @dev there is a security issue with the addresses as anyone
     * @param _addresses set of URI addresses for the future NFT's addresses.
     *
     * Emits a {DixelMinted} event
     */
    function mintFreeDixel(string[][] memory _addresses) external {
        LibDixel.SupplyStorage storage supplies = LibDixel.supplyStorage();
        LibLottery.LotteryStorage storage ls = LibLottery.lotteryStorage();
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(ls.freeMintTickets[msg.sender] >= 1, "no tickets");
        require(supplies.lotterySupply < LibDixel.maxLotteryMintedSupply, "No more lotteries");
        ls.freeMintTickets[msg.sender] -= 1;
        uint rarity = LibDixel.genRarity();
        LibDixel.changeSupplies(rarity);
        
        string[] memory mAddressArray = LibDixel.assignAddress(rarity, _addresses);
        Dixel memory tempDix = Dixel(1, mAddressArray[0], mAddressArray, rarity, 0, false);
        ds.dixels.push(tempDix);
        mint(msg.sender, ds.dixels.length - 1);
        supplies.lotterySupply++;
        supplies.totalSupply++;
        emit DixelMinted(msg.sender, ds.dixels.length, 0, tempDix);
    }

    /**
     * @dev overriden function to set the base URI to ipfs
     */
    function _baseURI() internal override pure returns(string memory) {
        return "https://ipfs.io/ipfs/";
    }

    /**
     * @dev overiden function to set ipfs metadata's address hash
     */
    function tokenURI(uint256 tokenId) public override view returns(string memory) {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory mAddress = ds.dixels[tokenId].URI;
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ?
            string(abi.encodePacked(baseURI, mAddress)) :
            '';
    }

    /**
    * @notice Stake a NFT to produce starm
    * @param _tokenId the id of the NFT to stake 
    ** Emits a {Staking} event
    */ 
    function stakeDix(uint _tokenId) external isOwner(_tokenId) exists(_tokenId){
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(ds.dixels[_tokenId].staked == false, "staking");
        ds.dixels[_tokenId].staked = true;
        ds.dixels[_tokenId].stakeInitTime = block.timestamp;

        emit Staking(_tokenId, true, ds.dixels[_tokenId]);
    }

    /**
     * @dev unStake chosen dixel and rewards minted starm to user
     * @param _tokenId the Dixel to unstake
     *
     ** Emits a {UnStaking} event
     */
    function unStakeDix(uint _tokenId) external isOwner(_tokenId) exists(_tokenId) {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(ds.dixels[_tokenId].staked == true, "not staked");
        Dixel memory dixel = ds.dixels[_tokenId];
        ds.dixels[_tokenId].staked = false;
        uint stakedTime = block.timestamp - dixel.stakeInitTime;
        uint StarmToMint = stakedTime * (dixel.level) * (dixel.rarity);
        ds.dixels[_tokenId].stakeInitTime = 0;
        LibStarm._mintStarm(msg.sender, StarmToMint);
        emit UnStaking(_tokenId, false, StarmToMint, ds.dixels[_tokenId]);
    }

    /**
     * @dev level up a Dixel for a cost of Starm
     * @param _tokenId the Dixel to level up
     *
     * Emits a {LevelUp} event
     */
    function levelUp(uint _tokenId) external isOwner(_tokenId) exists(_tokenId) {
        LibDixel.SupplyStorage storage supplies = LibDixel.supplyStorage();
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        Dixel memory dixel = ds.dixels[_tokenId];
        uint oldLevel = dixel.level;
        require(ds.dixels[_tokenId].level < 5, "max lvl");

        if (dixel.level == 4) {
            require(supplies.collectorsSupply <= LibDixel.maxCollectors, "limit reached");
            supplies.collectorsSupply++;
        }
        LibStarm._burnStarm(msg.sender, dixel.level * 1000);
        dixel.URI = dixel.levelURI[dixel.level + 1];
        dixel.level++;
        ds.dixels[_tokenId] = dixel;
        emit LevelUp(_tokenId, oldLevel, dixel.level, ds.dixels[_tokenId]);
    }

    /**
    * @notice withdraw starm produced by one staked NFT
    * @param _tokenId id of the staked NFT to withdraw the produced starm from
    */
        function withdrawProducedStarm(uint _tokenId) external {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        LibStarm.StarmStorage storage ss = LibStarm.starmStorage();
        Dixel memory dixel = ds.dixels[_tokenId];
        uint currentBlockTime = block.timestamp;

        require(ds.dixels[_tokenId].staked == true, "not staked");
        require(currentBlockTime >= dixel.stakeInitTime, "");
        require(ss.starmToWithdraw[msg.sender] != 0, "no starm");

        uint stakedTime = currentBlockTime - dixel.stakeInitTime;
        uint StarmToMint = stakedTime * (dixel.level) * (dixel.rarity); // FIXME: staking formula must be changed for mainnet deployment

        LibStarm._mintStarm(msg.sender, StarmToMint);
        ds.dixels[_tokenId].stakeInitTime = currentBlockTime;
    }

    // /**
    // * @return returns the array containing all the dixels
    //  */
    // function getDixels() external view returns(Dixel[] memory) {
    //     LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
    //     return ds.dixels;
    // }

    // /**
    //  * @return supplies are return in a SupplyStorage struct
    //  */
    // function returnSupplies() external pure returns(LibDixel.SupplyStorage memory supplies) {
    //     supplies = LibDixel.supplyStorage();
    //     return supplies;
    // }

    // /**
    //  * @return it returns a uint of the contract balance in ETH
    //  */
    // function contractBalance() external view returns(uint) {
    //     return address(this).balance;
    // }


}