// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapRouter} from "../../src/interfaces/ISwapRouter.sol";
import {MockERC20} from "./MockERC20.sol";

contract MockSwapRouter is ISwapRouter {
    using SafeERC20 for IERC20;

    mapping(address => mapping(address => uint256)) public exchangeRates;

    function setExchangeRate(address tokenIn, address tokenOut, uint256 rateBps) external {
        exchangeRates[tokenIn][tokenOut] = rateBps;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable override returns (uint256 amountOut) {
        require(params.amountIn > 0, "amountIn must be > 0");

        // Pull tokenIn from msg.sender
        IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), params.amountIn);

        uint256 rate = exchangeRates[params.tokenIn][params.tokenOut];
        if (rate == 0) {
            rate = 10000; // 1:1 nominal price ratio
        }

        uint8 decIn = 18;
        uint8 decOut = 18;
        try MockERC20(params.tokenIn).decimals() returns (uint8 d) {
            decIn = d;
        } catch {}
        try MockERC20(params.tokenOut).decimals() returns (uint8 d) {
            decOut = d;
        } catch {}

        uint256 normalizedAmount = params.amountIn;
        if (decIn > decOut) {
            normalizedAmount = normalizedAmount / (10 ** (decIn - decOut));
        } else if (decOut > decIn) {
            normalizedAmount = normalizedAmount * (10 ** (decOut - decIn));
        }

        amountOut = (normalizedAmount * rate) / 10000;

        require(amountOut >= params.amountOutMinimum, "Slippage exceeded");

        // Transfer tokenOut to recipient
        IERC20(params.tokenOut).safeTransfer(params.recipient, amountOut);
    }
}
