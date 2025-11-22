import type {PrivyClientConfig} from '@privy-io/react-auth';

// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    showWalletUIs: true
  },
  loginMethods: ['wallet', 'email', 'sms'],
  appearance: {
    showWalletLoginFirst: true
  }
};