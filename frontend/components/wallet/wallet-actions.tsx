"use client"

import { motion } from "framer-motion"

interface WalletActionsProps {
  onDeposit: () => void
  onWithdraw: () => void
}

export default function WalletActions({ onDeposit, onWithdraw }: WalletActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDeposit}
        className="px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <span>⬆️</span> Deposit USDC
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onWithdraw}
        className="px-6 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
      >
        <span>⬇️</span> Withdraw
      </motion.button>
    </div>
  )
}
