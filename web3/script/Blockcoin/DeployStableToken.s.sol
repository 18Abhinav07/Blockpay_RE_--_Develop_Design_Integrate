// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {StableToken} from "src/Blockcoin/StableToken.sol";

contract DeployStableToken is Script {
    StableToken public blockCoin;

    function run(string memory _tokenName, string memory _tokenAbbreviation) public returns (StableToken) {
        vm.startBroadcast();
        blockCoin = new StableToken(_tokenName, _tokenAbbreviation);

        console2.log("\n===========================================================");
        console2.log("      DEPLOYING STABLE TOKEN");
        console2.log("=============================================================");
        console2.log("      TOKEN NAME        : %s", _tokenName);
        console2.log("      TOKEN ABBREVIATION: %s", _tokenAbbreviation);
        console2.log("      TOKEN OWNER       : %s", StableToken(blockCoin).owner());
        console2.log("=============================================================\n");
        vm.stopBroadcast();
        return blockCoin;
    }
}
