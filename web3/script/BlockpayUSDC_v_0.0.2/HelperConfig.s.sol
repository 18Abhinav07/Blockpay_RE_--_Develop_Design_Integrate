// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Script, console} from "../../lib/forge-std/src/Script.sol";
import {MockV3Aggregator} from "../../test/mocks/MockV3Aggregator.sol";
import {MockWeth} from "../../test/mocks/MockWeth.sol";
import {MockUsdc} from "../../test/mocks/MockUsdc.sol";
import {MockSwapRouter} from "../../test/mocks/MockSwapRouter.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        address priceFeed;
        address payable swapRouter;
        address payable weth;
        address payable usdc;
    }

    uint8 public constant DECIMALS = 8;
    // for 1:1 swapping I am changing this to 1e8.
    int256 public constant INITIAL_PRICE = 2400e8;
    NetworkConfig public currentNetwork;

    constructor() {
        if (block.chainid == 260) {
            currentNetwork = getZkSyncLocalConfig();
        } else if (block.chainid == 31337) {
            currentNetwork = getAnvilConfig();
        } else if (block.chainid == 11155111) {
            currentNetwork = getSepoliaConfig();
        } else if (block.chainid == 80002) {
            currentNetwork = getAmoyConfig();
        } else {
            revert("Unsupported network");
        }
    }

    function getZkSyncLocalConfig() internal returns (NetworkConfig memory) {
        vm.startBroadcast();
        MockV3Aggregator aggregator = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        MockWeth weth = new MockWeth();
        MockUsdc usdc = new MockUsdc();
        MockSwapRouter router = new MockSwapRouter(payable(address(weth)), payable(address(usdc)), address(aggregator));
        vm.stopBroadcast();
        return
            NetworkConfig(address(aggregator), payable(address(router)), payable(address(weth)), payable(address(usdc)));
    }

    function getAnvilConfig() internal returns (NetworkConfig memory) {
        vm.startBroadcast();
        MockV3Aggregator aggregator = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        MockWeth weth = new MockWeth();
        MockUsdc usdc = new MockUsdc();
        MockSwapRouter router = new MockSwapRouter(payable(address(weth)), payable(address(usdc)), address(aggregator));

        vm.stopBroadcast();
        return
            NetworkConfig(address(aggregator), payable(address(router)), payable(address(weth)), payable(address(usdc)));
    }

    function getSepoliaConfig() internal returns (NetworkConfig memory) {
        console.log("Sepolia network detected");
        vm.startBroadcast();
        address aggregator = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
        MockWeth weth = new MockWeth();
        MockUsdc usdc = new MockUsdc();
        MockSwapRouter router = new MockSwapRouter(payable(address(weth)), payable(address(usdc)), aggregator);

        vm.stopBroadcast();
        return NetworkConfig(aggregator, payable(address(router)), payable(address(weth)), payable(address(usdc)));
    }

    function getAmoyConfig() internal returns (NetworkConfig memory) {
        console.log("Polygon Amoy network detected");
        vm.startBroadcast();
        address aggregator = 0xF0d50568e3A7e8259E16663972b11910F89BD8e7;
        MockWeth weth = new MockWeth();
        MockUsdc usdc = new MockUsdc();
        MockSwapRouter router = new MockSwapRouter(payable(address(weth)), payable(address(usdc)), aggregator);

        vm.stopBroadcast();
        return NetworkConfig(aggregator, payable(address(router)), payable(address(weth)), payable(address(usdc)));
    }
}
