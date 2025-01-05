// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Script, console} from "lib/forge-std/src/Script.sol";
import {MockUsdc} from "../../test/mocks/MockUsdc.sol";
import {MockWeth} from "../../test/mocks/MockWeth.sol";
import {MockSwapRouter} from "../../test/mocks/MockSwapRouter.sol";
import {BlockpayUsdc} from "src/BlockpayUSDC_v_0.0.2/BlockpayUsdc.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployBlockpayUsdc is Script {
    BlockpayUsdc public blockpay;
    HelperConfig public helperConfig;

    function run() public returns (BlockpayUsdc) {
        helperConfig = new HelperConfig();
        (address priceFeed, address payable router, address payable weth, address payable usdc) =
            helperConfig.currentNetwork();

        vm.startBroadcast();
        blockpay = new BlockpayUsdc(priceFeed, router, weth, usdc);

        MockWeth(weth).transferOwnership(address(blockpay));
        MockUsdc(usdc).transferOwnership(address(blockpay));
        MockSwapRouter(router).transferOwnership(address(blockpay));

        console.log("-----------------------WETH owner:", MockWeth(weth).owner());
        console.log("-----------------------USDC owner:", MockUsdc(usdc).owner());
        console.log("-----------------------Router owner:", MockSwapRouter(router).owner());

        vm.stopBroadcast();
        return blockpay;
    }
}
