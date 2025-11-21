"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, Landmark, Wand2 } from "lucide-react"
import { Transaction } from "@/types"
import DashboardLayout from "@/components/layout/dashboard-layout"
import WalletHeader from "@/components/wallet/wallet-header"
import WalletActions from "@/components/wallet/wallet-actions"
import TransactionHistory from "@/components/wallet/transaction-history"

export default function WalletPage() {
  const [balance, setBalance] = useState(2450.75)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "expense",
      agent: "Spotify Subscription",
      amount: 9.99,
      currency: "USDC",
      status: "success",
      date: "2024-11-20",
      time: "14:32",
      recipient: "Spotify AB",
      txHash: "0x1234...5678",
      proof: "receipt-1.pdf",
    },
    {
      id: "2",
      type: "expense",
      agent: "Rent Payment",
      amount: 1200,
      currency: "Naira",
      status: "success",
      date: "2024-11-19",
      time: "09:15",
      recipient: "John Landlord",
      proof: "bank-transfer-019.pdf",
    },
    {
      id: "3",
      type: "income",
      agent: "Deposit from Kraken",
      amount: 5000,
      currency: "USDC",
      status: "success",
      date: "2024-11-18",
      time: "16:45",
      recipient: "Your Wallet",
      txHash: "0xabcd...ef01",
    },
    {
      id: "4",
      type: "expense",
      agent: "Insurance Premium",
      amount: 125.5,
      currency: "USDC",
      status: "success",
      date: "2024-11-17",
      time: "11:20",
      recipient: "AXA Insurance",
      txHash: "0x2345...6789",
    },
    {
      id: "5",
      type: "expense",
      agent: "Cloud Storage",
      amount: 9.99,
      currency: "USDC",
      status: "pending",
      date: "2024-11-16",
      time: "08:00",
      recipient: "Google Cloud",
    },
  ])

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const filteredTransactions = transactions.filter((tx) => {
    if (filterStatus !== "all" && tx.status !== filterStatus) return false
    if (filterType !== "all" && tx.type !== filterType) return false
    return true
  })

  const handleDeposit = (amount: number) => {
    setBalance(balance + amount)
    setShowDepositModal(false)
  }

  const handleWithdraw = (amount: number) => {
    if (amount <= balance) {
      setBalance(balance - amount)
      setShowWithdrawModal(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40 p-6"
        >
          <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your USDC balance and transactions</p>
        </motion.div>

        <div className="p-6 space-y-6">
          <WalletHeader balance={balance} />

          <WalletActions onDeposit={() => setShowDepositModal(true)} onWithdraw={() => setShowWithdrawModal(true)} />

          <TransactionHistory
            transactions={filteredTransactions}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
          />
        </div>

        {showDepositModal && <DepositModal onClose={() => setShowDepositModal(false)} onConfirm={handleDeposit} />}

        {showWithdrawModal && (
          <WithdrawModal balance={balance} onClose={() => setShowWithdrawModal(false)} onConfirm={handleWithdraw} />
        )}
      </div>
    </DashboardLayout>
  )
}

function DepositModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (amount: number) => void
}) {
  const [amount, setAmount] = useState("")
  const [selectedWallet, setSelectedWallet] = useState("metamask")
  const [isProcessing, setIsProcessing] = useState(false)

  const walletOptions = [
    { id: "metamask", name: "MetaMask", Icon: Zap },
    { id: "coinbase", name: "Coinbase Wallet", Icon: Landmark },
    { id: "phantom", name: "Phantom", Icon: Wand2 },
  ]

  const handleSubmit = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return
    setIsProcessing(true)
    setTimeout(() => {
      onConfirm(Number.parseFloat(amount))
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">Deposit USDC</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Wallet</label>
            <div className="grid grid-cols-3 gap-2">
              {walletOptions.map((wallet) => {
                const IconComponent = wallet.Icon
                return (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedWallet(wallet.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedWallet === wallet.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <IconComponent className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="text-xs text-foreground">{wallet.name}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount (USDC)</label>
            <div className="flex items-center border border-border rounded-lg bg-input">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-transparent text-foreground focus:outline-none"
              />
              <span className="px-4 text-muted-foreground">USDC</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[100, 500, 1000, 2500].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isProcessing || !amount}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Processing..." : "Confirm Deposit"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function WithdrawModal({
  balance,
  onClose,
  onConfirm,
}: {
  balance: number
  onClose: () => void
  onConfirm: (amount: number) => void
}) {
  const [amount, setAmount] = useState("")
  const [withdrawType, setWithdrawType] = useState("usdc")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async () => {
    if (!amount || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > balance) return
    setIsProcessing(true)
    setTimeout(() => {
      onConfirm(Number.parseFloat(amount))
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">Withdraw Funds</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Withdraw as</label>
            <div className="flex gap-2">
              <button
                onClick={() => setWithdrawType("usdc")}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  withdrawType === "usdc"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-foreground"
                }`}
              >
                USDC
              </button>
              <button
                onClick={() => setWithdrawType("naira")}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  withdrawType === "naira"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-foreground"
                }`}
              >
                Naira
              </button>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="text-lg font-semibold text-foreground">${balance.toFixed(2)} USDC</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
            <div className="flex items-center border border-border rounded-lg bg-input">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-transparent text-foreground focus:outline-none"
              />
              <span className="px-4 text-muted-foreground">{withdrawType === "usdc" ? "USDC" : "₦"}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isProcessing || !amount}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Processing..." : "Confirm Withdrawal"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
