import { parseAbi } from "viem";

// ShariahYieldVault Contract ABI
export const SHARIAH_YIELD_VAULT_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_shariahRegistry", type: "address", internalType: "address" },
      { name: "_swapRouter", type: "address", internalType: "address" },
      { name: "_liquidityManager", type: "address", internalType: "address" },
      { name: "_initialOwner", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "asset", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "shares", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "asset", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "recipient", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "sharesBurned", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawAll",
    inputs: [
      { name: "asset", type: "address", internalType: "address" },
      { name: "recipient", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "totalAmount", type: "uint256", internalType: "uint256" },
      { name: "sharesBurned", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapAndDeposit",
    inputs: [
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "tokenOut", type: "address", internalType: "address" },
      { name: "poolFee", type: "uint24", internalType: "uint24" },
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "shares", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "compoundTradingFees",
    inputs: [{ name: "asset", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPartnerBalance",
    inputs: [
      { name: "partner", type: "address", internalType: "address" },
      { name: "asset", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPartnerTradingYield",
    inputs: [
      { name: "partner", type: "address", internalType: "address" },
      { name: "asset", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalAssetBalance",
    inputs: [{ name: "asset", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "MusyarakahDeposited",
    inputs: [
      { name: "partner", type: "address", indexed: true },
      { name: "asset", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "musyarakahShares", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MusyarakahWithdrawn",
    inputs: [
      { name: "partner", type: "address", indexed: true },
      { name: "asset", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "sharesBurned", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ShariahSpotSwapAndDeposit",
    inputs: [
      { name: "partner", type: "address", indexed: true },
      { name: "tokenIn", type: "address", indexed: true },
      { name: "tokenOut", type: "address", indexed: true },
      { name: "amountIn", type: "uint256", indexed: false },
      { name: "amountOut", type: "uint256", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;

export const HALAL_ASSET_REGISTRY_ABI = parseAbi([
  "function isHalal(address asset) external view returns (bool)",
  "function getAssetMetadata(address asset) external view returns ((bool isHalal, string symbol, string fatwaReference, uint256 approvalTimestamp))",
]);

export const ERC20_ABI = parseAbi([
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
]);

export interface HalalTokenConfig {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  icon: string;
  isVaultAsset: boolean;
  fatwaBasis: string;
  currentApy?: number;
}

export const HALAL_TOKENS: Record<number, HalalTokenConfig[]> = {
  // Sepolia Testnet
  11155111: [
    {
      symbol: "USDC",
      name: "USD Coin (Fiat 1:1 Reserved)",
      address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      decimals: 6,
      icon: "💵",
      isVaultAsset: true,
      fatwaBasis: "AAOIFI Standard No. 57 & DSN-MUI No. 116 (Spot Currency)",
      currentApy: 11.20,
    },
    {
      symbol: "PAXG",
      name: "PAX Gold (Physical Allocated Bullion)",
      address: "0x43640245E4A71295AAbC048c1eCE2d431c00F51E",
      decimals: 18,
      icon: "🪙",
      isVaultAsset: true,
      fatwaBasis: "AAOIFI Shariah Standard No. 57 on Gold Trading",
      currentApy: 5.80,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether (Utility Gas Asset)",
      address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      decimals: 18,
      icon: "💎",
      isVaultAsset: true,
      fatwaBasis: "Manfa'ah / Permissible Utility Token for Computation",
      currentApy: 8.40,
    },
  ],
  // Localhost Anvil
  31337: [
    {
      symbol: "USDC",
      name: "USD Coin (Halal Mock)",
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      decimals: 6,
      icon: "💵",
      isVaultAsset: true,
      fatwaBasis: "AAOIFI Standard No. 57",
      currentApy: 11.20,
    },
    {
      symbol: "PAXG",
      name: "PAX Gold (Commodity Mock)",
      address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      decimals: 18,
      icon: "🪙",
      isVaultAsset: true,
      fatwaBasis: "Physical Gold Commodity Backing",
      currentApy: 5.80,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether (Mock)",
      address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      decimals: 18,
      icon: "💎",
      isVaultAsset: true,
      fatwaBasis: "Utility Asset for Network Execution",
      currentApy: 8.40,
    },
  ],
};

export const DEFAULT_SHARIAH_VAULT_ADDRESS: Record<number, `0x${string}`> = {
  11155111: "0x8aD0A10861283ff20FF32685057f5AC389C49156",
  31337: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
};
