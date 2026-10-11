"use client";

import React from "react";
import { X, ShieldCheck, CheckCircle2, BookOpen, AlertOctagon, Scale } from "lucide-react";

interface ShariahComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShariahComplianceModal({ isOpen, onClose }: ShariahComplianceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Shariah Compliance Framework</h3>
              <p className="text-xs text-emerald-400 font-medium">
                Fiqh al-Muamalat & AAOIFI Standard No. 57 Alignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6 text-xs text-slate-300">
          {/* Key Principle Summary */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <div className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Zero-Riba Guarantee</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Unlike conventional DeFi lending protocols (Aave, Compound) where yields are generated from charging interest on borrower loans (which constitutes <em>Riba al-Qardh</em>), <strong>ShariahYieldVault generates 100% of its returns from decentralized exchange (DEX) trading fees (Ujrah)</strong> paid by voluntary traders for liquidity swap services.
            </p>
          </div>

          {/* Akad Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm">Four Pillars of the Islamic DeFi Vault:</h4>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400">1. Akad Musyarakah (Capital Partnership)</div>
              <p className="text-slate-400">
                Depositors pool capital into the vault as partners. The vault issues shares representing proportional co-ownership of assets and accumulated trading profits.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400">2. Akad Ujrah (Service Fee Commission)</div>
              <p className="text-slate-400">
                Returns are derived purely from exchange transaction fees paid by traders swapping tokens on Uniswap V3 concentrated liquidity pools. Providing exchange infrastructure in return for a commission is universally recognized as permissible (<em>Mubah</em>).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400">3. Principle of Al-Ghunmu bil-Ghurmi (Risk and Return Sharing)</div>
              <p className="text-slate-400">
                There is no fixed or guaranteed interest rate. Returns fluctuate with genuine market trading volume, and partners share potential impermanent price volatility proportionally.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400">4. Akad Bay&apos; al-Sarf (Atomic Spot Exchange)</div>
              <p className="text-slate-400">
                The <code>swapAndDeposit</code> function performs spot token conversion in the same transaction block, satisfying the <em>Taqabudh fi al-hal</em> (immediate delivery) requirement without deferred debt.
              </p>
            </div>
          </div>

          {/* On-Chain Screening */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-amber-300">
              <AlertOctagon className="w-4 h-4" />
              <span>Halal Asset Whitelist Registry</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Every token must be certified by the on-chain <code>HalalAssetRegistry</code>. Interest-bearing tokens (aTokens, cTokens), algorithmic debt stablecoins with stability fee interest, and unbacked speculative assets are rejected at the smart contract level.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
