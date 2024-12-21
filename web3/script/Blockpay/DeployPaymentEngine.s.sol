// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {StableToken} from "src/Blockcoin/StableToken.sol";
import {PaymentEngine} from "src/Blockpay/PaymentEngine.sol";
import {HelperConfig} from "script/Helpers/HelperConfig.s.sol";
import {DeployStableToken} from "script/Blockcoin/DeployStableToken.s.sol";

contract DeployPaymentEngine is Script {
    StableToken public blockCoin;
    HelperConfig public helperConfig;
    DeployStableToken public deployStableToken;

    function run() public returns (PaymentEngine) {
        helperConfig = new HelperConfig();
        deployStableToken = new DeployStableToken();
        blockCoin = deployStableToken.run("BlockCoin", "BKC");

        address[] memory allowedTokens = helperConfig.getAllowedTokens();
        address[] memory priceFeeds = helperConfig.getPriceFeeds();

        vm.startBroadcast(StableToken(address(blockCoin)).owner());
        PaymentEngine blockpay = new PaymentEngine(address(blockCoin), allowedTokens, priceFeeds);
        StableToken(address(blockCoin)).transferOwnership(address(blockpay));
        console2.log("\n========================================================");
        console2.log("      DEPLOYING PAYMENT ENGINE");
        console2.log("==========================================================");
        console2.log("      ENGINE        : %s", address(blockpay));
        console2.log("      TOKEN ADDRESS : %s", address(blockCoin));
        console2.log("      ENGINE OWNER  : %s", PaymentEngine(payable(address(blockpay))).owner());
        console2.log("      TOKEN OWNER   : %s", StableToken(address(blockCoin)).owner());
        console2.log("===========================================================\n");
        vm.stopBroadcast();
        return blockpay;
    }
}
