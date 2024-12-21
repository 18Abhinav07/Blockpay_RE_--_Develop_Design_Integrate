// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DeployPaymentEngine} from "script/Blockpay/DeployPaymentEngine.s.sol";
import {PaymentEngine} from "src/Blockpay/PaymentEngine.sol";
import {StableToken} from "src/Blockcoin/StableToken.sol";

contract PaymentEngineTest is Test {
    DeployPaymentEngine deployer;
    PaymentEngine blockPay;
    StableToken blockCoin;

    address owner;
    address user;
    address recipient;

    uint256 constant INITIAL_BALANCE = 10e18;
    uint256 constant INITIAL_BLOCKCOIN_TO_ENGINE = 8000e18;
    uint256 constant PRECISION = 1e18;

    function setUp() public {
        deployer = new DeployPaymentEngine();
        blockPay = deployer.run();
        blockCoin = StableToken(blockPay.getBlockCoinAddress());

        owner = blockPay.owner();
        user = makeAddr("USER");
        recipient = makeAddr("RECIPIENT");

        vm.deal(owner, INITIAL_BALANCE);
        vm.deal(user, INITIAL_BALANCE);
        vm.deal(recipient, INITIAL_BALANCE);

        console.log("=== SETUP COMPLETE ===");
        console.log("Owner: %s", owner);
        console.log("User: %s", user);
        console.log("Recipient: %s", recipient);
        console.log("Deployed PaymentEngine Address: %s", address(blockPay));
        console.log("Deployed StableToken Address: %s", address(blockCoin));
    }

    modifier mintToTheEngine() {
        vm.startPrank(owner);
        console.log("=== MINTING BLOCKCOIN TO PAYMENT ENGINE ===");
        console.log("Initial BlockCoin Balance in Engine: %s", blockCoin.balanceOf(address(blockPay)));
        blockPay.getBlockCoinUsingFiat(INITIAL_BLOCKCOIN_TO_ENGINE, address(blockPay));
        console.log("Updated BlockCoin Balance in Engine: %s", blockCoin.balanceOf(address(blockPay)));
        vm.stopPrank();
        _;
    }

    function testGetBlockCoinWorks() public mintToTheEngine {
        vm.startPrank(user);

        console.log("=== USER INITIATES BLOCKCOIN PURCHASE ===");
        console.log("User Initial ETH Balance: %s", address(user).balance);
        console.log("Recipient Initial BlockCoin Balance: %s", blockCoin.balanceOf(recipient));

        for (uint256 i = 0; i < 4; i++) {
            blockPay.getBlockCoin{value: 1e18}(address(0), 1e18, recipient);
            console.log("Iteration %s:", i + 1);
            console.log("  Engine ETH Balance: %s", address(blockPay).balance);
            console.log("  User ETH Balance: %s", address(user).balance);
            console.log("  Recipient BlockCoin Balance: %s", blockCoin.balanceOf(recipient));
        }

        vm.stopPrank();

        uint256 expectedBlockCoinBalance = 1980 * 4 * (10 ** 18);
        console.log("=== TEST ASSERTIONS ===");
        console.log("Recipient Final BlockCoin Balance: %s", blockCoin.balanceOf(recipient));
        console.log("Expected Recipient BlockCoin Balance: %s", expectedBlockCoinBalance);

        assertEq(blockCoin.balanceOf(recipient), expectedBlockCoinBalance);
    }
}
