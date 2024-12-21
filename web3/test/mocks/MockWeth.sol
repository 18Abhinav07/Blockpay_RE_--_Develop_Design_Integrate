// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MockWeth is ERC20, Ownable, Pausable, ReentrancyGuard {
    // Custom errors
    error WETH__DepositFailed();
    error WETH__WithdrawalFailed();
    error WETH__InsufficientBalance();
    error WETH__InsufficientEthBalance();
    error WETH__ZeroDepositAmount();
    error WETH__ZeroWithdrawalAmount();
    error WETH__ETHTransferFailed();

    // Events
    event Deposit(address indexed sender, address indexed recipient, uint256 amount);
    event Withdrawal(address indexed sender, uint256 amount);
    event ETHTransferFailed(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    // Variables to track total ETH deposited and withdrawn
    uint256 public totalEthDeposited;
    uint256 public totalEthWithdrawn;
    uint256 public totalBurned;

    constructor() ERC20("Wrapped Ether", "WETH") Ownable(msg.sender) {}

    /**
     * @dev Pauses the deposit and withdraw functions. Only callable by the contract owner.
     */
    function pause() external onlyOwner {
        _pause();
        emit Paused(_msgSender());
    }

    /**
     * @dev Unpauses the deposit and withdraw functions. Only callable by the contract owner.
     */
    function unpause() external onlyOwner {
        _unpause();
        emit Unpaused(_msgSender());
    }

    /**
     * @dev Withdraw ETH by burning WETH. Can be paused by the owner in case of emergency.
     */
    function withdraw(uint256 amount) external whenNotPaused nonReentrant onlyOwner {
        if (amount == 0) revert WETH__ZeroWithdrawalAmount();
        if (address(this).balance < amount) revert WETH__InsufficientEthBalance();

        // The weth was minted to the Blockpay contract and we swapped that for USDC, now we dont
        // need to burn that as the contract does not have any WETH.

        // Attempt to send ETH to user
        (bool success,) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            emit ETHTransferFailed(msg.sender, amount);
            revert WETH__ETHTransferFailed();
        }

        totalEthWithdrawn += amount;
        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Deposit ETH and receive WETH in return. Can be paused by the owner in case of emergency.
     */
    function deposit() public payable whenNotPaused nonReentrant onlyOwner {
        if (msg.value == 0) revert WETH__ZeroDepositAmount();

        _mint(msg.sender, msg.value);
        totalEthDeposited += msg.value;

        emit Deposit(msg.sender, msg.sender, msg.value);
    }

    function deposit_Eth() internal {
        totalEthDeposited += msg.value;

        emit Deposit(msg.sender, msg.sender, msg.value);
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
     * @dev Check the contract's ETH balance.
     */

    function getETHBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Verify that the contract's ETH balance matches the total WETH supply.
     */
    function verifyReserves() public view returns (bool) {
        return address(this).balance >= totalSupply();
    }

    /**
     * @dev Allow the contract to receive ETH.
     */
    receive() external payable {
        deposit_Eth();
    }

    /**
     * @dev Fallback in case someone sends ETH with data.
     */
    fallback() external payable {
        deposit_Eth();
    }
}
