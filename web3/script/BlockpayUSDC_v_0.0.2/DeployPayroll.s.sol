// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Script} from "lib/forge-std/src/Script.sol";
import {Payroll} from "../../src/BlockpayUSDC_v_0.0.2/Payroll.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployPayroll is Script {
    Payroll public payroll;
    HelperConfig public helperConfig;

    function run() public {
        helperConfig = new HelperConfig();
        (address priceFeed,,,) = helperConfig.currentNetwork();

        vm.startBroadcast();
        payroll = new Payroll(priceFeed);
        vm.stopBroadcast();
    }
}
