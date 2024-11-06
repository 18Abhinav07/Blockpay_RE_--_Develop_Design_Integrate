/**
 * @title PriceConverter
 * @dev Library for converting ETH amounts to USD using Chainlink price feeds.
 * 
 * @notice This library provides functions to convert ETH amounts to USD based on the latest price data from Chainlink oracles.
 * 
 * @dev The library uses a constant DECIMALS to handle precision and a constant USD_PRECISION to adjust the price data.
 * 
 * @dev Functions:
 * - conversion_price: Retrieves the latest price of ETH in USD from a Chainlink oracle.
 * - get_conversion_rate: Converts a given amount of ETH to its equivalent value in USD.
 * - get_version: Retrieves the version of the Chainlink price feed contract.
 * 
 * @dev Dependencies:
 * - AggregatorV3Interface from Chainlink contracts.
 * 
 * @param chain The address of the Chainlink price feed contract.
 * @param ETH_amount The amount of ETH to be converted to USD.
 * 
 * @return conversion_price: The latest price of ETH in USD.
 * @return get_conversion_rate: The equivalent value of the given ETH amount in USD.
 * @return get_version: The version of the Chainlink price feed contract.
 */
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    uint256 private constant DECIMALS = 1e18;
    int256 private constant USD_PRECISION = 1e10;

    function conversionPrice(address chain) internal view returns (uint256) {
        (, int256 price,,,) = AggregatorV3Interface(chain).latestRoundData();
        return uint256(price * USD_PRECISION);
    }

    function getConversionRate(uint256 ETH_amount, address chain) internal view returns (uint256) {
        uint256 ETH_price = conversionPrice(chain);
        uint256 ETH_amount_in_USD = (ETH_amount * ETH_price) / DECIMALS;
        return ETH_amount_in_USD;
    }
}
