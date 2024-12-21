require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
const { abi } = require("./constant.js");

const contractAddress = process.env.CONTRACT_ADDRESS;

let signer;
let contract;
let owner;
let signer_address;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected";
      const accounts = await ethereum.request({ method: "eth_accounts" });
      await updateWalletBalance(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  } else {
    
  }
}

async function updateWalletBalance(address) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
}

async function initialize() {
  connect();
  updateWalletBalance();
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    owner = await contract.owner();
    signer_address = await signer.getAddress();
  }
}

// Helper function to format amounts for USDC (6 decimals) and ETH (18 decimals)
const formatUsdcAmount = (amount) =>
  ethers.utils.parseUnits(amount.toString(), 6);
const formatEthAmount = (amount) => ethers.utils.parseEther(amount.toString());

async function fundContract(amountInEth) {
  try {
    console.log(`Funding contract with ${amountInEth} ETH...`);
    const tx = await blockpayUsdcContract.fundContract({
      value: formatEthAmount(amountInEth),
    });
    await tx.wait();
    console.log("Contract funded successfully.");
  } catch (error) {
    console.error("Error funding contract:", error);
  }
}

async function withdrawUSDC(receiverAddress,amount) {
  try {
    if (owner !== signer_address) {
      console.error("Only the contract owner can withdraw USDC.");
      return;
    }
    const formattedAmount = formatUsdcAmount(amount);
    console.log(`Withdrawing ${amount} USDC to ${receiverAddress}...`);
    const tx = await blockpayUsdcContract.withdrawUSDC(
      formattedAmount,
      receiverAddress
    );
    await tx.wait();
    console.log(`Withdrawal of ${amount} USDC successful.`);
  } catch (error) {
    console.error("Error during USDC withdrawal:", error);
  }
}

async function processPayment(receiverAddress,amount) {
  try {
      if (owner !== signer_address) {
        console.error("Only the contract owner can process payment.");
        return;
      }
    const formattedAmount = formatUsdcAmount(amount);
    console.log(
      `Processing payment of ${amount} USDC to ${receiverAddress}...`
    );
    const tx = await blockpayUsdcContract.processPayment(
      receiverAddress,
      formattedAmount
    );
    await tx.wait();
    console.log(`Payment of ${amount} USDC processed successfully.`);
  } catch (error) {
    console.error("Error during payment processing:", error);
  }
}

async function burnUsdcToUsd(receiverAddress,amount) {
  try {
      if (owner !== signer_address) {
        console.error("Only the contract owner can start burn USDC to USD.");
        return;
      }
    const formattedAmount = formatUsdcAmount(amount);
    console.log(`Burning ${amount} USDC for USD...`);
    const tx = await blockpayUsdcContract.burnUsdcToUsd(
      receiverAddress,
      formattedAmount
    );
    await tx.wait();
    console.log(`Burned ${amount} USDC to USD successfully.`);
  } catch (error) {
    console.error("Error burning USDC to USD:", error);
  }
}

async function getTotalFundsUSDC() {
  try {
    const totalFundsUSDC = await blockpayUsdcContract.getTotalFundsUSDC();
    console.log(
      `Total funds in contract (USDC): ${ethers.utils.formatUnits(
        totalFundsUSDC,
        6
      )} USDC`
    );
  } catch (error) {
    console.error("Error getting total funds in USDC:", error);
  }
}

async function getActualUSDCBalance() {
  try {
    const actualBalance = await blockpayUsdcContract.getActualUSDCBalance();
    console.log(
      `Actual USDC balance: ${ethers.utils.formatUnits(actualBalance, 6)} USDC`
    );
  } catch (error) {
    console.error("Error getting USDC balance:", error);
  }
}

async function getExpectedUSDCAmount(amountInEth) {
  try {
    const actualBalance = await blockpayUsdcContract.getExpectedUSDCAmount(amountInEth);
    console.log(
      `Expected USDC amount: ${ethers.utils.formatUnits(actualBalance, 6)} USDC`
    );
  } catch (error) {
    console.error("Error getting USDC balance:", error);
  }
}

// Exporting the functions to be used in test files
module.exports = {
  initialize,
  fundContract,
  withdrawUSDC,
  processPayment,
  burnUsdcToUsd,
  getTotalFundsUSDC,
  getActualUSDCBalance,
  getExpectedUSDCAmount,
};
