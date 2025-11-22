// wagmiConfig.ts
import { createConfig } from '@privy-io/wagmi';
import { baseSepolia } from 'viem/chains';
import { http } from 'wagmi';

export const config = createConfig({
  chains: [ baseSepolia],  // or whichever chains you support
  transports: {
    [baseSepolia.id]: http(),
  },
});
