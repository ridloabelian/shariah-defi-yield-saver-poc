"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Landmark, Coins, ArrowUpRight, ShieldCheck } from "lucide-react";

interface StatsCardsProps {
  tvlUsd: number;
  apyPercent: number;
  userDepositUsd: number;
  userYieldUsd: number;
  isConnected: boolean;
}

export function StatsCards({
  tvlUsd,
  apyPercent,
  userDepositUsd,
  userYieldUsd,
  isConnected,
}: StatsCardsProps) {
  const [liveYield, setLiveYield] = useState(userYieldUsd);

  useEffect(() => {
    setLiveYield(userYieldUsd);
  }, [userYieldUsd]);

  useEffect(() => {
    if (userDepositUsd <= 0) return;
    // Compounding rate per second from trading fees
    const ratePerSecond = (userDepositUsd * (apyPercent / 100)) / (365 * 24 * 3600);
    const interval = setInterval(() => {
      setLiveYield((prev) => prev + ratePerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [userDepositUsd, apyPercent]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Vault TVL */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-emerald-500/20 p-5 backdrop-blur-sm hover:border-emerald-500/40 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Musyarakah Pooled TVL
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Landmark className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
          ${tvlUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Active in Halal DEX Pairs</span>
        </div>
      </div>

      {/* Zero-Riba Fee APY */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm hover:border-slate-700 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider">Trading Fee APY (Ujrah)</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-amber-400 flex items-baseline gap-1">
          <span>{apyPercent.toFixed(2)}%</span>
          <span className="text-xs text-slate-400 font-normal">net</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Zero-Riba DEX Volume</span>
        </div>
      </div>

      {/* Partner Supplied Capital */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm hover:border-slate-700 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider">Your Capital Share</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
          {isConnected ? (
            `$${userDepositUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ) : (
            <span className="text-slate-500 text-lg">Connect Wallet</span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          {userDepositUsd > 0 ? "Akad Musyarakah Active" : "No active partnership"}
        </div>
      </div>

      {/* Accrued Trading Fee Profit */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-teal-950/30 border border-emerald-500/30 p-5 backdrop-blur-sm hover:border-emerald-500/50 transition-all group shadow-lg shadow-emerald-500/5">
        <div className="flex items-center justify-between text-slate-300 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Halal Profit (Ujrah)
          </span>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Compounding</span>
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-emerald-300 font-mono">
          {isConnected ? (
            `+$${liveYield.toFixed(6)}`
          ) : (
            <span className="text-slate-500 text-lg font-sans">--</span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Pro-rata Musyarakah</span>
          <span className="text-emerald-400 font-medium">Trade Commission</span>
        </div>
      </div>
    </div>
  );
}
