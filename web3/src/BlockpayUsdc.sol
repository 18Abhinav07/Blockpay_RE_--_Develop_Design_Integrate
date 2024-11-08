// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PriceConverter} from "./PriceConverterAndAggregator.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MockWeth} from "test/mocks/MockWeth.sol";
import {MockUsdc} from "test/mocks/MockUsdc.sol";
import {console} from "forge-std/Script.sol";

/**
 * @title BlockpayUsdc
 * @author Abhinav Pangaria
 * @dev FUTURE IMPROVEMENTS:
 *      -> Need to implement the ETH sell and liquidity feature for USD.
 *      -> The withdraw facility between USDC and USD from the liquidity.
 */
contract BlockpayUsdc is Ownable {
    // Error Messages
    error Payroll__NotTheOwnerOfTheContract();
    error Payroll__NotEnoughAmountFunded();
    error Payroll__ContractHasNoFunds();
    error Payroll__WithdrawFailed();
    error Payroll__PaymentTransferFailed();
    error Payroll__SwapFailed();
    error Payroll__InsufficientOutputAmount();

    // Events
    event PaymentProcessed(address indexed _address, uint256 _amount);
    event ContractDeployed(address indexed _owner);
    event ContractFunded(address indexed _funder, uint256 _amount);
    event SwapCompleted(uint256 ethAmount, uint256 usdcAmount);
    event EthPriceChecked(uint256 lastPrice, uint256 currentPrice, bool thresholdMet);
    event EthSoldForUSD(uint256 ethAmount, uint256 usdcAmount);

    // State Variables
    address public priceFeed;

    address payable USDC;
    address payable WETH;

    ISwapRouter public immutable swapRouter;
    uint256 private s_totalFundsUSDC;
    uint256 private constant ETH_DECIMALS = 1e18;
    uint256 private constant USDC_DECIMALS = 1e6;
    uint256 private constant USDC_DECIMAL_PRECISION = 1e12;
    uint256 private constant PRICE_FEED_DECIMALS = 1e8;
    uint256 private USD_LIQUIDITY = 10000000e18; // In ether decimals of 18

    uint256 private constant MINIMUM_AMOUNT_TO_FUND = 100 * USDC_DECIMALS; // in terms of USDC
    uint256 private constant SLIPPAGE_TOLERANCE = 50;
    uint256 private lastEthPriceUSD;
    uint256 private constant PRICE_GAIN_THRESHOLD = 20 * PRICE_FEED_DECIMALS; // 20 USD increase in price

    mapping(address => uint256) private s_usersToUsdDeposits;

    using PriceConverter for uint256;

    constructor(address _priceFeed, address _router, address payable _weth, address payable _usdc)
        Ownable(msg.sender)
    {
        priceFeed = _priceFeed;
        WETH = _weth;
        USDC = _usdc;
        swapRouter = ISwapRouter(_router);
        emit ContractDeployed(owner());
    }

    function withdrawUSDC(uint256 amount, address to) external onlyOwner {
        uint256 actualBalance = IERC20(USDC).balanceOf(address(this));
        if (amount > actualBalance || amount > s_totalFundsUSDC) {
            revert Payroll__ContractHasNoFunds();
        }

        bool success = IERC20(USDC).transfer(to, amount);
        if (!success) {
            revert Payroll__WithdrawFailed();
        }

        s_totalFundsUSDC -= amount;
    }

    function fundContract() public payable {
        if (msg.value == 0) revert Payroll__NotEnoughAmountFunded();
        uint256 amountInETH = msg.value;

        // Calculate minimum amount out with slippage tolerance
        uint256 expectedUSDC = getExpectedUSDCAmount(amountInETH);
        console.log("------------------> EXPECTED USDC: ", expectedUSDC);
        uint256 minAmountOut = expectedUSDC * (10000 - SLIPPAGE_TOLERANCE) / (10000 * USDC_DECIMAL_PRECISION);
        console.log("------------------> MINIMUM AMOUNT OUT: ", minAmountOut);

        MockUsdc(USDC).mint(address(swapRouter), 2 * minAmountOut);

        console.log("------------------> SENDER: ", msg.sender);
        console.log("------------------> SENDERS ETH BALANCE:", msg.sender.balance);
        console.log("------------------> CONTRACTS ETH BALANCE: ", address(this).balance);
        console.log("------------------> CONTRACTS WETH BALANCE: ", IERC20(WETH).balanceOf(address(this)));

        MockWeth(WETH).deposit{value: amountInETH}();
        console.log("------------------> CONTRACTS ETH BALANCE AFTER MINT: ", address(this).balance);
        console.log("------------------> CONTRACTS WETH BALANCE AFTER MINT: ", IERC20(WETH).balanceOf(address(this)));
        console.log("------------------> SENDERS ETH BALANCE:", msg.sender.balance);

        IERC20(WETH).approve(address(swapRouter), amountInETH);
        uint256 amountOutUSDC = swapETHToUSDC(amountInETH, minAmountOut);
        console.log("------------------> CONTRACTS WETH BALANCE AFTER SWAP: ", IERC20(WETH).balanceOf(address(this)));
        console.log("------------------> CONTRACTS USDC BALANCE AFTER SWAP: ", IERC20(USDC).balanceOf(address(this)));

        emit SwapCompleted(amountInETH, amountOutUSDC);
        emit ContractFunded(msg.sender, amountOutUSDC);
        s_totalFundsUSDC += amountOutUSDC;

        lastEthPriceUSD = PriceConverter.conversionPrice(priceFeed);
    }

    function processPayment(address _address, uint256 _amountUSDC) public onlyOwner {
        uint256 actualBalance = IERC20(USDC).balanceOf(address(this));
        if (_amountUSDC > actualBalance || _amountUSDC > s_totalFundsUSDC) {
            revert Payroll__ContractHasNoFunds();
        }
        console.log("CONTRACTS USDC BALANCE BEFORE PAYMENT: ", IERC20(USDC).balanceOf(address(this)));

        bool success = IERC20(USDC).transfer(_address, _amountUSDC);
        if (!success) {
            revert Payroll__PaymentTransferFailed();
        }
        console.log("PAYMENT TO: ", _address);
        console.log("CONTRACTS USDC BALANCE AFTER PAYMENT: ", IERC20(USDC).balanceOf(address(this)));
        console.log("USERS USDC BALANCE AFTER PAYMENT: ", IERC20(USDC).balanceOf(_address));

        emit PaymentProcessed(_address, _amountUSDC);
        s_totalFundsUSDC -= _amountUSDC;
    }

    function checkEthPrice() public onlyOwner {
        uint256 currentEthPrice = PriceConverter.conversionPrice(priceFeed);
        bool thresholdMet = false;

        if (currentEthPrice > lastEthPriceUSD + PRICE_GAIN_THRESHOLD) {
            thresholdMet = true;
            triggerEthSale();
        }

        emit EthPriceChecked(lastEthPriceUSD, currentEthPrice, thresholdMet);
        lastEthPriceUSD = currentEthPrice;
    }

    function triggerEthSale() internal {
        uint256 ethBalance = address(WETH).balance;
        if (ethBalance > 10 ether) {
            MockWeth(WETH).withdraw(ethBalance - 10 ether);
            // now we withdraw the excess amount of eth from the weth and will sell it but
            // that function is not made yet so we capture the total sale amount.

            uint256 usdReceived = getExpectedUSDCAmount(ethBalance);
            USD_LIQUIDITY += usdReceived;
            emit EthSoldForUSD(ethBalance, usdReceived); // Emit sale event
        }
    }

    function swapETHToUSDC(uint256 amountInETH, uint256 minAmountOut) internal returns (uint256) {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: WETH,
            tokenOut: USDC,
            fee: 3000,
            recipient: address(this),
            deadline: block.timestamp + 15,
            amountIn: amountInETH,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0
        });

        try swapRouter.exactInputSingle(params) returns (uint256 amountOut) {
            if (amountOut < minAmountOut) {
                revert Payroll__InsufficientOutputAmount();
            }
            return amountOut;
        } catch {
            revert Payroll__SwapFailed();
        }
    }

    function burnUsdcToUsd(address from,uint256 amount) public onlyOwner {
        // This function will burn the USDC and mint the USD in the contract

        console.log("SENDERS USDC BALANCE BEFORE BURN: ", IERC20(USDC).balanceOf(from));
        MockUsdc(USDC).burn(from, amount);
        console.log("SENDERS USDC BALANCE AFTER BURN: ", IERC20(USDC).balanceOf(from));

        uint256 wethToBurn = getExpectedWETHAmount(amount);
        console.log("WETH TO BURN: ", wethToBurn);
        console.log("ROUTERS WETH BALANCE BEFORE BURN: ", IERC20(WETH).balanceOf(address(swapRouter)));
        MockWeth(WETH).burn(address(swapRouter), wethToBurn);
        console.log("ROUTERS WETH BALANCE AFTER BURN: ", IERC20(WETH).balanceOf(address(swapRouter)));

        s_usersToUsdDeposits[from] += amount;
        USD_LIQUIDITY -= amount;

        console.log("USER USD DEPOSITS AFTER BURN: ", s_usersToUsdDeposits[from]);
        console.log("USD LIQUIDITY AFTER BURN: ", USD_LIQUIDITY);
    }

    function getExpectedUSDCAmount(uint256 amountInETH) public view returns (uint256) {
        return amountInETH.getConversionRate(priceFeed);
    }

    function getExpectedWETHAmount(uint256 amountInUSD) public view returns (uint256) {
        uint256 ethPrice = PriceConverter.conversionPrice(priceFeed);
        amountInUSD = amountInUSD * USDC_DECIMAL_PRECISION;
        return (amountInUSD * ETH_DECIMALS) / ethPrice;
    }

    function getTotalFundsUSDC() public view returns (uint256) {
        return s_totalFundsUSDC;
    }

    function getActualUSDCBalance() public view returns (uint256) {
        return IERC20(USDC).balanceOf(address(this));
    }

    function getWETH() public view returns (address) {
        return WETH;
    }

    function getUSDC() public view returns (address) {
        return USDC;
    }

    function getRouter() public view returns (address) {
        return address(swapRouter);
    }

    function getUserUsdDeposits(address _address) public view returns (uint256) {
        return s_usersToUsdDeposits[_address];
    }

    receive() external payable {
        fundContract();
    }
}
