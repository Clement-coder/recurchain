"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, Share2, Eye, Copy } from "lucide-react";

import { Transaction } from "@/types";
import { convertEthToUsd, formatUsd } from "@/utils/currency"; // Import utility functions

interface TransactionHistoryProps {
  transactions: Transaction[];
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  ethToUsdRate: number | null; // Accept ethToUsdRate as a prop
}

export default function TransactionHistory({
  transactions,
  filterStatus,
  onFilterStatusChange,
  filterType,
  onFilterTypeChange,
  ethToUsdRate, // Destructure the prop
}: TransactionHistoryProps) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const handleCopyAddress = (txId: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Transaction History
        </h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.length > 0 &&
          transactions.map((tx, idx) => {
            const usdAmount = convertEthToUsd(tx.amount, ethToUsdRate);
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-lg hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
              >
                <div className="p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        tx.type === "income"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowDown size={16} />
                      ) : (
                        <ArrowUp size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                        {tx.agent}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.date} • {tx.time}
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto mt-2 sm:mt-0 text-left sm:text-right">
                    <motion.p
                      key={tx.amount}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className={`font-semibold text-xs sm:text-sm ${
                        tx.type === "income"
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {tx.amount.toFixed(4)} ETH
                    </motion.p>
                    {usdAmount !== null && (
                      <p className="text-xs text-muted-foreground">
                        {formatUsd(usdAmount)}
                      </p>
                    )}
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                        tx.status === "success"
                          ? "bg-primary/20 text-primary"
                          : tx.status === "pending"
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTx === tx.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border px-4 py-4 bg-secondary/30"
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {tx.type === "income" ? "Sender" : "Recipient"}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {tx.recipient}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyAddress(tx.id, tx.recipient);
                                }}
                                className="p-1 text-foreground"
                              >
                                {copiedTxId === tx.id ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                  >
                                    ✓
                                  </motion.div>
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Amount
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {tx.amount.toFixed(4)} ETH
                              {usdAmount !== null && (
                                <span className="text-muted-foreground ml-2">
                                  ({formatUsd(usdAmount)})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {tx.txHash && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Transaction Hash
                            </p>
                            <code className="text-xs bg-input px-3 py-2 rounded text-foreground break-all">
                              {tx.txHash}
                            </code>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          {tx.proof && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowReceiptModal(tx.id)}
                              className="flex-1 px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye size={14} /> View Receipt
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                          >
                            <Share2 size={14} /> Share
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
