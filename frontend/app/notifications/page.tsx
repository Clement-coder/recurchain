"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/layout/dashboard-layout"

const mockNotifications = [
  {
    id: "1",
    type: "success",
    title: "Payment Successful",
    message: "Your Spotify subscription payment of $9.99 has been processed successfully.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Low Balance Alert",
    message: "Your USDC balance has fallen below your threshold of $100. Current balance: $87.50",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Deposit Received",
    message: "You have received a deposit of 5000 USDC from Kraken.",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "error",
    title: "Payment Failed",
    message: "Your payment to Rent Agent failed due to insufficient balance. Please deposit more USDC.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "Agent Updated",
    message: "Your Cloud Storage agent has been successfully updated with new payment details.",
    timestamp: "3 days ago",
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState("all")

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40 p-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">Stay updated with your payment activity</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Unread
            </button>
          </div>
        </motion.div>

        <div className="p-6 max-w-2xl space-y-3">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-card border border-border rounded-lg"
            >
              <p className="text-muted-foreground">No notifications</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  !notif.read
                    ? "bg-primary/10 border-primary hover:bg-primary/15"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">
                    {notif.type === "success" && "✓"}
                    {notif.type === "warning" && "⚠"}
                    {notif.type === "error" && "✕"}
                    {notif.type === "info" && "ℹ"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{notif.title}</h3>
                      {!notif.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notif.timestamp}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
