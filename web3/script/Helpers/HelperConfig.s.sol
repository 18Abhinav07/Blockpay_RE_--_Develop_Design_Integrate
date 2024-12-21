// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MockV3Aggregator} from "test/mocks/MockV3Aggregator.sol";

contract HelperConfig is Script {
    // Constants
    uint8 private constant DECIMALS = 8;
    int256 private constant INITIAL_PRICE = 2000e8;

    // State variables
    mapping(address => address) private s_tokenToPriceFeed;
    address[] private s_allowedTokens;

    // Events
    event TokenPriceFeedAdded(address indexed token, address indexed priceFeed);

    constructor() {
        if (block.chainid == 31337) {
            getAnvilConfig();
        } else if (block.chainid == 11155111) {
            // Sepolia
            getSepoliaConfig();
        }
        // Add more network configs as needed
    }

    function getAnvilConfig() internal {
        vm.startBroadcast();

        // Deploy mock price feed for ETH
        MockV3Aggregator ethAggregator = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        addTokenAndFeed(address(0), address(ethAggregator)); // ETH uses address(0)

        // Add more mock price feeds for other tokens as needed

        vm.stopBroadcast();
    }

    function getSepoliaConfig() internal {
        // ETH / USD
        addTokenAndFeed(
            address(0),
            0x694AA1769357215DE4FAC081bf1f309aDC325306 // Sepolia ETH/USD feed
        );

        // Add more real price feeds for Sepolia
    }

    /**
     * @dev Adds a token and its price feed to the configuration
     * @param token The token address (address(0) for ETH)
     * @param priceFeed The Chainlink price feed address
     */
    function addTokenAndFeed(address token, address priceFeed) internal {
        s_tokenToPriceFeed[token] = priceFeed;
        s_allowedTokens.push(token);
        emit TokenPriceFeedAdded(token, priceFeed);
    }

    /**
     * @dev Returns all allowed tokens
     * @return Array of token addresses
     */
    function getAllowedTokens() external view returns (address[] memory) {
        return s_allowedTokens;
    }

    /**
     * @dev Returns price feeds for all allowed tokens
     * @return Array of price feed addresses
     */
    function getPriceFeeds() external view returns (address[] memory) {
        address[] memory priceFeeds = new address[](s_allowedTokens.length);

        for (uint256 i = 0; i < s_allowedTokens.length; i++) {
            priceFeeds[i] = s_tokenToPriceFeed[s_allowedTokens[i]];
        }

        return priceFeeds;
    }

    /**
     * @dev Returns the price feed for a specific token
     * @param token The token address to query
     * @return The price feed address for the token
     */
    function getPriceFeed(address token) external view returns (address) {
        return s_tokenToPriceFeed[token];
    }

    /**
     * @dev Returns both allowed tokens and their price feeds
     * @return tokens Array of token addresses
     * @return priceFeeds Array of corresponding price feed addresses
     */
    function getTokensAndFeeds() external view returns (address[] memory tokens, address[] memory priceFeeds) {
        tokens = s_allowedTokens;
        priceFeeds = new address[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            priceFeeds[i] = s_tokenToPriceFeed[tokens[i]];
        }

        return (tokens, priceFeeds);
    }
}
