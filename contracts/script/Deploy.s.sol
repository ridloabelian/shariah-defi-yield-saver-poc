// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ShariahYieldVault} from "../src/ShariahYieldVault.sol";
import {HalalAssetRegistry} from "../src/HalalAssetRegistry.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";
import {MockHalalLiquidityManager} from "../test/mocks/MockHalalLiquidityManager.sol";
import {MockSwapRouter} from "../test/mocks/MockSwapRouter.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deploying Shariah-Compliant DeFi Yield Vault with deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Shariah Screening Registry
        HalalAssetRegistry registry = new HalalAssetRegistry(deployer);

        // 2. Deploy Mock Halal Infrastructure
        MockHalalLiquidityManager liquidityManager = new MockHalalLiquidityManager();
        MockSwapRouter swapRouter = new MockSwapRouter();

        // 3. Deploy Halal Digital Assets
        MockERC20 usdc = new MockERC20("USD Coin (Fiat-Backed)", "USDC", 6);
        MockERC20 paxg = new MockERC20("PAX Gold (Physical Commodity)", "PAXG", 18);
        MockERC20 weth = new MockERC20("Wrapped Ether (Utility Gas)", "WETH", 18);

        // 4. Whitelist Halal Assets in Registry
        registry.setAssetScreening(
            address(usdc),
            "USDC",
            true,
            "Fatwa DSN-MUI No. 116/DSN-MUI/IX/2017 & AAOIFI Standard No. 57"
        );
        registry.setAssetScreening(
            address(paxg),
            "PAXG",
            true,
            "AAOIFI Shariah Standard No. 57 on Gold and its Trading Controls"
        );
        registry.setAssetScreening(
            address(weth),
            "WETH",
            true,
            "Permissible Utility Asset for EVM Computational Gas"
        );

        // 5. Deploy Shariah Yield Vault
        ShariahYieldVault vault = new ShariahYieldVault(
            address(registry),
            address(swapRouter),
            address(liquidityManager),
            deployer
        );

        // 6. Whitelist in Vault
        vault.setVaultAssetConfiguration(address(usdc), true);
        vault.setVaultAssetConfiguration(address(paxg), true);
        vault.setVaultAssetConfiguration(address(weth), true);

        // 7. Seed Liquidity for Testing
        usdc.mint(address(liquidityManager), 5_000_000 * 1e6);
        usdc.mint(address(swapRouter), 5_000_000 * 1e6);
        paxg.mint(address(swapRouter), 5_000 * 1e18);

        // Mint test funds for deployer
        usdc.mint(deployer, 50_000 * 1e6);
        paxg.mint(deployer, 10 * 1e18);
        weth.mint(deployer, 20 * 1e18);

        vm.stopBroadcast();

        console2.log("--------------------------------------------------");
        console2.log("Shariah Yield Vault Deployed Successfully!");
        console2.log("ShariahYieldVault    :", address(vault));
        console2.log("HalalAssetRegistry   :", address(registry));
        console2.log("LiquidityManager     :", address(liquidityManager));
        console2.log("SwapRouter           :", address(swapRouter));
        console2.log("USDC (Halal)         :", address(usdc));
        console2.log("PAXG Gold (Halal)    :", address(paxg));
        console2.log("WETH (Halal)         :", address(weth));
        console2.log("--------------------------------------------------");
    }
}
