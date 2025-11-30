"use client";

import { useWallets } from "@privy-io/react-auth";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NetworkSwitcher() {
  const { wallets, ready } = useWallets();
  const [isOpen, setIsOpen] = useState(false);

  if (!ready) {
    return null;
  }

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  if (!embeddedWallet) {
    return null;
  }

  const supportedChains = embeddedWallet.supportedChains;
  const activeChain = supportedChains.find(
    (chain) => chain.id === embeddedWallet.chainId
  );

  const switchChain = async (chainId: number) => {
    await embeddedWallet.switchChain(chainId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
      >
        <span>{activeChain?.name ?? "Select Network"}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10"
          >
            {supportedChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => switchChain(chain.id)}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {chain.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
