"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AgentForm from "@/components/agents/agent-form"

import { agentIcons, Agent, AgentData } from "@/types"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Spotify Subscription",
      icon: "♫",
      amount: 9.99,
      frequency: "monthly",
      recipient: "Spotify AB",
      recipientType: "USDC",
      nextRun: "2024-12-15",
      status: "active",
      startDate: "2024-11-15",
      description: "Monthly subscription payment",
      type: "subscription",
    },
    {
      id: "2",
      name: "Rent Payment",
      icon: "🏠",
      amount: 1200,
      frequency: "monthly",
      recipient: "John Landlord",
      recipientType: "Naira",
      nextRun: "2024-12-01",
      status: "active",
      startDate: "2024-11-01",
      description: "Apartment rent",
      type: "rent",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSaveAgent = (agentData: AgentData) => {
    if (editingId) {
      setAgents(
        agents.map((agent) =>
          agent.id === editingId
            ? {
                ...agent,
                ...agentData,
                icon: agentIcons[agentData.type] || "⚙️",
              }
            : agent
        )
      )
      setEditingId(null)
    } else {
      const newAgent: Agent = {
        ...agentData,
        id: Date.now().toString(),
        icon: agentIcons[agentData.type] || "⚙️",
        status: "active",
      }
      setAgents([...agents, newAgent])
    }
    setShowForm(false)
  }

  const handleEditAgent = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter((agent) => agent.id !== id))
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
            <h1 className="text-3xl font-bold text-foreground">Payment Agents</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage recurring payments</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingId(null)
              setShowForm(true)
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            + Create Agent
          </motion.button>
        </motion.div>

        <div className="p-6">
          {!showForm ? (
            <div className="space-y-4">
              {agents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-card border border-border rounded-lg"
                >
                  <p className="text-muted-foreground mb-4">No payment agents created yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Create Your First Agent
                  </button>
                </motion.div>
              ) : (
                agents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-3xl">{agent.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-semibold text-foreground">
                                {agent.recipientType === "USDC" ? "$" : "₦"} {agent.amount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Frequency</p>
                              <p className="font-semibold text-foreground capitalize">{agent.frequency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Recipient</p>
                              <p className="font-semibold text-foreground text-sm">{agent.recipient}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Next Run</p>
                              <p className="font-semibold text-primary">{agent.nextRun}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-col md:flex-row">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleEditAgent(agent.id)}
                          className="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="px-4 py-2 text-sm rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <AgentForm
              agent={editingId ? agents.find((a) => a.id === editingId) : null}
              onSave={handleSaveAgent}
              onCancel={() => {
                setShowForm(false)
                setEditingId(null)
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
