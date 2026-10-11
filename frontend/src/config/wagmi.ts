import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet, arbitrum, base, foundry } from "wagmi/chains";
import { http } from "viem";

export const config = getDefaultConfig({
  appName: "DeFi Yield Saver PoC",
  projectId: "3a8170812b534d0ff9d794f168fa2d7d", // Public demo WalletConnect ProjectId
  chains: [sepolia, base, arbitrum, mainnet, foundry],
  transports: {
    [sepolia.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
    [foundry.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
