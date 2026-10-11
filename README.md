# 🕌 BarakahVault: Shariah-Compliant DeFi Yield Vault (PoC)

[![Foundry](https://img.shields.io/badge/Foundry-1.8.5-orange.svg)](https://book.getfoundry.sh/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![Viem](https://img.shields.io/badge/Viem-2.21-purple.svg)](https://viem.sh/)
[![Shariah Compliance](https://img.shields.io/badge/Shariah_Compliant-AAOIFI_%26_DSN--MUI-emerald.svg)](https://aaoifi.com/)
[![Tests](https://img.shields.io/badge/Foundry_Tests-20%2F20_Passed-brightgreen.svg)](https://github.com/ridloabelian/shariah-defi-yield-saver-poc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**BarakahVault** is an institutional-grade, **100% Shariah-Compliant Decentralized Finance (DeFi) Yield Vault** proof-of-concept. Developed using **Foundry** (Solidity 0.8.24) and **Next.js 16 + TypeScript + Tailwind CSS + Wagmi/Viem**, it demonstrates how blockchain yield aggregation can be engineered completely free of **Riba (interest/usury)**, **Gharar (excessive uncertainty)**, and **Maysir (gambling/speculative debt)**.

---

## ⚖️ Islamic Finance (Fiqh al-Muamalat) Framework

Conventional DeFi yield protocols (such as Aave, Compound, and Maker) generate returns through **money market lending pools**. Lenders earn a yield derived from the interest paid by borrowers. Under Islamic jurisprudence (*Fiqh al-Muamalat*), any guaranteed or stipulated increase on a loan is classified as **Riba al-Qardh** (usury on debt), rendering conventional lending vaults non-compliant.

**BarakahVault completely replaces the debt-lending model with a Halal Asset-Backed Liquidity Provision Strategy:**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CONVENTIONAL VS SHARIAH                         │
├──────────────────────────┬─────────────────────────────────────────────┤
│ Conventional DeFi Vaults │ BarakahVault (Shariah-Compliant)            │
├──────────────────────────┼─────────────────────────────────────────────┤
│ ❌ Riba al-Qardh (Debt)   │ ✅ Akad Ujrah (Trading Fee Commission)       │
│ ❌ Borrowing & Lending   │ ✅ Akad Musyarakah (Capital Co-Partnership) │
│ ❌ Liquidation Cascades  │ ✅ No Debt / No Borrowers / No Liquidations │
│ ❌ Unscreened Tokens     │ ✅ HalalAssetRegistry (AAOIFI Standard 57)  │
│ ❌ Guaranteed Interest   │ ✅ Al-Ghunmu bil-Ghurmi (Profit/Loss Share) │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### 1. Akad Musyarakah (Capital Partnership)
Depositors pool halal capital (e.g., fully-backed USDC, PAXG Gold, WETH) into the vault. In return, they receive ERC-4626 Musyarakah shares representing proportional co-ownership of the pooled assets and accrued trading revenues.

### 2. Akad Ujrah (Service Fee Commission via Uniswap V3)
All yield is generated strictly from **trading transaction fees (Ujrah)** paid by voluntary market participants who swap assets through Uniswap V3 concentrated liquidity pools. Providing exchange liquidity in return for a service fee is universally recognized as permissible (*Mubah/Halal*).

### 3. Principle of Al-Ghunmu bil-Ghurmi (Risk and Return Sharing)
There is no fixed or artificially guaranteed interest rate. Yield reflects real market trading volume. Partners participate in economic upsides and share market fluctuations proportionally.

### 4. Akad Bay' al-Sarf (Atomic Spot Exchange)
The `swapAndDeposit` function enables instantaneous token exchange (e.g., PAX Gold into USDC). Executed atomically within a single block transaction (`exactInputSingle`), it satisfies the critical Shariah requirement of immediate mutual possession (*Taqabudh fi al-hal*).

### 5. On-Chain Screening (`HalalAssetRegistry.sol`)
Every asset deposited or swapped must pass on-chain screening. Interest-bearing tokens (`aTokens`, `cTokens`, `sDAI`), algorithmic debt tokens, or assets associated with illicit activities are permanently rejected.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              USER / WALLET                             │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │ Deposit USDC                             │ Spot Swap (PAXG Gold)
               ▼                                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ShariahYieldVault.sol                           │
│  - HalalAssetRegistry Check: isHalal(token) == true                    │
│  - Akad Musyarakah Share Accounting (ERC-4626)                         │
│  - ReentrancyGuard & SafeERC20 Protection                              │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               │ [Direct Musyarakah Deposit]              │ 1. Bay' al-Sarf
               │                                          ▼
               │                          ┌──────────────────────────────┐
               │                          │    Uniswap V3 Spot Router    │
               │                          │    (Atomic Spot Settlement)  │
               │                          └──────────────┬───────────────┘
               │                                         │ 2. Returns USDC
               ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Halal DEX Liquidity Strategy                        │
│  - Supplies liquidity to Uniswap V3 concentrated fee pools             │
│  - ZERO lending, ZERO debt, ZERO borrowing interest                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Generates Real Trading Fees (Ujrah)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Accrued Halal Profit (Ujrah)                      │
│  - Trading commissions are compounded back into the pool               │
│  - Partner redeems shares: burns shares -> receives capital + profit   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Smart Contracts (Foundry)
- **Framework**: Foundry (`forge`, `cast`, `anvil`)
- **Solidity Version**: `^0.8.24` (Cancun EVM)
- **Security & Standards**: OpenZeppelin Contracts v5.0.2 (`SafeERC20`, `Ownable`, `ReentrancyGuard`, `Pausable`)
- **Shariah Governance**: `HalalAssetRegistry` (On-Chain Screening & Fatwa Metadata)
- **DEX Integration**: Uniswap V3 (`ISwapRouter`)
- **Unit & Fuzz Testing**: 20 comprehensive tests with 100% pass rate

### Frontend (Next.js & Web3)
- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS (Emerald & Gold luxury palette)
- **Web3 Integration**: Wagmi v2, Viem v2, RainbowKit v2, TanStack Query v5
- **UI Components**: Shariah Framework Modal, Live Accrued Ticker, Faucet, Viem Event Stream

---

## 🔒 Security Architecture & Gas Optimizations

1. **Checks-Effects-Interactions (CEI)**: Internal state updates (`userShares`, `totalShares`, `userPrincipal`) precede any external contract interactions.
2. **Reentrancy Protection**: Protected by OpenZeppelin's `nonReentrant` on all external state-changing functions.
3. **Ceiling Division on Share Burning**:
   $$\text{sharesBurned} = \left\lceil \frac{\text{amount} \times \text{totalShares}}{\text{totalVaultAssets}} \right\rceil$$
   Protects existing partners against dilution and dust extraction.
4. **Gas-Optimized Custom Errors**: Custom errors (`TokenNotShariahCompliant`, `ZeroAmount`, `InsufficientPartnerBalance`, `SlippageExceeded`) reduce deployment bytecode and execution gas.
5. **Immutable Strategy Bindings**: Contract addresses (`shariahRegistry`, `swapRouter`, `liquidityManager`) are immutable to eliminate runtime SLOAD operations.

---

## 🧪 Comprehensive Foundry Test Suite

All 20 test cases pass with high branch coverage:

```bash
Ran 20 tests for test/ShariahYieldVault.t.sol:ShariahYieldVaultTest
[PASS] testFuzz_DepositAndWithdraw(uint256) (runs: 256, μ: 318850, ~: 318990)
[PASS] test_CompoundTradingFees() (gas: 268954)
[PASS] test_DepositMultiplePartners() (gas: 369378)
[PASS] test_EmergencyTokenRescue() (gas: 81242)
[PASS] test_InitialState() (gas: 42682)
[PASS] test_MusyarakahDeposit_Success() (gas: 251831)
[PASS] test_PartialWithdrawal() (gas: 283474)
[PASS] test_PauseBlocksDeposits() (gas: 300384)
[PASS] test_RevertIf_ConstructorZeroAddress() (gas: 10704)
[PASS] test_RevertIf_DepositNonHalalToken() (gas: 167502)
[PASS] test_RevertIf_DepositZeroAmount() (gas: 49972)
[PASS] test_RevertIf_NonOwnerConfiguresRegistry() (gas: 39046)
[PASS] test_RevertIf_RescueActiveLiquidity() (gas: 211805)
[PASS] test_RevertIf_SwapIdenticalTokens() (gas: 43158)
[PASS] test_RevertIf_SwapNonHalalToken() (gas: 170536)
[PASS] test_RevertIf_WithdrawExceedsBalance() (gas: 225569)
[PASS] test_ShariahRegistryScreening() (gas: 29481)
[PASS] test_ShariahSpotSwapAndDeposit_Success() (gas: 335867)
[PASS] test_TradingFeeAccrualAndProRataDistribution() (gas: 640920)
[PASS] test_WithdrawAll_Success() (gas: 257427)
Suite result: ok. 20 passed; 0 failed; 0 skipped
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- [Node.js](https://nodejs.org/) v18+ and `npm`

### 1. Clone Repository
```bash
git clone https://github.com/ridloabelian/shariah-defi-yield-saver-poc.git
cd shariah-defi-yield-saver-poc
```

### 2. Smart Contract Testing (Foundry)
```bash
cd contracts

# Run all unit, mock, and fuzz tests
forge test -vvv

# Gas snapshot
forge snapshot
```

### 3. Deploy Locally with Anvil
```bash
# In terminal 1: Start local node
anvil

# In terminal 2: Deploy contracts and mock infrastructure
cd contracts
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

### 4. Run Frontend (Next.js)
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```
shariah-defi-yield-saver-poc/
├── contracts/                        # Foundry Smart Contracts
│   ├── src/
│   │   ├── ShariahYieldVault.sol     # Core Musyarakah Vault contract
│   │   ├── HalalAssetRegistry.sol    # On-Chain Shariah Screening Registry
│   │   └── interfaces/
│   │       ├── IShariahRegistry.sol  # Screening interface
│   │       ├── IHalalLiquidityManager.sol # DEX Fee Strategy interface
│   │       ├── ISwapRouter.sol       # Uniswap V3 spot exchange interface
│   │       └── IShariahYieldVault.sol# Vault interface & events
│   ├── test/
│   │   ├── ShariahYieldVault.t.sol   # 20 Comprehensive Unit & Fuzz tests
│   │   └── mocks/                    # Mock ERC20, Mock LiquidityManager, Mock SwapRouter
│   ├── script/
│   │   └── Deploy.s.sol              # Foundry deployment script
│   └── foundry.toml                  # Solc 0.8.24 & Cancun optimizer settings
│
├── frontend/                         # Next.js 16 Web3 Application
│   ├── src/
│   │   ├── app/                      # Next.js App Router (page.tsx, layout.tsx)
│   │   ├── components/               # Navbar, ShariahModal, StatsCards, VaultActions
│   │   ├── config/                   # Wagmi & RainbowKit multi-chain config
│   │   └── constants/                # Contract ABIs, addresses, token definitions
│   ├── package.json
│   └── tailwind.config.ts
│
├── .gitignore                        # Standard ignore rules for Solidity & Next.js
└── README.md                         # Islamic Finance documentation
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

Developed by [Ridlo Abelian](https://github.com/ridloabelian).
