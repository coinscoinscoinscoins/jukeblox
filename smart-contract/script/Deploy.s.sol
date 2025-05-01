// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Jukeblox} from "../src/Jukeblox.sol";

/**
 * forge script Deploy --rpc-url "https://sepolia.base.org" --account dev --sender $SENDER  --broadcast -vvvv --verify --verifier-url "https://api-sepolia.basescan.org/api" --etherscan-api-key $BASESCAN_API_KEY
 */
contract Deploy is Script {
    function run() public {
        vm.startBroadcast();

        // address owner = msg.sender;
        // address owner = 0x0BFc799dF7e440b7C88cC2454f12C58f8a29D986; // EOA
        // address owner = 0x2B654aB28f82a2a4E4F6DB8e20791E5AcF4125c6; // webapp wallet
        address owner = 0xB23ae9E97e757E508983cf225621A4e6B1D4a6E0;
        new Jukeblox(owner);

        vm.stopBroadcast();
    }
}
