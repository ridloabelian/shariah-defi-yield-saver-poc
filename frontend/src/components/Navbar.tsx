"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Scale, Droplets, Sparkles, BookOpen } from "lucide-react";

interface NavbarProps {
  onFaucetClick: () => void;
  faucetClaimed: boolean;
  onOpenShariahModal: () => void;
}

export function Navbar({ onFaucetClick, faucetClaimed, onOpenShariahModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/20 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
                BarakahVault
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Halal DeFi PoC
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-Riba DEX Liquidity & Musyarakah Yield Vault
            </p>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex items-center gap-3">
          {/* Shariah Framework Modal Trigger */}
          <button
            onClick={onOpenShariahModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 hover:bg-emerald-900/40 transition-all font-medium"
            title="Read Shariah Compliance & Fiqh Muamalat Details"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Shariah Framework</span>
            <span className="md:hidden">Fiqh</span>
          </button>

          {/* Faucet */}
          <button
            onClick={onFaucetClick}
            disabled={faucetClaimed}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              faucetClaimed
                ? "bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/20 shadow-sm"
            }`}
            title="Claim 2,500 USDC & 1 PAXG for testing"
          >
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            <span>{faucetClaimed ? "Assets Claimed" : "Test Faucet"}</span>
          </button>

          <ConnectButton
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>
    </header>
  );
}
