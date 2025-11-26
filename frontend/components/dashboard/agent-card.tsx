"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Circle, Trash2, Eye } from "lucide-react"

import { Agent } from "@/types"

import DeleteConfirmationModal from "@/components/agents/DeleteConfirmationModal"

interface AgentCardProps {
  agent: Agent
  onPauseResume: () => void
  onDelete: () => void
}

export default function AgentCard({ agent, onPauseResume, onDelete }: AgentCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    onDelete()
    setShowDeleteModal(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all cursor-pointer relative group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{agent.icon}</div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.recipient}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span
            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
              agent.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            <Circle className={`w-2 h-2 ${agent.status === "active" ? "fill-primary" : ""}`} />
            {agent.status}
          </span>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{agent.recipientType}</span>
        </div>

        <div className="space-y-2 mb-4 pb-4 border-b border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Amount</span>
            <span className="text-sm font-semibold text-foreground">
              {agent.recipientType === "USDC" ? "$" : "₦"} {agent.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Frequency</span>
            <span className="text-sm text-foreground capitalize">{agent.frequency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Next Run</span>
            <span className="text-sm text-primary font-medium">{agent.nextRun}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPauseResume}
            className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {agent.status === "active" ? "Pause" : "Resume"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-3 py-2 text-xs font-medium rounded-md border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Edit
          </motion.button>
        </div>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-2 bg-card border border-border rounded-lg shadow-lg z-20 min-w-40"
            >
              <button
                onClick={() => {
                  handleDelete()
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-t-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Agent
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-b-lg flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View History
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmationModal
            agentName={agent.name}
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
