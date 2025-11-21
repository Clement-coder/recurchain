"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Music, Briefcase, Home, CreditCard, Shield, Cloud, Bell } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AgentGrid from "@/components/dashboard/agent-grid"
import NotificationsPanel from "@/components/dashboard/notifications-panel"
import SearchBar from "@/components/dashboard/search-bar"

import { Agent, agentIcons } from "@/types"

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Spotify Subscription",
      type: "subscription",
      status: "active",
      amount: 9.99,
      frequency: "monthly",
      recipient: "Spotify AB",
      recipientType: "USDC",
      lastPayment: "2024-11-15",
      nextRun: "2024-12-15",
      icon: agentIcons.subscription,
      description: "Monthly subscription for music streaming.",
      startDate: "2023-01-15",
    },
    {
      id: "2",
      name: "Rent Payment",
      type: "rent",
      status: "active",
      amount: 1200,
      frequency: "monthly",
      recipient: "John Landlord",
      recipientType: "Naira",
      lastPayment: "2024-11-01",
      nextRun: "2024-12-01",
      icon: agentIcons.rent,
      description: "Monthly rent for apartment.",
      startDate: "2023-01-01",
    },
    {
      id: "3",
      name: "Freelance Developer",
      type: "salary",
      status: "paused",
      amount: 500,
      frequency: "bi-weekly",
      recipient: "Dev Team Fund",
      recipientType: "USDC",
      lastPayment: "2024-11-10",
      nextRun: "2024-11-24",
      icon: agentIcons.salary,
      description: "Payment for freelance work.",
      startDate: "2023-05-10",
    },
    {
      id: "4",
      name: "Insurance Premium",
      type: "insurance",
      status: "active",
      amount: 125.5,
      frequency: "monthly",
      recipient: "AXA Insurance",
      recipientType: "USDC",
      lastPayment: "2024-11-10",
      nextRun: "2024-12-10",
      icon: agentIcons.insurance,
      description: "Monthly car insurance premium.",
      startDate: "2023-02-10",
    },
    {
      id: "5",
      name: "Cloud Storage",
      type: "subscription",
      status: "active",
      amount: 9.99,
      frequency: "monthly",
      recipient: "Google Cloud",
      recipientType: "USDC",
      lastPayment: "2024-11-08",
      nextRun: "2024-12-08",
      icon: agentIcons.subscription,
      description: "Monthly subscription for cloud storage.",
      startDate: "2023-03-08",
    },
    {
      id: "6",
      name: "Loan Repayment",
      type: "loan",
      status: "active",
      amount: 350,
      frequency: "monthly",
      recipient: "Bank of Lagos",
      recipientType: "Naira",
      lastPayment: "2024-11-12",
      nextRun: "2024-12-12",
      icon: agentIcons.loan,
      description: "Monthly loan repayment.",
      startDate: "2023-04-12",
    },
  ])

  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(agents)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      setFilteredAgents(agents)
      return
    }
    const filtered = agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.recipient.toLowerCase().includes(query.toLowerCase()) ||
        agent.recipientType.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredAgents(filtered)
  }

  const handlePauseResume = (id: string) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id ? { ...agent, status: agent.status === "active" ? "paused" : "active" } : agent,
      ),
    )
    setFilteredAgents(
      filteredAgents.map((agent) =>
        agent.id === id ? { ...agent, status: agent.status === "active" ? "paused" : "active" } : agent,
      ),
    )
  }

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter((agent) => agent.id !== id))
    setFilteredAgents(filteredAgents.filter((agent) => agent.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-40 p-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage {agents.length} recurring payment agents</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </motion.button>
            </div>
            <SearchBar value={searchQuery} onChange={handleSearch} />
          </div>
        </motion.div>

        <div className="p-6 space-y-6">
          {showNotifications && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <NotificationsPanel />
            </motion.div>
          )}

          <AgentGrid agents={filteredAgents} onPauseResume={handlePauseResume} onDelete={handleDeleteAgent} />
        </div>
      </div>
    </DashboardLayout>
  )
}
