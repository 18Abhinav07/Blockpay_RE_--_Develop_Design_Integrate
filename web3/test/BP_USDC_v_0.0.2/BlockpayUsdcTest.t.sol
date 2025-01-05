// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/Script.sol";
import {PriceConverter} from "src/BlockpayUSDC_v_0.0.2/PriceConverterAndAggregator.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockWeth} from "test/mocks/MockWeth.sol";
import {MockUsdc} from "test/mocks/MockUsdc.sol";
import {MockSwapRouter} from "test/mocks/MockSwapRouter.sol";
import {BlockpayUsdc} from "src/BlockpayUSDC_v_0.0.2/BlockpayUsdc.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DeployBlockpayUsdc} from "script/BlockpayUSDC_v_0.0.2/DeployBlockpayUsdc.s.sol";

contract blockpayUsdcTest is Test {
    BlockpayUsdc blockpay;
    DeployBlockpayUsdc deployer;
    ISwapRouter mockSwapRouter;
    address priceFeed;

    address USER = makeAddr("user");

    function setUp() public {
        console.log("BLOCKCHAIN ID :", block.chainid);
        deployer = new DeployBlockpayUsdc();
        blockpay = deployer.run();
        console.log("BlockpayUsdc address:", address(blockpay));
        console.log("Deployer address:", address(deployer));
        console.log("Owner address:", blockpay.owner());

        console.log("USDC OWNER:", MockUsdc(blockpay.getUSDC()).owner());
        console.log("WETH OWNER:", MockWeth(payable(blockpay.getWETH())).owner());
        console.log("SWAP ROUTER OWNER:", MockSwapRouter(payable(blockpay.getRouter())).owner());
    }

    function testDeploy() public view {
        assertEq(blockpay.owner(), msg.sender);
    }

    // function testFundContract() public {
    //     vm.deal(USER, 10000 ether);
    //     // Fund the contract
    //     vm.startPrank(USER);
    //     blockpay.fundContract{value: 200 ether}();
    //     vm.stopPrank();
    //     assertEq(blockpay.getTotalFundsUSDC(), 200 * 1e6);
    // }

    modifier fundContract() {
        vm.startPrank(blockpay.owner());
        blockpay.mintUSDCBasedOnUSDPool();
        vm.stopPrank();

        vm.deal(USER, 100 ether);
        // Fund the contract
        vm.startPrank(USER);
        blockpay.fundContract{value: 2 ether}();
        vm.stopPrank();
        _;
    }

    function testProcessPayment() public fundContract {
        uint256 paymentAmount = 100 * 1e6;

        vm.startPrank(blockpay.owner());
        blockpay.processPayment(USER, paymentAmount);
        vm.stopPrank();
        // Check if the user's USDC balance increased
        assertEq(IERC20(blockpay.getUSDC()).balanceOf(USER), paymentAmount);
        console.log("User USDC balance after payment:", IERC20(blockpay.getUSDC()).balanceOf(USER));
    }

    function testBurnUsdcToUsd() public fundContract {
        uint256 paymentAmount = 1000 * 1e6;
        vm.startPrank(blockpay.owner());
        blockpay.processPayment(USER, paymentAmount);

        console.log("USER USDC BALANCE BEFORE BURN: ", IERC20(blockpay.getUSDC()).balanceOf(USER));
        blockpay.burnUSDCToUSD(USER, paymentAmount);
        console.log("USER USD DEPOSITS AFTER BURN: ", blockpay.getUserUSDDeposits(USER));
    }
}
