"use client";

import React, { useState } from "react";
import { ShieldCheck, Cpu, Code2, Check, ChevronDown, ChevronUp, Scale } from "lucide-react";

export function ContractInspector() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-3xl bg-slate-900/40 border border-emerald-500/20 p-6 backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Smart Contract Architecture & Shariah Invariants
            </h4>
            <p className="text-xs text-slate-400">
              On-Chain Token Screening, Musyarakah Accounting & Gas Profiling
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            20/20 Foundry Tests Passing
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-6 text-xs text-slate-300">
          {/* Contracts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">ShariahYieldVault Core</span>
              <span className="font-mono text-emerald-300 break-all select-all font-semibold">
                0x8aD0A10861283ff20FF32685057f5AC389C49156
              </span>
              <span className="text-[10px] text-slate-500 block mt-2">
                Akad Musyarakah, Ujrah Fee Collection, ReentrancyGuard
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">HalalAssetRegistry</span>
              <span className="font-mono text-emerald-300 break-all select-all font-semibold">
                0x5FbDB2315678afecb367f032d93F642f64180aa3
              </span>
              <span className="text-[10px] text-slate-500 block mt-2">
                AAOIFI / DSN-MUI On-Chain Screening Whitelist
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Uniswap V3 Spot Router</span>
              <span className="font-mono text-emerald-300 break-all select-all font-semibold">
                0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E
              </span>
              <span className="text-[10px] text-slate-500 block mt-2">
                Akad Bay&apos; al-Sarf (Atomic Spot Settlement)
              </span>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Islamic Finance Safeguards</span>
              </h5>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mandatory Shariah Screening:</strong> Every deposit and swap verifies <code>registry.isHalal(token)</code> on-chain.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero-Lending Architecture:</strong> Never supplies to money-market debt pools. Eliminates liquidation and interest.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ceiling Share Burning:</strong> Mathematical ceiling division protects remaining partners from under-collateralization.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-1.5 text-xs text-amber-400">
                <Cpu className="w-4 h-4" />
                <span>Gas Optimizations</span>
              </h5>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Custom Errors:</strong> Uses custom Solidity 0.8 errors, eliminating revert string storage.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Immutable Storage:</strong> Registry, Router, and Strategy are immutable, saving 2,100 gas per access.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Solidity 0.8.24 Cancun EVM:</strong> 200 optimizer runs with transient storage readiness.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
