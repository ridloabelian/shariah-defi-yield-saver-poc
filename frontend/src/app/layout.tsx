import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarakahVault | Shariah-Compliant DeFi Yield Vault & Halal DEX Liquidity",
  description:
    "A certified Shariah-compliant Web3 DeFi Yield Vault powered by Akad Musyarakah and genuine DEX trading fee commissions (Ujrah). 100% Zero Riba, Zero Lending.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
