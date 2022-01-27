//SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import "./interfaces/IERC721.sol";
import "./utils/Address.sol";
import "./utils/Strings.sol";
import {LibDixel} from "./libraries/LibDixel.sol";
import "./interfaces/IERC721Receiver.sol";

contract ERC721 is IERC721 { 
    using Address for address;
    using Strings for uint256;

    function _exists(uint256 tokenId) internal view returns (bool){
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        if(ds.owners[tokenId] != address(0)) return true;
        else return false;
    }

    function name() public view returns(string memory) {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        return ds.name;
    }

    function symbol() public view returns(string memory){
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        return ds.symbol;
    }

    function totalSupply() public view returns(uint) {
        LibDixel.SupplyStorage storage ss = LibDixel.supplyStorage();
        return ss.totalSupply;
    }

        /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) public override view returns (uint256 balance){
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(owner != address(0), "zero address");
        return ds.balances[owner];
    }

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 _tokenId) public override view returns (address){
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        address owner = ds.owners[_tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        return owner;
    }

        /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be have been allowed to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

        /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) public virtual override {
        require(_isApprovedOrOwner(msg.sender, _tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(_from, _to, _tokenId, _data);
    }

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public override{
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(_from != address(0) && _to !=address(0));
        require(ds.owners[_tokenId] == msg.sender || ds.tokenApprovals[_tokenId] == msg.sender || ds.operatorApprovals[ds.tokenApprovals[_tokenId]][_from] == true);
        ds.balances[_from] -= 1;
        ds.balances[_to] +=1;
        ds.owners[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

        /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `_data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal virtual {
        _transfer(_from, _to, _tokenId);
        require(_checkOnERC721Received(_from, _to, _tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
        function _transfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal virtual {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(ERC721.ownerOf(_tokenId) == _from, "ERC721: transfer from incorrect owner");
        require(_to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(_from, _to, _tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), _tokenId);

        ds.balances[_from] -= 1;
        ds.balances[_to] += 1;
        ds.owners[_tokenId] = _to;

        emit Transfer(_from, _to, _tokenId);

        _afterTokenTransfer(_from, _to, _tokenId);
    }

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address _to, uint256 _tokenId) public override{
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(_to != address(0));
        require(ds.owners[_tokenId] !=address(0));
        require(ds.owners[_tokenId] != _to);
        require( msg.sender == ds.owners[_tokenId] || ds.operatorApprovals[ds.owners[_tokenId]][msg.sender] == true);
        ds.tokenApprovals[_tokenId] = _to;

        _approve(_to, _tokenId);
    }

        /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits a {Approval} event.
     */
    function _approve(address _to, uint256 _tokenId) internal virtual {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        ds.tokenApprovals[_tokenId] = _to;
        emit Approval(ERC721.ownerOf(_tokenId), _to, _tokenId);
    }


    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) public override view returns (address){
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");

        return ds.tokenApprovals[tokenId];
    }

    function mint(address _to, uint _tokenId) internal {
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        require(_to != address(0), "ERC721: mint to the zero address");
        require(!_exists(_tokenId), "ERC721: token already minted");
        ds.balances[_to] += 1;
        ds.owners[_tokenId] = _to;

        emit Transfer(address(0), _to, _tokenId);
    }

            /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits a {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        require(owner != operator, "ERC721: approve to caller");
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        ds.operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool _approved) public override {
        _setApprovalForAll(msg.sender, operator, _approved);
    }

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) public override view returns (bool){
        LibDixel.DixelStorage storage ds = LibDixel.dixelStorage();
        return ds.operatorApprovals[owner][operator];
    }

        /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ERC721.ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, _data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

        /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

        /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    // function supportsInterface(bytes4 interfaceId) external virtual view returns (bool){}
}