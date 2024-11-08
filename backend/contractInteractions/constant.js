const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_priceFeed",
        type: "address",
      },
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_weth",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_usdc",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    type: "error",
    name: "OwnableInvalidOwner",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    type: "error",
    name: "OwnableUnauthorizedAccount",
  },
  {
    inputs: [],
    type: "error",
    name: "Payroll__ContractHasNoFunds",
  },
  {
    inputs: [],
    type: "error",
    name: "Payroll__InsufficientOutputAmount",
  },
  {
    inputs: [],
    type: "error",
    name: "Payroll__NotEnoughAmountFunded",
  },
  {
    inputs: [],
    type: "error",
    name: "Payroll__NotTheOwnerOfTheContract",
  },
  {
    inputs: [],
    type: "error",
    name: "Payroll__PaymentTransferFailed",
  },
  {
    inputs: [],
    type: "error",
    name: "Payroll__SwapFailed",
  },
  {
    inputs: [],
    type: "error",
    name: "Payroll__WithdrawFailed",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
        indexed: true,
      },
    ],
    type: "event",
    name: "ContractDeployed",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_funder",
        type: "address",
        indexed: true,
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
        indexed: false,
      },
    ],
    type: "event",
    name: "ContractFunded",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "lastPrice",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "currentPrice",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "bool",
        name: "thresholdMet",
        type: "bool",
        indexed: false,
      },
    ],
    type: "event",
    name: "EthPriceChecked",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
        indexed: false,
      },
    ],
    type: "event",
    name: "EthSoldForUSD",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "previousOwner",
        type: "address",
        indexed: true,
      },
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
        indexed: true,
      },
    ],
    type: "event",
    name: "OwnershipTransferred",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
        indexed: true,
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
        indexed: false,
      },
    ],
    type: "event",
    name: "PaymentProcessed",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
        indexed: false,
      },
    ],
    type: "event",
    name: "SwapCompleted",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "burnUsdcToUsd",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    name: "checkEthPrice",
  },
  {
    inputs: [],
    stateMutability: "payable",
    type: "function",
    name: "fundContract",
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "getActualUSDCBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountInETH",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "getExpectedUSDCAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountInUSD",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "getExpectedWETHAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "getRouter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "getTotalFundsUSDC",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "getUSDC",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "getUserUsdDeposits",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "getWETH",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "priceFeed",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amountUSDC",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "processPayment",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    name: "renounceOwnership",
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "swapRouter",
    outputs: [
      {
        internalType: "contract ISwapRouter",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "transferOwnership",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "withdrawUSDC",
  },
  {
    inputs: [],
    stateMutability: "payable",
    type: "receive",
  },
];

module.exports = { abi };