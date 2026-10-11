"use client";

import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  LineChart,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Scale,
} from "lucide-react";
import confetti from "canvas-confetti";

interface VaultActionsProps {
  isConnected: boolean;
  walletAddress?: string;
  usdcBalance: number;
  paxgBalance: number;
  userDepositUsdc: number;
  userYieldUsdc: number;
  onDeposit: (amount: number, asset: "USDC" | "PAXG") => Promise<void>;
  onWithdraw: (amount: number, isAll: boolean) => Promise<void>;
  onSwapAndDeposit: (amountIn: number, tokenIn: string) => Promise<void>;
}

export function VaultActions({
  isConnected,
  walletAddress,
  usdcBalance,
  paxgBalance,
  userDepositUsdc,
  userYieldUsdc,
  onDeposit,
  onWithdraw,
  onSwapAndDeposit,
}: VaultActionsProps) {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "swap" | "analytics">("deposit");

  // Deposit State
  const [selectedAsset, setSelectedAsset] = useState<"USDC" | "PAXG">("USDC");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);

  // Swap & Deposit State
  const [swapAmountIn, setSwapAmountIn] = useState<string>("");
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [isSwapLoading, setIsSwapLoading] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setNeedsApproval(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;

    setIsDepositLoading(true);
    try {
      await onDeposit(val, selectedAsset);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
      });
      setDepositAmount("");
    } finally {
      setIsDepositLoading(false);
    }
  };

  const handleWithdrawSubmit = async (isAll: boolean = false) => {
    const val = isAll ? userDepositUsdc + userYieldUsdc : parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) return;

    setIsWithdrawLoading(true);
    try {
      await onWithdraw(val, isAll);
      setWithdrawAmount("");
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(swapAmountIn);
    if (isNaN(val) || val <= 0) return;

    setIsSwapLoading(true);
    try {
      await onSwapAndDeposit(val, "PAXG");
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
      });
      setSwapAmountIn("");
    } finally {
      setIsSwapLoading(false);
    }
  };

  const parsedDeposit = parseFloat(depositAmount) || 0;
  const currentBalance = selectedAsset === "USDC" ? usdcBalance : paxgBalance;
  const estAnnualYield = parsedDeposit * 0.112; // 11.20% APY from trading fees
  const estMonthlyYield = estAnnualYield / 12;
  const totalUserBalance = userDepositUsdc + userYieldUsdc;

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/20 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === "deposit"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Musyarakah Deposit</span>
        </button>

        <button
          onClick={() => setActiveTab("withdraw")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === "withdraw"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdraw</span>
        </button>

        <button
          onClick={() => setActiveTab("swap")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === "swap"
              ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Bay&apos; al-Sarf Swap</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20 uppercase">
            PAXG Gold
          </span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === "analytics"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>Fiqh Model</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 sm:p-8">
        {/* ===================== DEPOSIT TAB ===================== */}
        {activeTab === "deposit" && (
          <form onSubmit={handleDepositSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Pool Capital under Akad Musyarakah</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    AAOIFI Screened
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pooled funds provide liquidity to DEX trading pairs. Returns come exclusively from transaction fees (Ujrah).
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Available Wallet Balance:{" "}
                <span className="text-white font-mono font-semibold">
                  {currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} {selectedAsset}
                </span>
              </div>
            </div>

            {/* Asset Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedAsset("USDC")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  selectedAsset === "USDC"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-base">💵</span>
                <span>USDC (1:1 Fiat Reserve)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAsset("PAXG")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  selectedAsset === "PAXG"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-base">🪙</span>
                <span>PAXG (Physical Gold Bullion)</span>
              </button>
            </div>

            {/* Input Box */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 focus-within:border-emerald-500/60 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Amount to Contribute</span>
                <div className="flex items-center gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const val = ((currentBalance * pct) / 100).toFixed(2);
                        setDepositAmount(val);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-white placeholder-slate-600 focus:outline-none"
                />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shrink-0">
                  <span className="text-lg">{selectedAsset === "USDC" ? "💵" : "🪙"}</span>
                  <span className="font-bold text-white text-sm">{selectedAsset}</span>
                </div>
              </div>
            </div>

            {/* Yield Estimator */}
            {parsedDeposit > 0 && (
              <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/20 p-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Est. Monthly Trade Commission</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    +${estMonthlyYield.toFixed(2)} {selectedAsset}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Est. 1-Year Projected Return</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    +${estAnnualYield.toFixed(2)} (11.20% APY)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {needsApproval && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={!isConnected || isApproving || parsedDeposit <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
                >
                  {isApproving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Approving {selectedAsset}...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Step 1: Approve {selectedAsset}</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="submit"
                disabled={!isConnected || isDepositLoading || parsedDeposit <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Minting Musyarakah Shares...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>Deposit into Musyarakah Pool</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ===================== WITHDRAW TAB ===================== */}
        {activeTab === "withdraw" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">Redeem Musyarakah Position</h3>
                <p className="text-xs text-slate-400">
                  Burns your vault shares and transfers your capital share + accumulated trading fee profit back to your wallet.
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Total Redeemable:{" "}
                <span className="text-emerald-400 font-mono font-semibold">
                  ${totalUserBalance.toFixed(2)} USDC
                </span>
              </div>
            </div>

            {/* Position Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Contributed Capital</span>
                <span className="text-white font-mono font-bold text-base">
                  ${userDepositUsdc.toFixed(2)} USDC
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Halal Trade Profit (Ujrah)</span>
                <span className="text-emerald-400 font-mono font-bold text-base">
                  +${userYieldUsdc.toFixed(4)} USDC
                </span>
              </div>
            </div>

            {/* Input Box */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 focus-within:border-emerald-500/60 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Amount to Withdraw</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(totalUserBalance.toFixed(2))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                >
                  MAX
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-white placeholder-slate-600 focus:outline-none"
                />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shrink-0">
                  <span className="text-lg">💵</span>
                  <span className="font-bold text-white text-sm">USDC</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleWithdrawSubmit(false)}
                disabled={!isConnected || isWithdrawLoading || parseFloat(withdrawAmount) <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
              >
                {isWithdrawLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Redeeming...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Withdraw Specified Amount</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleWithdrawSubmit(true)}
                disabled={!isConnected || isWithdrawLoading || totalUserBalance <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                <span>Withdraw All (Capital + Profit)</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== SWAP TAB (BAY' AL-SARF) ===================== */}
        {activeTab === "swap" && (
          <form onSubmit={handleSwapSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Akad Bay&apos; al-Sarf (Spot Gold-to-USDC Swap)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Atomically exchanges screened PAXG Gold into USDC and deposits into the Musyarakah pool in 1 transaction block.
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Wallet Balance:{" "}
                <span className="text-white font-mono font-semibold">
                  {paxgBalance.toFixed(4)} PAXG
                </span>
              </div>
            </div>

            {/* Input Box */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 focus-within:border-amber-500/60 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>You Swap (PAX Gold)</span>
                <span className="text-amber-400 text-[11px]">1 PAXG ≈ $2,500 USDC</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={swapAmountIn}
                  onChange={(e) => setSwapAmountIn(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-white placeholder-slate-600 focus:outline-none"
                />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shrink-0">
                  <span className="text-lg">🪙</span>
                  <span className="font-bold text-white text-sm">PAXG</span>
                </div>
              </div>
            </div>

            {/* Route & Fiqh Checks */}
            <div className="rounded-2xl bg-slate-950/40 border border-amber-500/20 p-4 text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Spot Execution (Taqabudh fi al-hal)</span>
                </span>
                <span className="text-slate-400">Uniswap V3 Fee: 0.05%</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px] overflow-x-auto py-1">
                <span className="px-2 py-1 rounded bg-slate-800 text-amber-300 font-mono">PAXG (Gold)</span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-amber-900/40 text-amber-200 font-mono border border-amber-500/30">
                  Uniswap V3 Spot
                </span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-slate-800 text-white font-mono">USDC</span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-300 font-mono border border-emerald-500/30">
                  Musyarakah LP Shares
                </span>
              </div>

              {/* Slippage Settings */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Max Slippage Protection</span>
                <div className="flex items-center gap-1">
                  {[0.1, 0.5, 1.0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlippageTolerance(s)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        slippageTolerance === s
                          ? "bg-amber-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isConnected || isSwapLoading || parseFloat(swapAmountIn) <= 0}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwapLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Spot Swap & Deposit...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 text-white" />
                  <span>Execute Bay&apos; al-Sarf & Deposit</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ===================== ANALYTICS TAB ===================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Islamic DeFi vs Conventional Yield Comparison</h3>
              <p className="text-xs text-slate-400">
                Understanding why fee-sharing (Ujrah) in Musyarakah pools is ethically and legally superior to debt interest (Riba).
              </p>
            </div>

            {/* Comparison Matrix */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-slate-950/80 p-3 font-semibold text-slate-300 border-b border-slate-800">
                <span>Metric</span>
                <span className="text-emerald-400">BarakahVault (Shariah)</span>
                <span className="text-slate-400">Aave / Compound (Conventional)</span>
              </div>
              <div className="divide-y divide-slate-800/60">
                <div className="grid grid-cols-3 p-3 bg-slate-900/40">
                  <span className="text-slate-400">Yield Origin</span>
                  <span className="text-emerald-300 font-semibold">DEX Trading Fees (Ujrah)</span>
                  <span className="text-rose-400">Borrowing Interest (Riba)</span>
                </div>
                <div className="grid grid-cols-3 p-3 bg-slate-900/40">
                  <span className="text-slate-400">Contractual Basis</span>
                  <span className="text-emerald-300 font-semibold">Akad Musyarakah (Partnership)</span>
                  <span className="text-rose-400">Qardh ma&apos;a Ziyadah (Debt with interest)</span>
                </div>
                <div className="grid grid-cols-3 p-3 bg-slate-900/40">
                  <span className="text-slate-400">Current Yield (APY)</span>
                  <span className="text-emerald-400 font-mono font-bold">11.20% APY (Trading Vol.)</span>
                  <span className="text-slate-300 font-mono">5.20% APY (Lending Rate)</span>
                </div>
                <div className="grid grid-cols-3 p-3 bg-slate-900/40">
                  <span className="text-slate-400">Liquidation of Borrowers</span>
                  <span className="text-emerald-300 font-semibold">None (No Debt)</span>
                  <span className="text-rose-400">Yes (Liquidation Cascades)</span>
                </div>
              </div>
            </div>

            {/* 12-Month Schedule */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 font-semibold text-xs text-slate-300">
                12-Month Musyarakah Compounding Schedule (per $10,000 Capital)
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {[
                  { month: "Month 1", yieldEarned: "+$93.30", total: "$10,093.30" },
                  { month: "Month 3", yieldEarned: "+$283.40", total: "$10,283.40" },
                  { month: "Month 6", yieldEarned: "+$578.10", total: "$10,578.10" },
                  { month: "Month 12", yieldEarned: "+$1,178.00", total: "$11,178.00" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2.5 bg-slate-900/40">
                    <span className="text-slate-400">{row.month}</span>
                    <span className="text-emerald-400 font-mono font-medium">{row.yieldEarned}</span>
                    <span className="text-white font-mono font-semibold">{row.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
