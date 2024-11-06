// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {PriceConverter} from "./PriceConverterAndAggregator.sol";

contract Payroll {
    // Error Messages.
    error Payroll__NotTheOwnerOfTheContract();
    error Payroll__NotEnoughAmountFunded();
    error Payroll__ContractHasNoFunds();
    error Payroll__WithdrawFalied();
    error Payroll__PaymentTransferFalied();

    //Events.
    event PaymentProcessed(address indexed _address, uint256 _amount);
    event ContractDeployed(address indexed _owner);
    event ContractFunded(address indexed _funder, uint256 _amount);

    // State Variables.
    address private immutable i_owner;
    address priceFeed;
    uint256 private s_totalFunds;
    uint256 private constant MINIMUM_AMOUNT_TO_FUND = 100e18;

    using PriceConverter for uint256;

    constructor(address _priceFeed) {
        i_owner = msg.sender;
        priceFeed = _priceFeed;
        emit ContractDeployed(i_owner);
    }

    receive() external payable {
        fundContract();
    }

    fallback() external payable {
        fundContract();
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert Payroll__NotTheOwnerOfTheContract();
        }
        _;
    }

    // Functions.
    function fundContract() public payable {
        // store the details of funnding in the database not on the chain
        // here we are just sending the funds to the contract
        if (msg.value.getConversionRate(priceFeed) < MINIMUM_AMOUNT_TO_FUND) {
            revert Payroll__NotEnoughAmountFunded();
        }
        emit ContractFunded(msg.sender, msg.value);
        s_totalFunds += msg.value;
    }

    // Withdraw funds from the contract.
    function withdrawFunds() public onlyOwner {
        if (s_totalFunds == 0) {
            revert Payroll__ContractHasNoFunds();
        }
        (bool success,) = payable(i_owner).call{value: address(this).balance}("");
        if (!success) {
            revert Payroll__WithdrawFalied();
        }

        s_totalFunds = 0;
    }

    // Process payment to the employee.
    function processPayment(address _address, uint256 _amount) public onlyOwner {
        if (_amount > s_totalFunds) {
            revert Payroll__ContractHasNoFunds();
        }
        (bool success,) = _address.call{value: _amount}("");
        if (!success) {
            revert Payroll__PaymentTransferFalied();
        }
        emit PaymentProcessed(_address, _amount);
        s_totalFunds -= _amount;
    }

    // Getter Functions.
    function owner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (address) {
        return priceFeed;
    }

    function getTotalFunds() public view returns (uint256) {
        return s_totalFunds;
    }

    function getMinimumAmountToFund() public pure returns (uint256) {
        return MINIMUM_AMOUNT_TO_FUND;
    }
}
