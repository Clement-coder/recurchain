"use client"

import { motion } from "framer-motion"
import AgentCard from "./agent-card"

import { Agent } from "@/types"

interface AgentGridProps {
  agents: Agent[]
  onPauseResume: (id: string, status: "active" | "paused") => void
  onDelete: (id: string) => void
}

export default function AgentGrid({ agents, onPauseResume, onDelete }: AgentGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Active Agents</h2>
        <motion.a
          href="/agents/create"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New Agent
        </motion.a>
      </div>

      {agents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-card border border-border rounded-lg"
        >
          <p className="text-muted-foreground">No agents found. Create one to get started.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onPauseResume={() => onPauseResume(agent.id, agent.status)}
              onDelete={() => onDelete(agent.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
