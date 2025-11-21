"use client"

import { motion, AnimatePresence } from "framer-motion"
import React from "react"

interface SettingsSectionProps {
  title: string
  description: string
  children: React.ReactNode
  isEditing: boolean
  onEdit: () => void
  onSave: (data?: any) => void
  onCancel: () => void
}

export default function SettingsSection({
  title,
  description,
  children,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors whitespace-nowrap"
          >
            Edit
          </motion.button>
        )}
      </div>

      <div className="mt-4">{children}</div>

      <AnimatePresence>
        {isEditing && (
          <motion.button
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Cancel
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
