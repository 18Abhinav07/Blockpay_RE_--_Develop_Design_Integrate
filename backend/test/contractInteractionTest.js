require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
const { abi } = require("../contractInteractions/constant.js");

// Load environment variables
console.log("RPC_URL:", process.env.RPC_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);
console.log("RECEIVER_ADDRESS:", process.env.RECEIVER_ADDRESS);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
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
const formatUsdcAmount = (amount) => ethers.parseUnits(amount.toString(), 6);
const formatEthAmount = (amount) => ethers.parseEther(amount.toString());

async function fundContract(amountInEth) {
  console.log(`Attempting to fund contract with ${amountInEth} ETH...`);
  try {
    const tx = await blockpayUsdcContract.fundContract({
      value: formatEthAmount(amountInEth),
    });
    console.log(`Funding contract with ${amountInEth} ETH...`);
    await provider.waitForTransaction(tx.hash); // Changed for ethers v6
    console.log("Transaction completed. Contract funded successfully.");
  } catch (error) {
    console.error("Error funding contract:", error);
  }
}

async function withdrawUSDC(amount) {
  console.log(`Attempting to withdraw ${amount} USDC to ${receiverAddress}...`);
  try {
    const formattedAmount = formatUsdcAmount(amount);
    const tx = await blockpayUsdcContract.withdrawUSDC(
      formattedAmount,
      receiverAddress
    );
    console.log(`Withdrawing ${amount} USDC...`);
    await provider.waitForTransaction(tx.hash); // Changed for ethers v6
    console.log(`${amount} USDC successfully withdrawn to ${receiverAddress}.`);
  } catch (error) {
    console.error("Error during USDC withdrawal:", error);
  }
}

async function processPayment(amount) {
  console.log(
    `Attempting to process payment of ${amount} USDC to ${receiverAddress}...`
  );
  try {
    const formattedAmount = formatUsdcAmount(amount);
    const tx = await blockpayUsdcContract.processPayment(
      receiverAddress,
      formattedAmount
    );
    console.log(`Processing payment of ${amount} USDC...`);
    await provider.waitForTransaction(tx.hash); // Changed for ethers v6
    console.log(`${amount} USDC payment processed successfully.`);
  } catch (error) {
    console.error("Error during payment processing:", error);
  }
}

async function checkEthPrice() {
  console.log("Attempting to check ETH price...");
  try {
    const tx = await blockpayUsdcContract.checkEthPrice();
    console.log("Checking ETH price...");
    await provider.waitForTransaction(tx.hash); // Changed for ethers v6
    console.log("ETH price checked successfully.");
  } catch (error) {
    console.error("Error checking ETH price:", error);
  }
}

async function burnUsdcToUsd(amount) {
  console.log(`Attempting to burn ${amount} USDC to USD...`);
  try {
    const formattedAmount = formatUsdcAmount(amount);
    const tx = await blockpayUsdcContract.burnUsdcToUsd(
      receiverAddress,
      formattedAmount
    );
    console.log(`Burning ${amount} USDC to USD...`);
    await provider.waitForTransaction(tx.hash); // Changed for ethers v6
    console.log(`${amount} USDC burned to USD successfully.`);
  } catch (error) {
    console.error("Error burning USDC to USD:", error);
  }
}

async function getTotalFundsUSDC() {
  console.log("Attempting to fetch total funds in USDC from contract...");
  try {
    const totalFundsUSDC = await blockpayUsdcContract.getTotalFundsUSDC();
    console.log(
      `Total funds in contract (USDC): ${ethers.formatUnits(
        totalFundsUSDC,
        6
      )} USDC`
    );
  } catch (error) {
    console.error("Error getting total funds in USDC:", error);
  }
}

async function getActualUSDCBalance() {
  console.log("Attempting to fetch actual USDC balance in contract...");
  try {
    const actualBalance = await blockpayUsdcContract.getActualUSDCBalance();
    console.log(
      `Actual USDC balance in contract: ${ethers.formatUnits(
        actualBalance,
        6
      )} USDC`
    );
  } catch (error) {
    console.error("Error getting USDC balance:", error);
  }
}

async function main() {
  console.log("Starting contract interaction tests...");

  await fundContract(0.01); // Example: Fund contract with 0.1 ETH
  await withdrawUSDC(50); // Example: Withdraw 50 USDC
  await processPayment(100); // Example: Process payment of 100 USDC
  await checkEthPrice(); // Example: Check ETH price
  await burnUsdcToUsd(25); // Example: Burn 25 USDC to USD
  await getTotalFundsUSDC(); // Get total USDC funds in the contract
  await getActualUSDCBalance(); // Get actual USDC balance in the contract

  console.log("Contract interaction tests completed.");
}

main().catch((error) => {
  console.error("Error in main function:", error);
});
