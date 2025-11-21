"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music, Briefcase, Home, CreditCard, Shield, Settings } from "lucide-react"

import { Agent, AgentData, AgentType } from "@/types"

export const agentTypes = [
  { value: "subscription", label: "Subscription", Icon: Music },
  { value: "salary", label: "Salary", Icon: Briefcase },
  { value: "rent", label: "Rent", Icon: Home },
  { value: "loan", label: "Loan", Icon: CreditCard },
  { value: "insurance", label: "Insurance", Icon: Shield },
  { value: "other", label: "Other", Icon: Settings },
]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

interface AgentFormProps {
  agent?: Agent | null
  onSave: (agentData: AgentData) => void
  onCancel: () => void
}

export default function AgentForm({ agent, onSave, onCancel }: AgentFormProps) {
  const [formData, setFormData] = useState(
    agent || {
      name: "",
      type: "subscription" as AgentType,
      amount: "",
      frequency: "monthly",
      recipient: "",
      recipientType: "USDC",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
    }
  )

  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const selectedType = agentTypes.find((t) => t.value === formData.type)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.amount || Number.parseFloat(String(formData.amount)) <= 0) {
      newErrors.amount = "Valid amount is required"
    }
    if (!formData.recipient.trim()) newErrors.recipient = "Recipient is required"
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    const nextRunDate = new Date(formData.startDate)
    nextRunDate.setMonth(nextRunDate.getMonth() + 1)

    onSave({
      ...formData,
      amount: Number.parseFloat(String(formData.amount)),
      nextRun: nextRunDate.toISOString().split("T")[0],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-6 space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {agent ? "Edit Payment Agent" : "Create Payment Agent"}
        </h2>
        <p className="text-sm text-muted-foreground">Set up an autonomous recurring payment with complete control</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">Agent Type</label>
        <div className="grid grid-cols-3 gap-2">
          {agentTypes.map((type) => {
            const IconComponent = type.Icon
            return (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFormData({
                    ...formData,
                    type: type.value as AgentType,
                  })
                }}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  formData.type === type.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary hover:border-primary/50"
                }`}
              >
                <div className="flex justify-center mb-1">
                  <IconComponent className="w-6 h-6 text-foreground" />
                </div>
                <div className="text-xs font-medium text-foreground">{type.label}</div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Agent Name</label>
          <input
            type="text"
            placeholder="e.g., Netflix Subscription"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              errors.name ? "border-destructive" : "border-border"
            }`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
          <input
            type="text"
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Amount</label>
          <div className="flex items-center border border-border rounded-lg bg-input">
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`flex-1 px-4 py-3 bg-transparent text-foreground focus:outline-none ${
                errors.amount ? "border-destructive" : ""
              }`}
            />
            <select
              value={formData.recipientType}
              onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
              className="px-3 py-3 bg-secondary border-l border-border text-foreground focus:outline-none cursor-pointer"
            >
              <option value="USDC">USDC</option>
              <option value="Naira">₦</option>
            </select>
          </div>
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Frequency</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
          >
            {frequencies.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Recipient</label>
        <input
          type="text"
          placeholder="Recipient name or account"
          value={formData.recipient}
          onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            errors.recipient ? "border-destructive" : "border-border"
          }`}
        />
        {errors.recipient && <p className="text-xs text-destructive mt-1">{errors.recipient}</p>}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-secondary/50 border border-border rounded-lg p-4 space-y-2"
      >
        <p className="text-xs text-muted-foreground font-semibold">Summary</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Every</p>
            <p className="font-semibold text-foreground capitalize">{formData.frequency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Send</p>
            <p className="font-semibold text-foreground">
              {formData.recipientType === "USDC" ? "$" : "₦"} {formData.amount || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">To</p>
            <p className="font-semibold text-foreground text-sm">{formData.recipient || "Recipient"}</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-medium"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
        >
          {agent ? "Update Agent" : "Create Agent"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">Confirm Agent Setup</h3>

              <div className="bg-secondary/50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <p className="text-muted-foreground">
                  This agent will send{" "}
                  <span className="font-semibold text-foreground">
                    {formData.recipientType === "USDC" ? "$" : "₦"} {formData.amount}
                  </span>{" "}
                  to <span className="font-semibold text-foreground">{formData.recipient}</span> every{" "}
                  <span className="font-semibold text-foreground">{formData.frequency}</span> starting{" "}
                  <span className="font-semibold text-foreground">{formData.startDate}</span>.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
                >
                  Confirm Setup
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
