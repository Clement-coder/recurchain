"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Briefcase, Info } from "lucide-react"
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
          className="relative text-center py-12 text-muted-foreground bg-card border border-border rounded-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative">
            <div className="flex justify-center">
              <Briefcase className="w-16 h-16" />
            </div>
            <p className="mt-4 text-lg">No payment agents found.</p>
            <p className="text-sm">
              Create an agent to start automating your recurring payments.
            </p>
            <div className="mt-4 mx-auto max-w-sm p-3 bg-secondary/50 border-t border-border rounded-lg flex items-center justify-center gap-2 text-xs">
              <Info size={14} />
              <span>
                You need to <Link href="/wallet" className="font-bold text-primary hover:underline">fund your wallet</Link> before creating an agent.
              </span>
            </div>
          </div>
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
