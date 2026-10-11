// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IShariahRegistry} from "./interfaces/IShariahRegistry.sol";

/**
 * @title HalalAssetRegistry
 * @notice On-chain Shariah Screening and Whitelist Registry for Digital Assets.
 * @dev Governed according to AAOIFI (Accounting and Auditing Organization for Islamic Financial Institutions)
 * and DSN-MUI (National Sharia Board of Indonesian Ulema Council) guidelines.
 *
 * Screening Criteria:
 * 1. Asset must represent real economic utility, physical commodities (e.g. PAXG Gold),
 *    or fully reserved fiat-backed stablecoins without debt-collateralization interest.
 * 2. Explicit prohibition of interest-bearing tokens (e.g. aTokens, cTokens, sDAI).
 * 3. Prohibition of assets linked to gambling (maysir), high excessive uncertainty (gharar),
 *    or illicit products/services.
 */
contract HalalAssetRegistry is IShariahRegistry, Ownable {
    mapping(address => AssetMetadata) private _assets;
    address[] public registeredAssets;

    error ZeroAddress();
    error AssetAlreadyRegistered(address asset);

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
    }

    /**
     * @notice Registers or updates the Shariah compliance status of an asset.
     * @param asset Address of the ERC20 token
     * @param symbol Ticker symbol of the token
     * @param isHalalCompliant True if certified Shariah-compliant
     * @param fatwaReference Official Fatwa or Shariah audit resolution reference
     */
    function setAssetScreening(
        address asset,
        string calldata symbol,
        bool isHalalCompliant,
        string calldata fatwaReference
    ) external onlyOwner {
        if (asset == address(0)) revert ZeroAddress();

        if (_assets[asset].approvalTimestamp == 0) {
            registeredAssets.push(asset);
        }

        _assets[asset] = AssetMetadata({
            isHalal: isHalalCompliant,
            symbol: symbol,
            fatwaReference: fatwaReference,
            approvalTimestamp: block.timestamp
        });

        emit AssetScreened(asset, symbol, isHalalCompliant, fatwaReference);
    }

    /**
     * @notice Checks whether an asset is certified Shariah compliant.
     * @param asset Token address
     */
    function isHalal(address asset) external view override returns (bool) {
        return _assets[asset].isHalal;
    }

    /**
     * @notice Returns full Shariah screening metadata for an asset.
     * @param asset Token address
     */
    function getAssetMetadata(address asset) external view override returns (AssetMetadata memory) {
        return _assets[asset];
    }

    /**
     * @notice Returns the list of all registered asset addresses.
     */
    function getRegisteredAssets() external view returns (address[] memory) {
        return registeredAssets;
    }
}
