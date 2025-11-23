"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, ClipboardCheck, RefreshCw } from "lucide-react";
import { convertEthToUsd, formatUsd } from "@/utils/currency"; // Import utility functions

export default function WalletHeader({
  balance,
  walletAddress,
  ethToUsdRate, // Accept ethToUsdRate as a prop
  onRefresh,
  isRefreshing,
}: {
  balance: number;
  walletAddress: string | null;
  ethToUsdRate: number | null; // Define prop type
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const usdBalance = convertEthToUsd(balance, ethToUsdRate);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <motion.div
        variants={{ hidden: { y: 20 }, visible: { y: 0 } }}
        className="md:col-span-2 bg-card border border-border rounded-lg p-6 relative overflow-hidden group hover:border-primary/30 transition-all"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1 rounded-full hover:bg-secondary"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{
                  duration: 1,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: "linear",
                }}
              >
                <RefreshCw size={14} className="text-muted-foreground" />
              </motion.div>
            </button>
          </div>
          <motion.h2
            key={balance}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-foreground mb-2" // Reduced bottom margin
          >
            {balance.toFixed(4)} ETH
          </motion.h2>
          {ethToUsdRate !== null && (
            <p className="text-lg text-muted-foreground mb-4">
              {formatUsd(usdBalance)}
            </p>
          )}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Network</p>
              <p className="text-sm font-semibold text-foreground">Base (L2)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Asset</p>
              <p className="text-sm font-semibold text-foreground">ETH</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={{ hidden: { y: 20 }, visible: { y: 0 } }}
        className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center"
      >
        <p className="text-xs text-muted-foreground mb-2">Wallet Address</p>
        {walletAddress ? (
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono text-foreground truncate">
              {walletAddress}
            </p>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-secondary"
            >
              {copied ? (
                <ClipboardCheck size={16} className="text-green-500" />
              ) : (
                <Copy size={16} className="text-muted-foreground" />
              )}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not available</p>
        )}
      </motion.div>
    </motion.div>
  );
}
