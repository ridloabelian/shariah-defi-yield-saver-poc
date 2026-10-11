// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IHalalLiquidityManager
 * @notice Interface for Shariah-compliant Automated Liquidity Provision on DEX pools (Uniswap V3).
 * @dev Generates zero-riba yield strictly from trading fees (Ujrah) paid by market participants.
 */
interface IHalalLiquidityManager {
    /**
     * @notice Supplies liquidity to the DEX pool to earn trading fees.
     * @param asset The underlying token to deploy
     * @param amount The amount of asset to supply
     * @return liquidityShares Shares representing the liquidity position
     */
    function supplyLiquidity(address asset, uint256 amount) external returns (uint256 liquidityShares);

    /**
     * @notice Removes liquidity from the DEX pool and collects accrued trading fees.
     * @param asset The underlying token to redeem
     * @param amount The amount of underlying asset to withdraw
     * @param recipient The address receiving the tokens
     * @return totalWithdrawn Amount of principal + earned trading fees
     */
    function withdrawLiquidity(
        address asset,
        uint256 amount,
        address recipient
    ) external returns (uint256 totalWithdrawn);

    /**
     * @notice Harvests accumulated trading fees from the DEX pool.
     * @param asset The asset whose accrued trading fees are to be collected
     * @return feesCollected Amount of trading fees collected
     */
    function collectTradingFees(address asset) external returns (uint256 feesCollected);

    /**
     * @notice Returns total assets (principal + accumulated trading fees) managed by the strategy.
     * @param asset The underlying token address
     */
    function getTotalManagedAssets(address asset) external view returns (uint256);
}
