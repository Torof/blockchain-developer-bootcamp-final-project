- Inheritance and Interfaces (Importing and extending contracts and/or using contract interfaces) Inheritances and Interfaces — (note: this is already a requirement in the final project, so you can simply describe which library or interface you use)

  => Several interfaces such as IERC721 or IERC165 are used.
  => ERC721 contract is inherited by the DixelFacet as well as many self built libraries to leverage the power of EIP2535 (diamond standard) and its diamondStorage.


- Upgradable Contracts (Ways to update a deployed contract’s logic or data) Upgradable Contracts and Additional Material: Upgradable Contracts

 => EIP2535 (diamond standard) is used allowing to go over the 24Ko limit per contract and allowing upgradability.


- Access Control Design Patterns (Restricting access to certain functions using things like Ownable, Role-based Control) Access Control Design Patterns

 => Some functions are restricted to only the owner and the creators of the Dapp or to the owners of the NFT to manipulate.

- Oracles (retrieving third-party data) Off-Chain Oracles and Chapter 5: Second-Order Effects — Oracles Revisited

 => Oracles are not yet implemented but will be for Random Number Generation. As it is mandatory for mainnet release.