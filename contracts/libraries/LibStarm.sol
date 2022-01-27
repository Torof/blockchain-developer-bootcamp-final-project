// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;


library LibStarm {
    bytes32 constant starmStorageSlot = keccak256("starmStorage");

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
    * @notice
    * @param starmToWithdraw mapping of the Starm an address can withdraw
    * @param _balances a mapping of the total Starm an address possesses
    * @param _totalSupply a uint of the total supply of Starm tokens.
    */
    struct StarmStorage {
    mapping(address => uint) starmToWithdraw;
    mapping(address => uint256) _balances;
    uint256 _totalSupply;
    }

    /**
    * @notice fetch the StarmStorage struct saved at a precise memory slot
    */
    function starmStorage() internal pure returns (StarmStorage storage sti){
        bytes32 slot = starmStorageSlot;
        assembly {
            sti.slot := slot
        }
    }
    
    /**
    * @notice mints Starm
    * @param _account address of the owner of the newly minted starm tokens
    * @param _amount amount of starm tokens to mint
     */
    function _mintStarm(address _account, uint256 _amount) internal {
        LibStarm.StarmStorage storage ss = LibStarm.starmStorage();
        require(_account != address(0), "ERC20: mint to the zero address");

        ss._totalSupply += _amount;
        ss._balances[_account] += _amount;
        emit Transfer(address(0), _account, _amount);

    }

    /**
    * @notice burns Starm
    * @param _account address of the owner of the newly minted starm tokens
    * @param _amount amount of starm tokens to mint
     */
        function _burnStarm(address _account, uint256 _amount) internal {
        LibStarm.StarmStorage storage ss = LibStarm.starmStorage();
        require(_account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = ss._balances[_account];
        require(accountBalance >= _amount, "ERC20: burn amount exceeds balance");
        unchecked {
            ss._balances[_account] = accountBalance - _amount;
        }
        ss._totalSupply -= _amount;

        emit Transfer(_account, address(0), _amount);    }
}
