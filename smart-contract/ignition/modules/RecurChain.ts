import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDC_TOKEN_ADDRESS = "0x...'; // Replace with actual USDC address on the target network
const FEE_COLLECTOR_ADDRESS = "0x..."; // Replace with the fee collector's address
const INITIAL_PLATFORM_FEE = 10; // 0.1% in basis points

const RecurChainModule = buildModule("RecurChainModule", (m) => {
  const usdcTokenAddress = m.getParameter("usdcTokenAddress", USDC_TOKEN_ADDRESS);
  const feeCollectorAddress = m.getParameter("feeCollectorAddress", FEE_COLLECTOR_ADDRESS);

  const recurChainAgent = m.contract("RecurChainAgent", [
    usdcTokenAddress,
    feeCollectorAddress,
  ]);

  return { recurChainAgent };
});

export default RecurChainModule;
