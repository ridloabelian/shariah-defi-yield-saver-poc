// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IShariahRegistry
 * @notice Interface for on-chain screening and validation of Shariah-compliant digital assets.
 * @dev Governed according to AAOIFI & DSN-MUI Islamic Finance Standards.
 */
interface IShariahRegistry {
    enum ScreeningStatus {
        Unreviewed,
        Halal,
        Haram
    }

    struct AssetMetadata {
        bool isHalal;
        string symbol;
        string fatwaReference;
        uint256 approvalTimestamp;
    }

    event AssetScreened(
        address indexed asset,
        string symbol,
        bool isHalal,
        string fatwaReference
    );

    function isHalal(address asset) external view returns (bool);

    function getAssetMetadata(address asset) external view returns (AssetMetadata memory);
}
