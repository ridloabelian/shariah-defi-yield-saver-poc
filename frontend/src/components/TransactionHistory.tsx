"use client";

import React from "react";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ExternalLink, Scale } from "lucide-react";

export interface TransactionRecord {
  id: string;
  type: "deposit" | "withdraw" | "swap" | "compound";
  asset: string;
  amount: number;
  hash: string;
  timestamp: string;
  shares?: number;
  tokenIn?: string;
}

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="rounded-3xl bg-slate-900/60 border border-emerald-500/20 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>On-Chain Halal Activity Feed</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time Musyarakah & Spot Swap events parsed with Viem
          </p>
        </div>
        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active</span>
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          No transactions detected yet. Deposit into the Musyarakah pool to see activity here!
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "deposit"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : tx.type === "withdraw"
                      ? "bg-teal-500/10 text-teal-400"
                      : tx.type === "swap"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {tx.type === "deposit" && <ArrowDownLeft className="w-4 h-4" />}
                  {tx.type === "withdraw" && <ArrowUpRight className="w-4 h-4" />}
                  {tx.type === "swap" && <RefreshCw className="w-4 h-4" />}
                  {tx.type === "compound" && <Scale className="w-4 h-4" />}
                </div>

                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>
                      {tx.type === "deposit" && "Musyarakah Capital Contributed"}
                      {tx.type === "withdraw" && "Musyarakah Capital Redeemed"}
                      {tx.type === "swap" && `Bay' al-Sarf: Swapped ${tx.tokenIn}`}
                      {tx.type === "compound" && "Trading Fees Compounded"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{tx.timestamp}</span>
                    <span>•</span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                    >
                      <span>{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-mono font-bold text-sm ${
                    tx.type === "deposit" || tx.type === "swap"
                      ? "text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  {tx.type === "deposit" ? "+" : tx.type === "withdraw" ? "-" : "+"}
                  {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {tx.asset}
                </div>
                {tx.shares && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    {tx.shares.toFixed(2)} shares
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
