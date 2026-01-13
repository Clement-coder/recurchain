import type {PrivyClientConfig} from '@privy-io/react-auth';
import { base, baseSepolia } from 'wagmi/chains';

// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
  defaultChain: baseSepolia,
  loginMethods: ['google', 'email', 'github'],
  appearance: {
    showWalletLoginFirst: false, // Set to false to resolve the warning
    theme: 'light',
    accentColor: '#676FFF',
    logo: '/recurchain_logo.png',
  },
  supportedChains: [
    base,
    baseSepolia,
  ],
};