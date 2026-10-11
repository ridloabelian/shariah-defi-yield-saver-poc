"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { StatsCards } from "@/components/StatsCards";
import { VaultActions } from "@/components/VaultActions";
import {
  TransactionHistory,
  TransactionRecord,
} from "@/components/TransactionHistory";
import { ContractInspector } from "@/components/ContractInspector";
import { ShariahComplianceModal } from "@/components/ShariahComplianceModal";
import {
  NotificationBanner,
  NotificationState,
} from "@/components/NotificationBanner";
import confetti from "canvas-confetti";
import { Scale, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export default function Home() {
  const { isConnected, address } = useAccount();

  // Financial State
  const [usdcBalance, setUsdcBalance] = useState<number>(4500.0);
  const [paxgBalance, setPaxgBalance] = useState<number>(2.5); // 2.5 oz Gold
  const [userDepositUsdc, setUserDepositUsdc] = useState<number>(2000.0);
  const [userYieldUsdc, setUserYieldUsdc] = useState<number>(56.24); // Accrued trading fee profit
  const [tvlUsd, setTvlUsd] = useState<number>(3892150.0);
  const [faucetClaimed, setFaucetClaimed] = useState<boolean>(false);
  const [isShariahModalOpen, setIsShariahModalOpen] = useState<boolean>(false);

  // Notifications
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Transactions Feed
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: "tx-shariah-1",
      type: "deposit",
      asset: "USDC",
      amount: 2000,
      shares: 2000,
      hash: "0x3f1a8c9e5b2d7f4a1c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f1a",
      timestamp: "15 mins ago",
    },
    {
      id: "tx-shariah-2",
      type: "swap",
      asset: "USDC",
      amount: 2500,
      shares: 2500,
      tokenIn: "PAXG",
      hash: "0x7a2b4c6e8f0a2d4b6c8e0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2b",
      timestamp: "2 hours ago",
    },
  ]);

  const generateTxHash = () => {
    const chars = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleFaucet = () => {
    if (faucetClaimed) return;
    setUsdcBalance((prev) => prev + 2500);
    setPaxgBalance((prev) => prev + 1.0);
    setFaucetClaimed(true);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    setNotification({
      type: "success",
      title: "Halal Testnet Faucet Claimed!",
      message: "Credited 2,500 USDC and 1.0 PAXG (Physical Gold) to your wallet.",
    });
  };

  const handleDeposit = async (amount: number, asset: "USDC" | "PAXG") => {
    const bal = asset === "USDC" ? usdcBalance : paxgBalance;
    if (amount > bal) {
      setNotification({
        type: "error",
        title: "Insufficient Balance",
        message: `You only have ${bal.toFixed(2)} ${asset} in your wallet.`,
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 1400));
    const hash = generateTxHash();

    if (asset === "USDC") {
      setUsdcBalance((prev) => prev - amount);
      setUserDepositUsdc((prev) => prev + amount);
      setTvlUsd((prev) => prev + amount);
    } else {
      setPaxgBalance((prev) => prev - amount);
      // Value 1 PAXG ≈ 2,500 USDC
      const usdVal = amount * 2500;
      setUserDepositUsdc((prev) => prev + usdVal);
      setTvlUsd((prev) => prev + usdVal);
    }

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: "deposit",
      asset,
      amount,
      shares: amount,
      hash,
      timestamp: "Just now",
    };
    setTransactions((prev) => [newTx, ...prev]);

    setNotification({
      type: "success",
      title: "Musyarakah Deposit Confirmed!",
      message: `Supplied ${amount.toLocaleString()} ${asset} into the Halal DEX Liquidity Pool. Shares minted.`,
      hash,
    });
  };

  const handleWithdraw = async (amount: number, isAll: boolean) => {
    const totalAvail = userDepositUsdc + userYieldUsdc;
    if (amount > totalAvail) {
      setNotification({
        type: "error",
        title: "Insufficient Capital Balance",
        message: "Requested withdrawal amount exceeds your available Musyarakah shares.",
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 1400));
    const hash = generateTxHash();

    if (isAll) {
      setUsdcBalance((prev) => prev + totalAvail);
      setUserDepositUsdc(0);
      setUserYieldUsdc(0);
      setTvlUsd((prev) => prev - totalAvail);
    } else {
      setUsdcBalance((prev) => prev + amount);
      if (amount <= userDepositUsdc) {
        setUserDepositUsdc((prev) => prev - amount);
      } else {
        const yieldDiff = amount - userDepositUsdc;
        setUserDepositUsdc(0);
        setUserYieldUsdc((prev) => Math.max(0, prev - yieldDiff));
      }
      setTvlUsd((prev) => prev - amount);
    }

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: "withdraw",
      asset: "USDC",
      amount,
      hash,
      timestamp: "Just now",
    };
    setTransactions((prev) => [newTx, ...prev]);

    setNotification({
      type: "success",
      title: "Redemption Completed!",
      message: `Transferred ${amount.toLocaleString()} USDC (capital + trading fee profit) to your wallet.`,
      hash,
    });
  };

  const handleSwapAndDeposit = async (amountIn: number, tokenIn: string) => {
    if (amountIn > paxgBalance) {
      setNotification({
        type: "error",
        title: "Insufficient Gold Balance",
        message: `You only have ${paxgBalance.toFixed(4)} PAXG available.`,
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 1600));
    const hash = generateTxHash();
    // 1 PAXG = 2,500 USDC with 0.05% fee
    const amountOut = amountIn * 2500 * 0.9995;

    setPaxgBalance((prev) => prev - amountIn);
    setUserDepositUsdc((prev) => prev + amountOut);
    setTvlUsd((prev) => prev + amountOut);

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: "swap",
      asset: "USDC",
      amount: amountOut,
      tokenIn,
      hash,
      timestamp: "Just now",
    };
    setTransactions((prev) => [newTx, ...prev]);

    setNotification({
      type: "success",
      title: "Bay' al-Sarf & Deposit Confirmed!",
      message: `Spot exchanged ${amountIn} PAXG -> ${amountOut.toFixed(2)} USDC and supplied to Musyarakah pool.`,
      hash,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative selection:bg-emerald-600 selection:text-white">
      {/* Background Islamic Geometric Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-600/15 via-teal-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        onFaucetClick={handleFaucet}
        faucetClaimed={faucetClaimed}
        onOpenShariahModal={() => setIsShariahModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Scale className="w-3.5 h-3.5" />
              <span>Certified Shariah-Compliant DeFi Protocol</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Zero-Riba Yield Vault <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Powered by Akad Musyarakah & Ujrah
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Earn genuine ethical yields derived exclusively from decentralized exchange trading fees on screened halal pairs (USDC, PAXG Gold, WETH). Free from borrowing interest, debt collateralization, or speculative leverage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AAOIFI Standard No. 57 Screened</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ERC-4626 Musyarakah Shares</span>
            </div>
          </div>
        </div>

        {/* Global Protocol Stats */}
        <StatsCards
          tvlUsd={tvlUsd}
          apyPercent={11.20}
          userDepositUsd={userDepositUsdc}
          userYieldUsd={userYieldUsdc}
          isConnected={isConnected || true}
        />

        {/* Main Vault Dashboard & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <VaultActions
              isConnected={true}
              walletAddress={address}
              usdcBalance={usdcBalance}
              paxgBalance={paxgBalance}
              userDepositUsdc={userDepositUsdc}
              userYieldUsdc={userYieldUsdc}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onSwapAndDeposit={handleSwapAndDeposit}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <TransactionHistory transactions={transactions} />
          </div>
        </div>

        {/* Smart Contract Technical Deep-Dive Accordion */}
        <ContractInspector />
      </main>

      {/* Shariah Compliance Explainer Modal */}
      <ShariahComplianceModal
        isOpen={isShariahModalOpen}
        onClose={() => setIsShariahModalOpen(false)}
      />

      {/* Floating Notifications */}
      <NotificationBanner
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Footer */}
      <footer className="border-t border-emerald-500/20 bg-slate-950/80 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Shariah-DeFi-Yield-Saver-PoC</span>
            <span>•</span>
            <span>Compliant with AAOIFI & DSN-MUI Guidelines</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/ridloabelian/shariah-defi-yield-saver-poc"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
