// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {StableToken} from "../Blockcoin/StableToken.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {console} from "forge-std/Script.sol";
import {MockV3Aggregator} from "test/mocks/MockV3Aggregator.sol";

/**
 * @title PaymentEngine
 * @dev Handles collateral deposits, minting of BlockCoin, and interactions with collateral tokens.
 *      Includes detailed logging for testing and monitoring purposes.
 */
contract PaymentEngine is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Custom errors for better error handling
    error Engine_CollateralNotAllowed(address token);
    error Engine_InvalidAmount(uint256 amount);
    error Engine_InvalidPriceFeed();
    error Engine_TransferFailed();
    error Engine_UnauthorizedMint(address sender);

    // Constants
    uint256 private constant PRECISION = 1e18;
    uint256 private constant MIN_CONTRACT_BALANCE_RATIO = 25 * 1e16; // 25%
    uint256 private constant PLATFORM_FEE_PERCENT = 1 * 1e16; // 1%

    // State variables
    address private immutable BLOCKCOIN;
    mapping(address => bool) private s_allowedCollateral;
    mapping(address => AggregatorV3Interface) private s_priceFeeds;
    uint256 private s_totalCollateralValueUSD;
    mapping(address => uint256) private s_collateralBalances;

    // Events
    event CollateralAdded(address indexed token, address indexed priceFeed);
    event Minted(address indexed to, uint256 amount);
    event CollateralDeposited(address indexed user, address indexed token, uint256 amount);
    event CollateralWithdrawn(address indexed user, address indexed token, uint256 amount);
    event BlockCoinPurchased(address indexed user, address indexed token, uint256 tokenAmount, uint256 blockCoinAmount);
    event BlockCoinPurchasedWithFiat(address indexed user, uint256 tokenAmount, uint256 blockCoinAmount);

    /**
     * @dev Constructor to initialize the PaymentEngine contract.
     * @param _blockCoin Address of the BlockCoin token contract.
     * @param _allowedTokens Array of allowed collateral token addresses.
     * @param _priceFeeds Array of corresponding price feed addresses for the collateral tokens.
     */
    constructor(address _blockCoin, address[] memory _allowedTokens, address[] memory _priceFeeds)
        Ownable(msg.sender)
    {
        require(_blockCoin != address(0), "BlockCoin address cannot be zero");
        BLOCKCOIN = _blockCoin;
        require(_allowedTokens.length == _priceFeeds.length, "Arrays must have the same length");
        for (uint256 i = 0; i < _allowedTokens.length; i++) {
            address token = _allowedTokens[i];
            address priceFeed = _priceFeeds[i];
            require(priceFeed != address(0), "Price feed address cannot be zero");
            s_allowedCollateral[token] = true;
            s_priceFeeds[token] =
                block.chainid != 31337 ? AggregatorV3Interface(priceFeed) : MockV3Aggregator(priceFeed);
            emit CollateralAdded(token, priceFeed);
        }
    }

    /**
     * @notice Checks if BlockCoin can be sent based on the current balance and required minimum balance.
     * @param _amount Amount of BlockCoin to check.
     * @return True if BlockCoin can be sent, otherwise false.
     */
    function canSendBlockCoin(uint256 _amount) public view returns (bool) {
        uint256 totalSupply = StableToken(BLOCKCOIN).totalSupply();
        uint256 minRequiredBalance = (totalSupply * MIN_CONTRACT_BALANCE_RATIO) / PRECISION;

        console.log("[INFO] Total Supply:", totalSupply);
        console.log("[INFO] Minimum Required Balance:", minRequiredBalance);

        uint256 currentBalance = StableToken(BLOCKCOIN).balanceOf(address(this));

        console.log("[INFO] Current Balance:", currentBalance);

        if (currentBalance > _amount) {
            console.log("[INFO] Balance after deduction:", currentBalance - _amount);
            if ((currentBalance - _amount) >= minRequiredBalance) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Internal function to mint BlockCoin.
     * @param _amount Amount of BlockCoin to mint.
     */
    function mint(uint256 _amount) internal whenNotPaused {
        if (_amount <= 0) revert Engine_InvalidAmount(_amount);

        console.log("[MINT] Minting BlockCoin Amount:", _amount);

        StableToken(BLOCKCOIN).mint(address(this), _amount);
        emit Minted(msg.sender, _amount);
    }

    /**
     * @notice Deposits collateral tokens.
     * @param _token Address of the collateral token.
     * @param _amount Amount of the collateral token to deposit.
     */
    function depositCollateral(address _token, uint256 _amount) public payable whenNotPaused {
        if (!s_allowedCollateral[_token]) revert Engine_CollateralNotAllowed(_token);
        if (_amount <= 0) revert Engine_InvalidAmount(_amount);

        uint256 usdValue = _getUSDValue(_token, _amount);

        console.log("[DEPOSIT] Collateral Token:", _token);
        console.log("[DEPOSIT] Collateral Amount:", _amount);
        console.log("[DEPOSIT] USD Value:", usdValue);

        if (_token == address(0)) {
            if (msg.value != _amount) revert Engine_InvalidAmount(msg.value);
            s_collateralBalances[address(0)] += msg.value;
        } else {
            IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
            s_collateralBalances[_token] += _amount;
        }
        s_totalCollateralValueUSD += usdValue;
        emit CollateralDeposited(msg.sender, _token, _amount);
    }

    /**
     * @notice Withdraws collateral tokens.
     * @param _token Address of the collateral token.
     * @param _amount Amount of the collateral token to withdraw.
     */
    function withdrawCollateral(address _token, uint256 _amount) external onlyOwner whenNotPaused nonReentrant {
        if (!s_allowedCollateral[_token]) revert Engine_CollateralNotAllowed(_token);
        if (_amount == 0 || _amount > s_collateralBalances[_token]) revert Engine_InvalidAmount(_amount);

        uint256 usdValue = _getUSDValue(_token, _amount);

        console.log("[WITHDRAW] Collateral Token:", _token);
        console.log("[WITHDRAW] Collateral Amount:", _amount);
        console.log("[WITHDRAW] USD Value:", usdValue);

        s_collateralBalances[_token] -= _amount;
        s_totalCollateralValueUSD -= usdValue;
        if (_token == address(0)) {
            (bool success,) = payable(msg.sender).call{value: _amount}("");
            if (!success) revert Engine_TransferFailed();
        } else {
            IERC20(_token).safeTransfer(msg.sender, _amount);
        }
        emit CollateralWithdrawn(msg.sender, _token, _amount);
    }

    /**
     * @notice Purchases BlockCoin using collateral tokens.
     * @param _token Address of the collateral token.
     * @param _tokenAmount Amount of the collateral token to use.
     * @param _to Address to send the purchased BlockCoin.
     */
    function getBlockCoin(address _token, uint256 _tokenAmount, address _to)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        if (!s_allowedCollateral[_token]) revert Engine_CollateralNotAllowed(_token);
        if (_tokenAmount <= 0) revert Engine_InvalidAmount(_tokenAmount);

        uint256 usdValue = _getUSDValue(_token, _tokenAmount);
        uint256 blockCoinAmount = (usdValue * (PRECISION - PLATFORM_FEE_PERCENT)) / PRECISION;

        console.log("[PURCHASE] Collateral Token:", _token);
        console.log("[PURCHASE] Collateral Amount:", _tokenAmount);
        console.log("[PURCHASE] USD Value:", usdValue);
        console.log("[PURCHASE] BlockCoin Amount:", blockCoinAmount);

        if (!canSendBlockCoin(blockCoinAmount)) {
            uint256 totalSupply = StableToken(BLOCKCOIN).totalSupply();
            uint256 requiredMintAmount = s_totalCollateralValueUSD - totalSupply;

            console.log("[MINT] Required Mint Amount:", requiredMintAmount);

            mint(requiredMintAmount);
        }

        depositCollateral(_token, _tokenAmount);
        if (_token == address(0)) {
            require(msg.value > 0, "No ETH sent");
            s_collateralBalances[address(0)] += msg.value;
        } else {
            IERC20(_token).safeTransferFrom(msg.sender, address(this), _tokenAmount);
            s_collateralBalances[_token] += _tokenAmount;
        }
        IERC20(BLOCKCOIN).safeTransfer(_to, blockCoinAmount);
        s_totalCollateralValueUSD += usdValue;
        emit BlockCoinPurchased(msg.sender, _token, _tokenAmount, blockCoinAmount);
    }

     /**
     * @notice Purchases BlockCoin using collateral tokens.
     * @param _fiatAmount Amount of the fiat deposited to mint the token use.
     * @param _to Address to send the purchased BlockCoin.
     */
    function getBlockCoinUsingFiat(uint256 _fiatAmount, address _to)
        external
        payable
        whenNotPaused
        nonReentrant
        onlyOwner
    {
        if (_fiatAmount <= 0) revert Engine_InvalidAmount(_fiatAmount);
        uint256 blockCoinAmount = (_fiatAmount * (PRECISION - PLATFORM_FEE_PERCENT)) / PRECISION;
        mint(_fiatAmount);

        console.log("[PURCHASE] Fiat Amount: ", _fiatAmount);
        console.log("[PURCHASE] BlockCoin Amount:", blockCoinAmount);

        if (_to != address(this)) {
            IERC20(BLOCKCOIN).safeTransfer(_to, blockCoinAmount);
        }
        s_totalCollateralValueUSD += _fiatAmount;
        emit BlockCoinPurchasedWithFiat(msg.sender, _fiatAmount, blockCoinAmount);
    }


    /**
     * @notice Retrieves the USD value of a specified amount of collateral.
     * @param _token Address of the collateral token.
     * @param _amount Amount of the collateral token.
     * @return USD value of the collateral.
     */
    function _getUSDValue(address _token, uint256 _amount) internal view returns (uint256) {
        (uint80 roundId, int256 price,,, uint80 answeredInRound) = s_priceFeeds[_token].latestRoundData();
        if (price <= 0 || answeredInRound < roundId) revert Engine_InvalidPriceFeed();

        console.log("[PRICE FEED] Token:", _token);
        console.log("[PRICE FEED] Price:", uint256(price));

        return (uint256(price) * _amount * 1e10) / PRECISION;
    }

    /**
     * @notice Calculates the current collateral ratio.
     * @return Current collateral ratio.
     */
    function calculateCollateralRatio() public view returns (uint256) {
        uint256 totalSupply = StableToken(BLOCKCOIN).totalSupply();
        if (totalSupply == 0) return type(uint256).max;
        return (s_totalCollateralValueUSD) / totalSupply;
    }

    /**
     * @notice Pauses the contract.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Checks if a token is allowed as collateral.
     * @param _token Address of the token.
     * @return True if the token is allowed, otherwise false.
     */
    function isCollateralAllowed(address _token) external view returns (bool) {
        return s_allowedCollateral[_token];
    }

    /**
     * @notice Gets the price feed address for a specified token.
     * @param _token Address of the token.
     * @return Address of the price feed.
     */
    function getPriceFeed(address _token) external view returns (address) {
        return address(s_priceFeeds[_token]);
    }

    /**
     * @notice Gets the total collateral value in USD.
     * @return Total collateral value in USD.
     */
    function getTotalCollateralValueUSD() external view returns (uint256) {
        return s_totalCollateralValueUSD / PRECISION;
    }

    /**
     * @notice Gets the address of the BlockCoin token.
     * @return Address of the BlockCoin token.
     */
    function getBlockCoinAddress() external view returns (address) {
        return BLOCKCOIN;
    }

    /**
     * @notice Gets the balance of the owner in BlockCoin.
     * @return Owner's BlockCoin balance.
     */
    function getOwnerBalance() external view returns (uint256) {
        return StableToken(BLOCKCOIN).balanceOf(owner());
    }

    /**
     * @notice Gets the balance of the contract in BlockCoin.
     * @return Contract's BlockCoin balance.
     */
    function getEnginesBalance() external view returns (uint256) {
        return StableToken(BLOCKCOIN).balanceOf(address(this));
    }

    /**
     * @notice Gets the total supply of BlockCoin.
     * @return Total supply of BlockCoin.
     */
    function getTotalSupply() external view returns (uint256) {
        return StableToken(BLOCKCOIN).totalSupply();
    }

    receive() external payable {
        if (!s_allowedCollateral[address(0)]) revert Engine_CollateralNotAllowed(address(0));
    }

    fallback() external payable {
        if (!s_allowedCollateral[address(0)]) revert Engine_CollateralNotAllowed(address(0));
    }
}
