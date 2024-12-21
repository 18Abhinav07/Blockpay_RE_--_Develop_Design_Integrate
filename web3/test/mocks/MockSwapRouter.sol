// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MockV3Aggregator} from "./MockV3Aggregator.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {MockUsdc} from "./MockUsdc.sol";
import {console} from "forge-std/Script.sol";
import {PriceConverter} from "src/PriceConverterAndAggregator.sol";

contract MockSwapRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using PriceConverter for uint256;

    uint256 public constant PRECISION = 1e12; // For simplified price ratios
    address priceFeed;
    address public immutable WETH; // Wrapped ETH token address
    address public immutable USDC; // USDC token address

    event SwapExecuted(address indexed user, uint256 amountInWETH, uint256 amountOutUSDC);

    constructor(address payable _weth, address payable _usdc, address _priceFeed) Ownable(msg.sender) {
        WETH = _weth;
        USDC = _usdc;
        priceFeed = _priceFeed;
    }

    /**
     * @dev Executes an exact input swap from WETH to USDC
     * @param params Swap parameters for Uniswap's `exactInputSingle`
     */
    function exactInputSingle(ISwapRouter.ExactInputSingleParams calldata params)
        external
        payable
        nonReentrant
        returns (uint256 amountOut)
    {
        require(params.tokenIn == WETH, "Invalid input token");
        require(params.tokenOut == USDC, "Invalid output token");
        require(params.amountIn > 0, "AmountIn must be greater than 0");

        // Transfer WETH from the sender to the router contract
        IERC20(WETH).safeTransferFrom(msg.sender, address(this), params.amountIn);

        // Check if the router has enough USDC to provide the swap
        console.log("----->AMOUNT IN WETH: ", params.amountIn);
        console.log("----->CONVERSION RATE: ", params.amountIn.getConversionRate(priceFeed));
        uint256 amountOutUSDC = params.amountIn.getConversionRate(priceFeed) / PRECISION;

        console.log("--------->AMOUNT OUT USDC: ", amountOutUSDC);
        require(IERC20(USDC).balanceOf(address(this)) >= amountOutUSDC, "Insufficient USDC liquidity");

        console.log("ROUTER's WETH BALANCE: ", IERC20(WETH).balanceOf(address(this)));
        console.log("ROUTER's USDC BALANCE BEFORE SWAP: ", IERC20(USDC).balanceOf(address(this)));

        // Transfer USDC to the sender
        IERC20(USDC).safeTransfer(msg.sender, amountOutUSDC);
        console.log("ROUTER's USDC BALANCE AFTER SWAP: ", IERC20(USDC).balanceOf(address(this)));

        emit SwapExecuted(msg.sender, params.amountIn, amountOutUSDC);

        return amountOutUSDC;
    }

    /**
     * @dev Allows the owner to withdraw tokens from the contract in case of emergency.
     * @param token The token to withdraw (either WETH or USDC).
     * @param amount The amount to withdraw.
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token == WETH || token == USDC, "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Check contract's USDC balance
     */
    function getUSDCBalance() public view returns (uint256) {
        return IERC20(USDC).balanceOf(address(this));
    }

    /**
     * @dev Check contract's WETH balance
     */
    function getWETHBalance() public view returns (uint256) {
        return IERC20(WETH).balanceOf(address(this));
    }

    /**
     * @dev Allow the contract to receive ETH
     */
    receive() external payable {
        // Log received ETH (for testing and debugging purposes)
        console.log("ETH Received: ", msg.value);
    }

    /**
     * @dev Fallback function in case ETH is sent with data
     */
    fallback() external payable {
        // Log received ETH with data
        console.log("ETH Received (Fallback): ", msg.value);
    }
}
