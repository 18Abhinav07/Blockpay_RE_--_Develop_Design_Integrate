require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
const { abi } = require("./constant.js"); 

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const receiverAddress = process.env.RECEIVER_ADDRESS;

const blockpayUsdcContract = new ethers.Contract(
  contractAddress,
  abi,
  wallet
);

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

async function withdrawUSDC(amount) {
  try {
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

async function processPayment(amount) {
  try {
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

async function checkEthPrice() {
  try {
    console.log("Checking ETH price...");
    const tx = await blockpayUsdcContract.checkEthPrice();
    await tx.wait();
    console.log("ETH price checked.");
  } catch (error) {
    console.error("Error checking ETH price:", error);
  }
}

async function burnUsdcToUsd(amount) {
  try {
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

// Exporting the functions to be used in test files
module.exports = {
  fundContract,
  withdrawUSDC,
  processPayment,
  checkEthPrice,
  burnUsdcToUsd,
  getTotalFundsUSDC,
  getActualUSDCBalance,
};
