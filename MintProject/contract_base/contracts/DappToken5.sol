// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DappToken5 is ERC20 {
    constructor() ERC20("Dapp Token 5nd", "DAPPT5") {
        _mint(msg.sender, 5000000000000000000000);
    }
}
