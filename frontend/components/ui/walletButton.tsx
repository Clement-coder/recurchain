'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function WalletButton() {
  const { login, ready, authenticated } = usePrivy();

  const handleLogin = async () => {
    if (!ready) return;  // SDK not ready yet
    await login();        // trigger social login / embedded wallet creation
    // optionally: after login you can redirect or handle next UI
  };

  if (authenticated) {
    return <button disabled>Logged In</button>;
  }

  return (
    <button onClick={handleLogin}>
      Sign up / Log in with social account
    </button>
  );
}
