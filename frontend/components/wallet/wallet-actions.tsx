"use client";

import { motion } from "framer-motion";
import { ArrowUp, Send, Landmark } from "lucide-react";

interface WalletActionsProps {
  onDeposit: () => void;
  onSend: () => void;
  onOffRamp: () => void;
  isOffRampDisabled?: boolean;
}

export default function WalletActions({
  onDeposit,
  onSend,
  onOffRamp,
  isOffRampDisabled,
}: WalletActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDeposit}
        className="px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowUp size={20} />
        <span>Deposit</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSend}
        className="px-6 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        <span>Send</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOffRamp}
        disabled={isOffRampDisabled}
        className="px-6 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Landmark size={20} />
        <span>Bridge</span>
      </motion.button>
    </div>
  );
}
