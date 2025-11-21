"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Transaction } from "@/types"

interface TransactionHistoryProps {
  transactions: Transaction[]
  filterStatus: string
  onFilterStatusChange: (status: string) => void
  filterType: string
  onFilterTypeChange: (type: string) => void
}

export default function TransactionHistory({
  transactions,
  filterStatus,
  onFilterStatusChange,
  filterType,
  onFilterTypeChange,
}: TransactionHistoryProps) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
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
        {transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 bg-card border border-border rounded-lg"
          >
            <p className="text-muted-foreground">No transactions found</p>
          </motion.div>
        ) : (
          transactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-lg hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">{tx.type === "income" ? "⬇️" : "⬆️"}</div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{tx.agent}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date} • {tx.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.p
                    key={tx.amount}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`font-semibold text-sm ${tx.type === "income" ? "text-primary" : "text-destructive"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)} {tx.currency}
                  </motion.p>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Recipient</p>
                          <p className="text-sm font-medium text-foreground">{tx.recipient}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-sm font-medium text-foreground">
                            {tx.amount.toFixed(2)} {tx.currency}
                          </p>
                        </div>
                      </div>

                      {tx.txHash && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                          <code className="text-xs bg-input px-3 py-2 rounded text-foreground break-all">
                            {tx.txHash}
                          </code>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {tx.proof && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowReceiptModal(tx.id)}
                            className="flex-1 px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            View Receipt
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                        >
                          Share
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
