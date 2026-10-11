"use client";

import React from "react";
import { CheckCircle2, AlertCircle, ExternalLink, X } from "lucide-react";

export interface NotificationState {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  hash?: string;
}

interface NotificationBannerProps {
  notification: NotificationState | null;
  onClose: () => void;
}

export function NotificationBanner({ notification, onClose }: NotificationBannerProps) {
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {notification.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          {notification.type === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          {notification.type === "info" && (
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          )}
        </div>

        <div className="flex-1 text-xs">
          <div className="font-bold text-white text-sm">{notification.title}</div>
          <div className="text-slate-300 mt-0.5">{notification.message}</div>
          {notification.hash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${notification.hash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-2 font-mono text-[11px]"
            >
              <span>View on Block Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
