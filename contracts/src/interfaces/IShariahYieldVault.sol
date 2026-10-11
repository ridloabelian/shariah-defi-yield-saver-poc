// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IShariahYieldVault
 * @notice Interface for the Shariah-Compliant Yield Vault based on Akad Musyarakah & Ujrah Fee-Sharing.
 */
interface IShariahYieldVault {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event MusyarakahDeposited(
        address indexed partner,
        address indexed asset,
        uint256 amount,
        uint256 musyarakahShares
    );

    event MusyarakahWithdrawn(
        address indexed partner,
        address indexed asset,
        address indexed recipient,
        uint256 amount,
        uint256 sharesBurned
    );

    event TradingFeesCompounded(
        address indexed asset,
        uint256 feesHarvested,
        uint256 newTotalAssets
    );

    event ShariahSpotSwapAndDeposit(
        address indexed partner,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 shares
    );

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error TokenNotShariahCompliant(address token);
    error ZeroAmount();
    error ZeroAddress();
    error InsufficientPartnerBalance(uint256 requested, uint256 available);
    error SlippageExceeded(uint256 received, uint256 expectedMin);
    error IdenticalTokens();
    error CannotRescueActiveLiquidity();

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function deposit(address asset, uint256 amount) external returns (uint256 shares);

    function withdraw(address asset, uint256 amount, address recipient) external returns (uint256 sharesBurned);

    function withdrawAll(address asset, address recipient) external returns (uint256 totalAmount, uint256 sharesBurned);

    function swapAndDeposit(
        address tokenIn,
        address tokenOut,
        uint24 poolFee,
        uint256 amountIn,
        uint256 amountOutMin
    ) external returns (uint256 amountOut, uint256 shares);

    function getPartnerBalance(address partner, address asset) external view returns (uint256);

    function getPartnerTradingYield(address partner, address asset) external view returns (uint256);

    function totalAssetBalance(address asset) external view returns (uint256);
}
