// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {ShariahYieldVault} from "../src/ShariahYieldVault.sol";
import {HalalAssetRegistry} from "../src/HalalAssetRegistry.sol";
import {IShariahYieldVault} from "../src/interfaces/IShariahYieldVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockHalalLiquidityManager} from "./mocks/MockHalalLiquidityManager.sol";
import {MockSwapRouter} from "./mocks/MockSwapRouter.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ShariahYieldVaultTest is Test {
    ShariahYieldVault public vault;
    HalalAssetRegistry public registry;
    MockHalalLiquidityManager public liquidityManager;
    MockSwapRouter public swapRouter;

    MockERC20 public usdc;
    MockERC20 public paxg; // Gold-backed token
    MockERC20 public weth;
    MockERC20 public haramToken; // Non-screened / lending token
    MockERC20 public randomToken;

    address public owner = address(0xAA);
    address public alice = address(0xB1);
    address public bob = address(0xB2);
    address public charlie = address(0xB3);

    uint256 public constant INITIAL_USDC = 100_000 * 1e6;
    uint256 public constant INITIAL_PAXG = 100 * 1e18;

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
    event ShariahSpotSwapAndDeposit(
        address indexed partner,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 shares
    );

    function setUp() public {
        // Deploy Screening Registry
        registry = new HalalAssetRegistry(owner);

        // Deploy DEX Strategy & Swap Infrastructure
        liquidityManager = new MockHalalLiquidityManager();
        swapRouter = new MockSwapRouter();

        // Deploy Tokens
        usdc = new MockERC20("USD Coin (Fiat-Backed)", "USDC", 6);
        paxg = new MockERC20("PAX Gold (Physical Commodity)", "PAXG", 18);
        weth = new MockERC20("Wrapped Ether", "WETH", 18);
        haramToken = new MockERC20("Interest-Bearing Token", "cUSDC", 8);
        randomToken = new MockERC20("Unrelated Airdrop", "RND", 18);

        // Shariah Screening Whitelist (Fatwa References)
        vm.startPrank(owner);
        registry.setAssetScreening(
            address(usdc),
            "USDC",
            true,
            "Fatwa DSN-MUI No. 116/DSN-MUI/IX/2017 & AAOIFI Standard No. 57 (Gold/Currency)"
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
            "Permissible Utility Token for Computational Gas"
        );
        registry.setAssetScreening(
            address(haramToken),
            "cUSDC",
            false,
            "Prohibited: Involves Riba al-Qardh (Interest-bearing lending pool debt)"
        );

        // Deploy Shariah Yield Vault
        vault = new ShariahYieldVault(
            address(registry),
            address(swapRouter),
            address(liquidityManager),
            owner
        );

        // Configure supported vault assets
        vault.setVaultAssetConfiguration(address(usdc), true);
        vault.setVaultAssetConfiguration(address(weth), true);
        vm.stopPrank();

        // Fund test users
        usdc.mint(alice, INITIAL_USDC);
        usdc.mint(bob, INITIAL_USDC);
        paxg.mint(alice, INITIAL_PAXG);
        randomToken.mint(address(vault), 1000 * 1e18); // Stuck tokens for rescue test

        // Fund liquidity manager with reserves for fee payouts
        usdc.mint(address(liquidityManager), 1_000_000 * 1e6);
        usdc.mint(address(swapRouter), 1_000_000 * 1e6);

        // Approvals
        vm.prank(alice);
        usdc.approve(address(vault), type(uint256).max);
        vm.prank(alice);
        paxg.approve(address(vault), type(uint256).max);

        vm.prank(bob);
        usdc.approve(address(vault), type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                           INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_InitialState() public view {
        assertEq(address(vault.shariahRegistry()), address(registry));
        assertEq(address(vault.swapRouter()), address(swapRouter));
        assertEq(address(vault.liquidityManager()), address(liquidityManager));
        assertTrue(vault.supportedVaultAssets(address(usdc)));
        assertFalse(vault.supportedVaultAssets(address(haramToken)));
    }

    function test_ShariahRegistryScreening() public view {
        assertTrue(registry.isHalal(address(usdc)));
        assertTrue(registry.isHalal(address(paxg)));
        assertFalse(registry.isHalal(address(haramToken)));
    }

    /*//////////////////////////////////////////////////////////////
                     SHARIAH SCREENING & DEPOSIT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RevertIf_DepositNonHalalToken() public {
        haramToken.mint(alice, 1000 * 1e8);
        vm.prank(alice);
        haramToken.approve(address(vault), type(uint256).max);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                IShariahYieldVault.TokenNotShariahCompliant.selector,
                address(haramToken)
            )
        );
        vault.deposit(address(haramToken), 100 * 1e8);
    }

    function test_MusyarakahDeposit_Success() public {
        uint256 depositAmount = 2_000 * 1e6; // 2,000 USDC

        vm.expectEmit(true, true, false, true);
        emit MusyarakahDeposited(alice, address(usdc), depositAmount, depositAmount);

        vm.prank(alice);
        uint256 shares = vault.deposit(address(usdc), depositAmount);

        assertEq(shares, depositAmount);
        assertEq(vault.userShares(address(usdc), alice), depositAmount);
        assertEq(vault.totalShares(address(usdc)), depositAmount);
        assertEq(vault.getPartnerBalance(alice, address(usdc)), depositAmount);
        assertEq(vault.getPartnerTradingYield(alice, address(usdc)), 0);
        assertEq(usdc.balanceOf(alice), INITIAL_USDC - depositAmount);
    }

    function test_DepositMultiplePartners() public {
        uint256 aliceAmount = 1_000 * 1e6;
        uint256 bobAmount = 3_000 * 1e6;

        vm.prank(alice);
        vault.deposit(address(usdc), aliceAmount);

        vm.prank(bob);
        vault.deposit(address(usdc), bobAmount);

        assertEq(vault.totalShares(address(usdc)), aliceAmount + bobAmount);
        assertEq(vault.getPartnerBalance(alice, address(usdc)), aliceAmount);
        assertEq(vault.getPartnerBalance(bob, address(usdc)), bobAmount);
    }

    /*//////////////////////////////////////////////////////////////
              ZERO-RIBA TRADING FEE YIELD & ACCRUAL (UJRAH)
    //////////////////////////////////////////////////////////////*/

    function test_TradingFeeAccrualAndProRataDistribution() public {
        uint256 aliceAmount = 1_000 * 1e6; // 25% of pool
        uint256 bobAmount = 3_000 * 1e6;   // 75% of pool

        vm.prank(alice);
        vault.deposit(address(usdc), aliceAmount);

        vm.prank(bob);
        vault.deposit(address(usdc), bobAmount);

        // Real DEX trading volume generates 400 USDC in trading fees (Ujrah)
        // Simulated zero-interest swap commissions from Uniswap V3 liquidity pool
        uint256 tradingFeesEarned = 400 * 1e6;
        liquidityManager.simulateTradingFees(address(usdc), tradingFeesEarned);

        // Total managed assets now 4,400 USDC
        assertEq(vault.totalAssetBalance(address(usdc)), 4_400 * 1e6);

        // Alice owns 25% -> 1,000 + 100 = 1,100 USDC (yield = 100 USDC)
        // Bob owns 75%   -> 3,000 + 300 = 3,300 USDC (yield = 300 USDC)
        assertEq(vault.getPartnerBalance(alice, address(usdc)), 1_100 * 1e6);
        assertEq(vault.getPartnerTradingYield(alice, address(usdc)), 100 * 1e6);

        assertEq(vault.getPartnerBalance(bob, address(usdc)), 3_300 * 1e6);
        assertEq(vault.getPartnerTradingYield(bob, address(usdc)), 300 * 1e6);

        // Alice withdraws all
        vm.prank(alice);
        (uint256 aliceOut, ) = vault.withdrawAll(address(usdc), alice);
        assertEq(aliceOut, 1_100 * 1e6);
        assertEq(usdc.balanceOf(alice), INITIAL_USDC + 100 * 1e6);

        // Bob withdraws all
        vm.prank(bob);
        (uint256 bobOut, ) = vault.withdrawAll(address(usdc), bob);
        assertEq(bobOut, 3_300 * 1e6);
        assertEq(usdc.balanceOf(bob), INITIAL_USDC + 300 * 1e6);
    }

    /*//////////////////////////////////////////////////////////////
                             WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_PartialWithdrawal() public {
        uint256 depositAmount = 2_000 * 1e6;
        uint256 withdrawAmount = 750 * 1e6;

        vm.prank(alice);
        vault.deposit(address(usdc), depositAmount);

        vm.prank(alice);
        uint256 sharesBurned = vault.withdraw(address(usdc), withdrawAmount, alice);

        assertEq(sharesBurned, withdrawAmount);
        assertEq(vault.getPartnerBalance(alice, address(usdc)), 1_250 * 1e6);
        assertEq(usdc.balanceOf(alice), INITIAL_USDC - 1_250 * 1e6);
    }

    function test_RevertIf_WithdrawExceedsBalance() public {
        vm.prank(alice);
        vault.deposit(address(usdc), 500 * 1e6);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                IShariahYieldVault.InsufficientPartnerBalance.selector,
                600 * 1e6,
                500 * 1e6
            )
        );
        vault.withdraw(address(usdc), 600 * 1e6, alice);
    }

    /*//////////////////////////////////////////////////////////////
                 HALAL SPOT SWAP & DEPOSIT (BAY' AL-SARF)
    //////////////////////////////////////////////////////////////*/

    function test_ShariahSpotSwapAndDeposit_Success() public {
        // Alice swaps screened PAXG Gold (18 decimals) into USDC (6 decimals) and deposits
        uint256 amountIn = 1 * 1e18; // 1 PAXG
        // Exchange rate: 1 PAXG = 2,500 USDC (in basis points: 2,500 * 10,000 = 25,000,000)
        swapRouter.setExchangeRate(address(paxg), address(usdc), 25_000_000);

        uint256 expectedOut = 2_500 * 1e6; // 2,500 USDC

        vm.prank(alice);
        (uint256 amountOut, uint256 shares) = vault.swapAndDeposit(
            address(paxg),
            address(usdc),
            500,
            amountIn,
            expectedOut
        );

        assertEq(amountOut, expectedOut);
        assertEq(shares, expectedOut);
        assertEq(vault.getPartnerBalance(alice, address(usdc)), expectedOut);
        assertEq(paxg.balanceOf(alice), INITIAL_PAXG - amountIn);
    }

    function test_RevertIf_SwapNonHalalToken() public {
        haramToken.mint(alice, 100 * 1e8);
        vm.prank(alice);
        haramToken.approve(address(vault), type(uint256).max);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                IShariahYieldVault.TokenNotShariahCompliant.selector,
                address(haramToken)
            )
        );
        vault.swapAndDeposit(address(haramToken), address(usdc), 500, 10 * 1e8, 10 * 1e6);
    }

    /*//////////////////////////////////////////////////////////////
                        CIRCUIT BREAKER & RESCUE
    //////////////////////////////////////////////////////////////*/

    function test_PauseBlocksDeposits() public {
        vm.prank(owner);
        vault.pause();

        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        vault.deposit(address(usdc), 100 * 1e6);

        vm.prank(owner);
        vault.unpause();

        vm.prank(alice);
        vault.deposit(address(usdc), 100 * 1e6);
        assertEq(vault.getPartnerBalance(alice, address(usdc)), 100 * 1e6);
    }

    function test_EmergencyTokenRescue() public {
        uint256 rescueAmount = 1000 * 1e18;
        address recipient = address(0x777);

        vm.prank(owner);
        vault.emergencyTokenRescue(address(randomToken), rescueAmount, recipient);

        assertEq(randomToken.balanceOf(recipient), rescueAmount);
        assertEq(randomToken.balanceOf(address(vault)), 0);
    }

    function test_WithdrawAll_Success() public {
        uint256 depositAmount = 3_000 * 1e6;

        vm.prank(alice);
        vault.deposit(address(usdc), depositAmount);

        vm.prank(alice);
        (uint256 totalAmount, uint256 sharesBurned) = vault.withdrawAll(address(usdc), alice);

        assertEq(totalAmount, depositAmount);
        assertEq(sharesBurned, depositAmount);
        assertEq(vault.getPartnerBalance(alice, address(usdc)), 0);
        assertEq(usdc.balanceOf(alice), INITIAL_USDC);
    }

    function test_RevertIf_DepositZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(IShariahYieldVault.ZeroAmount.selector);
        vault.deposit(address(usdc), 0);
    }

    function test_RevertIf_ConstructorZeroAddress() public {
        vm.expectRevert(IShariahYieldVault.ZeroAddress.selector);
        new ShariahYieldVault(address(0), address(swapRouter), address(liquidityManager), owner);

        vm.expectRevert(IShariahYieldVault.ZeroAddress.selector);
        new ShariahYieldVault(address(registry), address(0), address(liquidityManager), owner);
    }

    function test_RevertIf_NonOwnerConfiguresRegistry() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        registry.setAssetScreening(address(usdc), "USDC", true, "Unauthorized");
    }

    function test_RevertIf_RescueActiveLiquidity() public {
        vm.prank(alice);
        vault.deposit(address(usdc), 1_000 * 1e6);

        vm.prank(owner);
        vm.expectRevert(IShariahYieldVault.CannotRescueActiveLiquidity.selector);
        vault.emergencyTokenRescue(address(usdc), 500 * 1e6, owner);
    }

    function test_RevertIf_SwapIdenticalTokens() public {
        vm.prank(alice);
        vm.expectRevert(IShariahYieldVault.IdenticalTokens.selector);
        vault.swapAndDeposit(address(usdc), address(usdc), 500, 100 * 1e6, 95 * 1e6);
    }

    function test_CompoundTradingFees() public {
        vm.prank(alice);
        vault.deposit(address(usdc), 1_000 * 1e6);

        liquidityManager.simulateTradingFees(address(usdc), 100 * 1e6);

        vm.expectEmit(true, false, false, true);
        emit IShariahYieldVault.TradingFeesCompounded(address(usdc), 100 * 1e6, 1_100 * 1e6);

        vault.compoundTradingFees(address(usdc));
    }

    /*//////////////////////////////////////////////////////////////
                             FUZZ TESTING
    //////////////////////////////////////////////////////////////*/

    function testFuzz_DepositAndWithdraw(uint256 amount) public {
        amount = bound(amount, 1 * 1e6, 50_000 * 1e6);

        usdc.mint(alice, amount);
        vm.prank(alice);
        usdc.approve(address(vault), amount);

        vm.prank(alice);
        uint256 shares = vault.deposit(address(usdc), amount);
        assertEq(shares, amount);

        vm.prank(alice);
        (uint256 withdrawn, uint256 burned) = vault.withdrawAll(address(usdc), alice);
        assertEq(withdrawn, amount);
        assertEq(burned, shares);
        assertEq(vault.getPartnerBalance(alice, address(usdc)), 0);
    }
}
