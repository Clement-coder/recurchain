"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Calendar, Download, Search, TrendingDown, TrendingUp, ChevronDown } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([
    {
      id: "1",
      agentName: "Spotify Subscription",
      amount: 9.99,
      currency: "USDC",
      status: "completed",
      date: "2024-11-20",
      time: "14:32",
      recipient: "Spotify AB",
      type: "expense",
    },
    {
      id: "2",
      agentName: "Rent Payment",
      amount: 1200,
      currency: "Naira",
      status: "completed",
      date: "2024-11-19",
      time: "09:15",
      recipient: "John Landlord",
      type: "expense",
    },
    {
      id: "3",
      agentName: "Freelance Developer",
      amount: 500,
      currency: "USDC",
      status: "completed",
      date: "2024-11-18",
      time: "16:45",
      recipient: "Dev Team Fund",
      type: "income",
    },
    {
      id: "4",
      agentName: "Insurance Premium",
      amount: 125.5,
      currency: "USDC",
      status: "completed",
      date: "2024-11-17",
      time: "11:20",
      recipient: "AXA Insurance",
      type: "expense",
    },
    {
      id: "5",
      agentName: "Cloud Storage",
      amount: 9.99,
      currency: "USDC",
      status: "pending",
      date: "2024-11-16",
      time: "08:00",
      recipient: "Google Cloud",
      type: "expense",
    },
    {
      id: "6",
      agentName: "Loan Repayment",
      amount: 350,
      currency: "Naira",
      status: "completed",
      date: "2024-11-15",
      time: "10:30",
      recipient: "Bank of Lagos",
      type: "expense",
    },
    {
      id: "7",
      agentName: "Salary Deposit",
      amount: 2000,
      currency: "USDC",
      status: "completed",
      date: "2024-11-12",
      time: "00:00",
      recipient: "Your Wallet",
      type: "income",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredTransactions = transactions.filter((tx) => {
    if (searchQuery && !tx.agentName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filterStatus !== "all" && tx.status !== filterStatus) return false
    if (filterType !== "all" && tx.type !== filterType) return false
    return true
  })

  const stats = {
    totalTransactions: transactions.length,
    completedCount: transactions.filter((t) => t.status === "completed").length,
    pendingCount: transactions.filter((t) => t.status === "pending").length,
    totalExpenses: transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                Transaction History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Track all your recurring payment transactions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
        </motion.div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <p className="text-xs text-muted-foreground font-semibold mb-2">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalTransactions}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Completed
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.completedCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-500" />
                Pending
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-foreground">${stats.totalExpenses.toFixed(2)}</p>
            </motion.div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="space-y-0">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                  >
                    <motion.button
                      onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.type === "income" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{tx.agentName}</p>
                          <p className="text-xs text-muted-foreground">{tx.recipient}</p>
                        </div>

                        <div className="text-right">
                          <p className={`font-semibold ${tx.type === "income" ? "text-primary" : "text-foreground"}`}>
                            {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>

                        <div className="ml-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              tx.status === "completed"
                                ? "bg-primary/20 text-primary"
                                : "bg-yellow-500/20 text-yellow-600"
                            }`}
                          >
                            {tx.status === "completed" ? "Completed" : "Pending"}
                          </span>
                        </div>
                      </div>

                      <motion.div animate={{ rotate: expandedId === tx.id ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </motion.button>

                    {expandedId === tx.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-secondary/20 border-t border-border px-6 py-4 space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs font-semibold">Time</p>
                            <p className="text-foreground font-medium">{tx.time}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs font-semibold">Currency</p>
                            <p className="text-foreground font-medium">{tx.currency}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold mb-1">Full Date</p>
                          <p className="text-foreground font-medium">
                            {tx.date} at {tx.time}
                          </p>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <button className="flex-1 px-3 py-2 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium">
                            View Details
                          </button>
                          <button className="flex-1 px-3 py-2 text-xs rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-medium">
                            Download Receipt
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
