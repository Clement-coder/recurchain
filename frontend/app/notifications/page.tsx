"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Inbox } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
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
          className="sticky top-0 bg-background/95 backdrop-blur w-full border-b border-border z-40 p-4 flex items-center justify-between"
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
              className="relative text-center py-12 text-muted-foreground bg-card border border-border rounded-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="relative">
                <div className="flex justify-center">
                  <Inbox className="w-16 h-16" />
                </div>
                <p className="mt-4 text-lg">No notifications yet.</p>
                <p className="text-sm">
                  New notifications will appear here.
                </p>
              </div>
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