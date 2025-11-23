"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle } from "lucide-react"

interface DeleteConfirmationModalProps {
  agentName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmationModal({
  agentName,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = useState("")
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3
  const inputRef = useRef<HTMLInputElement>(null)

  const isConfirmDisabled = inputValue !== agentName || attempts >= maxAttempts
  const hasExceededAttempts = attempts >= maxAttempts

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleConfirmClick = () => {
    if (inputValue === agentName) {
      onConfirm()
    } else {
      setAttempts((prev) => prev + 1)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isConfirmDisabled) {
      handleConfirmClick()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-card border border-border rounded-xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Confirm Deletion</h3>
            <p className="text-muted-foreground mt-2">
              To confirm, please type the name of the agent "
              <span className="font-semibold text-foreground">{agentName}</span>" below.
            </p>
          </div>

          <div className="my-6">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                hasExceededAttempts
                  ? "border-gray-400 bg-gray-100 cursor-not-allowed"
                  : inputValue !== agentName && inputValue !== ""
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-border focus:ring-primary/50"
              }`}
              placeholder="Type agent name to confirm"
              disabled={hasExceededAttempts}
            />
            {inputValue !== agentName && inputValue !== "" && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Agent name does not match. {maxAttempts - attempts} attempts remaining.
              </p>
            )}
            {hasExceededAttempts && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                You have exceeded the maximum number of attempts. Deletion is disabled.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmClick}
              disabled={isConfirmDisabled}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-semibold ${
                isConfirmDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Delete Agent
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
