// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MockUsdc
 * @dev A simplified mock USDC token for testing purposes with enhanced security.
 */
contract MockUsdc is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000 * (10 ** 6); // 1 trillion USDC
    uint256 public totalMinted; // Total amount of USDC minted
    uint256 public totalBurned; // Total amount of USDC burned

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {}

    /**
     * @dev Mints new tokens, respecting max supply
     * Can only be called by the contract owner when not paused.
     */
    function mint(address to, uint256 amount) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "Mint: Invalid recipient");
        require(amount > 0, "Mint: Amount must be positive");
        require(totalSupply() + amount <= MAX_SUPPLY, "Mint: Exceeds max supply");

        _mint(to, amount);
        totalMinted += amount;
        emit Minted(to, amount);
    }

    /**
     * @dev Burns tokens from an account
     * Can only be called by the contract owner when not paused.
     */
    function burn(address from, uint256 amount) external onlyOwner whenNotPaused nonReentrant {
        require(from != address(0), "Burn: Invalid sender");
        require(amount > 0, "Burn: Amount must be positive");
        require(balanceOf(from) >= amount, "Burn: Insufficient balance");

        _burn(from, amount);
        totalBurned += amount;
        emit Burned(from, amount);
    }

    /**
     * @dev Pauses all minting and burning actions. Can only be called by the contract owner.
     */
    function pause() external onlyOwner {
        _pause();
        emit Paused(_msgSender());
    }

    /**
     * @dev Unpauses minting and burning actions. Can only be called by the contract owner.
     */
    function unpause() external onlyOwner {
        _unpause();
        emit Unpaused(_msgSender());
    }

    /**
     * @dev Returns the number of decimals used in the token
     */
    function decimals() public pure override returns (uint8) {
        return 6; // USDC uses 6 decimals
    }

    /**
     * @dev Returns the remaining mintable supply
     */
    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Returns the total tokens minted and burned
     */
    function getTokenStats() public view returns (uint256 minted, uint256 burned) {
        return (totalMinted, totalBurned);
    }
}
