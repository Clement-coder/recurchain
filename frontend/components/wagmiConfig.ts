// wagmiConfig.ts
import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});