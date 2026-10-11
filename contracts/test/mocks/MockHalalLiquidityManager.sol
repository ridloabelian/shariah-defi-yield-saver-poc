// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IHalalLiquidityManager} from "../../src/interfaces/IHalalLiquidityManager.sol";

contract MockHalalLiquidityManager is IHalalLiquidityManager {
    using SafeERC20 for IERC20;

    mapping(address => uint256) public totalSupplied;
    mapping(address => uint256) public uncollectedFees;

    function supplyLiquidity(address asset, uint256 amount) external override returns (uint256) {
        require(amount > 0, "amount must be > 0");
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        totalSupplied[asset] += amount;
        return amount;
    }

    function withdrawLiquidity(
        address asset,
        uint256 amount,
        address recipient
    ) external override returns (uint256) {
        require(amount > 0, "amount must be > 0");
        require(amount <= getTotalManagedAssets(asset), "exceeds managed assets");

        if (amount <= totalSupplied[asset]) {
            totalSupplied[asset] -= amount;
        } else {
            uint256 diff = amount - totalSupplied[asset];
            totalSupplied[asset] = 0;
            if (diff <= uncollectedFees[asset]) {
                uncollectedFees[asset] -= diff;
            } else {
                uncollectedFees[asset] = 0;
            }
        }

        IERC20(asset).safeTransfer(recipient, amount);
        return amount;
    }

    function collectTradingFees(address asset) external override returns (uint256 feesCollected) {
        feesCollected = uncollectedFees[asset];
        uncollectedFees[asset] = 0;
        totalSupplied[asset] += feesCollected;
    }

    /**
     * @notice Simulates real DEX trading volume generating trading fee commissions (Ujrah).
     */
    function simulateTradingFees(address asset, uint256 feeAmount) external {
        uncollectedFees[asset] += feeAmount;
        // Mock manager receives the fee tokens
        // Usually already minted in tests
    }

    function getTotalManagedAssets(address asset) public view override returns (uint256) {
        return totalSupplied[asset] + uncollectedFees[asset];
    }
}
