import type {PrivyClientConfig} from '@privy-io/react-auth';
import { baseSepolia } from 'wagmi/chains';

// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    showWalletUIs: true,
    noPromptOnSignature: false,
  },
  loginMethods: ['google', 'email', 'github'],
  appearance: {
    showWalletLoginFirst: false, // Set to false to resolve the warning
    theme: 'light',
    accentColor: '#676FFF',
    logo: 'https://your-logo-url.com',
  },
  supportedChains: [
    baseSepolia,
  ],
};