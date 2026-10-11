// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {IShariahYieldVault} from "./interfaces/IShariahYieldVault.sol";
import {IShariahRegistry} from "./interfaces/IShariahRegistry.sol";
import {IHalalLiquidityManager} from "./interfaces/IHalalLiquidityManager.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";

/**
 * @title ShariahYieldVault
 * @notice Production-grade Shariah-Compliant Yield Vault & Liquidity Aggregator.
 * @dev Governed strictly by Islamic Finance Principles (Fiqh al-Muamalat):
 *
 * 1. Zero Riba (No Interest / No Lending):
 *    All returns are generated exclusively from genuine trading fees (Ujrah) paid by DEX
 *    market participants on halal asset pools. No lending, borrowing, or interest-bearing debt.
 *
 * 2. Akad Musyarakah / Mudharabah (Partnership):
 *    Depositors act as capital partners pooling funds to share profits and risks
 *    (Al-Ghunmu bil-Ghurmi). Vault shares represent proportional ownership of pooled assets.
 *
 * 3. Akad Bay' al-Sarf (Halal Spot Exchange):
 *    Token conversions settle atomically in the same transaction block (Taqabudh fi al-hal).
 *
 * 4. Shariah Token Screening:
 *    Strict gatekeeping via HalalAssetRegistry prevents any non-compliant or interest-bearing
 *    assets (e.g., aTokens, cTokens, sDAI) from entering the vault.
 */
contract ShariahYieldVault is IShariahYieldVault, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                            IMMUTABLES & CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Shariah Screening Registry
    IShariahRegistry public immutable shariahRegistry;

    /// @notice DEX Spot Swap Router (Uniswap V3)
    ISwapRouter public immutable swapRouter;

    /// @notice Halal Liquidity Strategy Manager (Fee Harvest & Compounding)
    IHalalLiquidityManager public immutable liquidityManager;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Whitelisted vault assets
    mapping(address => bool) public supportedVaultAssets;

    /// @notice List of all registered vault assets
    address[] public vaultAssetsList;

    /// @notice Total Musyarakah shares per underlying asset
    mapping(address => uint256) public totalShares;

    /// @notice Partner shares: asset => partner => shares
    mapping(address => mapping(address => uint256)) public userShares;

    /// @notice Partner deposited capital (cost basis): asset => partner => amount
    mapping(address => mapping(address => uint256)) public userPrincipal;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _shariahRegistry,
        address _swapRouter,
        address _liquidityManager,
        address _initialOwner
    ) Ownable(_initialOwner) {
        if (
            _shariahRegistry == address(0) ||
            _swapRouter == address(0) ||
            _liquidityManager == address(0) ||
            _initialOwner == address(0)
        ) {
            revert ZeroAddress();
        }

        shariahRegistry = IShariahRegistry(_shariahRegistry);
        swapRouter = ISwapRouter(_swapRouter);
        liquidityManager = IHalalLiquidityManager(_liquidityManager);
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL WRITE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deposits a Shariah-compliant asset into the Musyarakah liquidity pool.
     * @param asset The address of the halal token (e.g. USDC, PAXG Gold, WETH)
     * @param amount The amount to contribute to the partnership
     * @return shares The amount of Musyarakah vault shares minted to the partner
     */
    function deposit(
        address asset,
        uint256 amount
    ) external nonReentrant whenNotPaused returns (uint256 shares) {
        shares = _depositFor(msg.sender, asset, amount);
    }

    /**
     * @notice Withdraws underlying asset and earned trading fee profits by burning vault shares.
     * @param asset The address of the underlying asset
     * @param amount The amount of underlying asset requested
     * @param recipient The address receiving the withdrawn funds
     * @return sharesBurned The amount of vault shares burned
     */
    function withdraw(
        address asset,
        uint256 amount,
        address recipient
    ) external nonReentrant whenNotPaused returns (uint256 sharesBurned) {
        if (!supportedVaultAssets[asset]) revert TokenNotShariahCompliant(asset);
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert ZeroAddress();

        uint256 partnerBal = getPartnerBalance(msg.sender, asset);
        if (amount > partnerBal) revert InsufficientPartnerBalance(amount, partnerBal);

        uint256 currentTotal = _totalAssetBalance(asset);
        uint256 _totalShares = totalShares[asset];

        // Ceiling division on share redemption to protect remaining partners from dilution
        sharesBurned = (amount * _totalShares + currentTotal - 1) / currentTotal;
        if (sharesBurned > userShares[asset][msg.sender]) {
            sharesBurned = userShares[asset][msg.sender];
        }

        // Checks-Effects
        userShares[asset][msg.sender] -= sharesBurned;
        totalShares[asset] -= sharesBurned;

        uint256 principal = userPrincipal[asset][msg.sender];
        if (amount >= principal) {
            userPrincipal[asset][msg.sender] = 0;
        } else {
            userPrincipal[asset][msg.sender] = principal - amount;
        }

        // Interaction with Halal Liquidity Strategy
        liquidityManager.withdrawLiquidity(asset, amount, recipient);

        emit MusyarakahWithdrawn(msg.sender, asset, recipient, amount, sharesBurned);
    }

    /**
     * @notice Redeems 100% of a partner's position (principal + accumulated trading fee yield).
     * @param asset The address of the underlying asset
     * @param recipient The address receiving the proceeds
     * @return totalAmount Total amount redeemed
     * @return sharesBurned Total shares burned
     */
    function withdrawAll(
        address asset,
        address recipient
    ) external nonReentrant whenNotPaused returns (uint256 totalAmount, uint256 sharesBurned) {
        if (!supportedVaultAssets[asset]) revert TokenNotShariahCompliant(asset);
        if (recipient == address(0)) revert ZeroAddress();

        sharesBurned = userShares[asset][msg.sender];
        if (sharesBurned == 0) revert ZeroAmount();

        uint256 currentTotal = _totalAssetBalance(asset);
        uint256 _totalShares = totalShares[asset];

        totalAmount = (sharesBurned * currentTotal) / _totalShares;
        if (totalAmount == 0) revert ZeroAmount();

        // Checks-Effects
        delete userShares[asset][msg.sender];
        totalShares[asset] -= sharesBurned;
        delete userPrincipal[asset][msg.sender];

        // Interaction
        liquidityManager.withdrawLiquidity(asset, totalAmount, recipient);

        emit MusyarakahWithdrawn(msg.sender, asset, recipient, totalAmount, sharesBurned);
    }

    /**
     * @notice Halal Spot Swap (Bay' al-Sarf) + Deposit into the Musyarakah pool in 1 atomic tx.
     * @param tokenIn Screened halal token to swap from
     * @param tokenOut Target halal asset of the vault
     * @param poolFee Uniswap V3 fee tier (e.g. 500 = 0.05%)
     * @param amountIn Amount of tokenIn to swap
     * @param amountOutMin Minimum acceptable output (slippage protection)
     * @return amountOut The actual amount of tokenOut received and invested
     * @return shares The amount of Musyarakah shares minted
     */
    function swapAndDeposit(
        address tokenIn,
        address tokenOut,
        uint24 poolFee,
        uint256 amountIn,
        uint256 amountOutMin
    ) external nonReentrant whenNotPaused returns (uint256 amountOut, uint256 shares) {
        if (tokenIn == tokenOut) revert IdenticalTokens();
        if (amountIn == 0) revert ZeroAmount();

        // Shariah Screen TokenIn & TokenOut
        if (!shariahRegistry.isHalal(tokenIn)) revert TokenNotShariahCompliant(tokenIn);
        if (!shariahRegistry.isHalal(tokenOut)) revert TokenNotShariahCompliant(tokenOut);
        if (!supportedVaultAssets[tokenOut]) revert TokenNotShariahCompliant(tokenOut);

        // Pull tokenIn
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Approve Uniswap Router for spot swap
        IERC20(tokenIn).forceApprove(address(swapRouter), amountIn);

        // Execute Bay' al-Sarf (Atomic Spot Swap)
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: poolFee,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
        });

        amountOut = swapRouter.exactInputSingle(params);
        if (amountOut < amountOutMin) revert SlippageExceeded(amountOut, amountOutMin);

        // Deploy swapped tokenOut into Halal Liquidity Strategy
        shares = _supplyAndMintShares(msg.sender, tokenOut, amountOut);

        emit ShariahSpotSwapAndDeposit(msg.sender, tokenIn, tokenOut, amountIn, amountOut, shares);
    }

    /**
     * @notice Collects accrued DEX trading fees (Ujrah) and compounds them into the vault.
     * @param asset The underlying token to harvest fees for
     */
    function compoundTradingFees(address asset) external nonReentrant whenNotPaused {
        if (!supportedVaultAssets[asset]) revert TokenNotShariahCompliant(asset);

        uint256 feesCollected = liquidityManager.collectTradingFees(asset);
        uint256 newTotal = _totalAssetBalance(asset);

        emit TradingFeesCompounded(asset, feesCollected, newTotal);
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL LOGIC
    //////////////////////////////////////////////////////////////*/

    function _depositFor(
        address partner,
        address asset,
        uint256 amount
    ) internal returns (uint256 shares) {
        if (!shariahRegistry.isHalal(asset)) revert TokenNotShariahCompliant(asset);
        if (!supportedVaultAssets[asset]) revert TokenNotShariahCompliant(asset);
        if (amount == 0) revert ZeroAmount();

        // Pull token from partner
        IERC20(asset).safeTransferFrom(partner, address(this), amount);

        shares = _supplyAndMintShares(partner, asset, amount);

        emit MusyarakahDeposited(partner, asset, amount, shares);
    }

    function _supplyAndMintShares(
        address partner,
        address asset,
        uint256 amount
    ) internal returns (uint256 shares) {
        uint256 currentTotal = _totalAssetBalance(asset);
        uint256 _totalShares = totalShares[asset];

        // Share calculation
        if (_totalShares == 0 || currentTotal == 0) {
            shares = amount;
        } else {
            shares = (amount * _totalShares) / currentTotal;
        }

        // Transfer into halal liquidity manager
        IERC20(asset).forceApprove(address(liquidityManager), amount);
        liquidityManager.supplyLiquidity(asset, amount);

        // Update partnership records
        totalShares[asset] = _totalShares + shares;
        userShares[asset][partner] += shares;
        userPrincipal[asset][partner] += amount;
    }

    function _totalAssetBalance(address asset) internal view returns (uint256) {
        return liquidityManager.getTotalManagedAssets(asset);
    }

    /*//////////////////////////////////////////////////////////////
                           VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Total underlying balance (principal + earned trading fee share) of a partner.
     */
    function getPartnerBalance(address partner, address asset) public view returns (uint256) {
        uint256 shares = userShares[asset][partner];
        if (shares == 0) return 0;

        uint256 _totalShares = totalShares[asset];
        if (_totalShares == 0) return 0;

        uint256 currentTotal = _totalAssetBalance(asset);
        return (shares * currentTotal) / _totalShares;
    }

    /**
     * @notice Returns pure trading fee profit (Ujrah) accumulated by a partner.
     */
    function getPartnerTradingYield(address partner, address asset) external view returns (uint256) {
        uint256 totalBal = getPartnerBalance(partner, asset);
        uint256 principal = userPrincipal[asset][partner];

        if (totalBal > principal) {
            return totalBal - principal;
        }
        return 0;
    }

    /**
     * @notice Total assets managed across the vault for a given asset.
     */
    function totalAssetBalance(address asset) external view returns (uint256) {
        return _totalAssetBalance(asset);
    }

    /**
     * @notice Returns list of supported vault asset addresses.
     */
    function getVaultAssetsList() external view returns (address[] memory) {
        return vaultAssetsList;
    }

    /*//////////////////////////////////////////////////////////////
                           ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Configures support for a halal asset in the vault.
     */
    function setVaultAssetConfiguration(address asset, bool isSupported) external onlyOwner {
        if (asset == address(0)) revert ZeroAddress();

        // Must pass Shariah registry screening before being accepted
        if (isSupported && !shariahRegistry.isHalal(asset)) {
            revert TokenNotShariahCompliant(asset);
        }

        if (!supportedVaultAssets[asset] && isSupported) {
            vaultAssetsList.push(asset);
        }

        supportedVaultAssets[asset] = isSupported;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Rescues accidentally sent tokens. Cannot withdraw active liquidity backing user shares.
     */
    function emergencyTokenRescue(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        if (token == address(0) || recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        // Cannot rescue active vault assets while shares exist
        if (supportedVaultAssets[token] && totalShares[token] > 0) {
            revert CannotRescueActiveLiquidity();
        }

        IERC20(token).safeTransfer(recipient, amount);
    }
}
