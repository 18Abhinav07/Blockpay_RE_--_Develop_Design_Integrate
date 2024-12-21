// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {ERC20Burnable, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StableToken
 * @dev ERC20-compliant token with custom error handling, minting, and burning functionality. 
 * Includes extensive logging for monitoring contract activities.
 */
contract StableToken is ERC20Burnable, Ownable {
    // === Custom Errors ===
    error StableToken__AmountMustBeMoreThanZero();
    error StableToken__BurnAmountExceedsBalance(uint256 availableBalance, uint256 burnAmount);
    error StableToken__MintToTheZeroAddress();
    error StableToken__TransferToTheZeroAddress();
    error StableToken__InsufficientBalance(uint256 balance, uint256 requestedAmount);
    error StableToken__InsufficientAllowance(uint256 allowance, uint256 amount);
    error StableToken__ApproveToZeroAddress();
    error StableToken__ApproveFromZeroAddress();

    // === Events ===
    event TokenCreation(string name, string symbol);
    event MintEvent(address indexed to, uint256 amount);
    event BurnEvent(address indexed burner, uint256 amount);
    event TransferEvent(address indexed from, address indexed to, uint256 amount);
    event ApprovalEvent(address indexed owner, address indexed spender, uint256 amount);

    /**
     * @dev Constructor initializes the token with a name and symbol.
     * Emits a `TokenCreation` event upon successful deployment.
     */
    constructor(string memory _tokenName, string memory _tokenAbbreviation)
        ERC20(_tokenName, _tokenAbbreviation)
        Ownable(msg.sender)
    {
        emit TokenCreation(_tokenName, _tokenAbbreviation);
    }

    /**
     * @notice Burns tokens from the owner's balance.
     * @param _amount The amount of tokens to burn.
     * Emits a `BurnEvent` upon successful burn.
     */
    function burn(uint256 _amount) public override onlyOwner {
        if (_amount == 0) {
            revert StableToken__AmountMustBeMoreThanZero();
        }

        uint256 balance = balanceOf(msg.sender);
        if (_amount > balance) {
            revert StableToken__BurnAmountExceedsBalance(balance, _amount);
        }

        super.burn(_amount);
        emit BurnEvent(msg.sender, _amount);
    }

    /**
     * @notice Mints tokens to a specific address.
     * @param _to The address to receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * Emits a `MintEvent` upon successful minting.
     */
    function mint(address _to, uint256 _amount) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert StableToken__MintToTheZeroAddress();
        }
        if (_amount == 0) {
            revert StableToken__AmountMustBeMoreThanZero();
        }

        _mint(_to, _amount);
        emit MintEvent(_to, _amount);
        return true;
    }

    /**
     * @notice Transfers tokens to another address.
     * @param to The recipient address.
     * @param amount The token amount to transfer.
     * Emits a `TransferEvent` upon successful transfer.
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        if (to == address(0)) {
            revert StableToken__TransferToTheZeroAddress();
        }

        uint256 balance = balanceOf(msg.sender);
        if (balance < amount) {
            revert StableToken__InsufficientBalance(balance, amount);
        }

        super.transfer(to, amount);
        emit TransferEvent(msg.sender, to, amount);
        return true;
    }

    /**
     * @notice Transfers tokens using an allowance.
     * @param from The sender address.
     * @param to The recipient address.
     * @param amount The token amount to transfer.
     * Emits a `TransferEvent` upon successful transfer.
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (to == address(0)) {
            revert StableToken__TransferToTheZeroAddress();
        }

        uint256 currentAllowance = allowance(from, msg.sender);
        if (currentAllowance < amount) {
            revert StableToken__InsufficientAllowance(currentAllowance, amount);
        }

        super.transferFrom(from, to, amount);
        emit TransferEvent(from, to, amount);
        return true;
    }

    /**
     * @notice Approves a spender to transfer tokens.
     * @param spender The address to approve.
     * @param amount The amount of tokens to approve.
     * Emits an `ApprovalEvent` upon successful approval.
     */
    function approve(address spender, uint256 amount) public override returns (bool) {
        if (spender == address(0)) {
            revert StableToken__ApproveToZeroAddress();
        }

        address owner = msg.sender;
        super._approve(owner, spender, amount);
        emit ApprovalEvent(owner, spender, amount);
        return true;
    }

    /**
     * @notice Increases the allowance for a spender.
     * @param spender The address of the spender.
     * @param addedValue The additional amount to approve.
     * Emits an `ApprovalEvent` upon successful update.
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        if (spender == address(0)) {
            revert StableToken__ApproveToZeroAddress();
        }

        uint256 currentAllowance = allowance(msg.sender, spender);
        uint256 newAllowance = currentAllowance + addedValue;

        super._approve(msg.sender, spender, newAllowance);
        emit ApprovalEvent(msg.sender, spender, newAllowance);
        return true;
    }

    /**
     * @notice Decreases the allowance for a spender.
     * @param spender The address of the spender.
     * @param subtractedValue The amount to decrease from the allowance.
     * Emits an `ApprovalEvent` upon successful update.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        if (spender == address(0)) {
            revert StableToken__ApproveToZeroAddress();
        }

        uint256 currentAllowance = allowance(msg.sender, spender);
        if (subtractedValue > currentAllowance) {
            revert StableToken__InsufficientAllowance(currentAllowance, subtractedValue);
        }

        uint256 newAllowance = currentAllowance - subtractedValue;

        super._approve(msg.sender, spender, newAllowance);
        emit ApprovalEvent(msg.sender, spender, newAllowance);
        return true;
    }
}
