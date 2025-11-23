"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Music,
  Briefcase,
  Home,
  CreditCard,
  Shield,
  Settings,
  ArrowRight,
  X,
  Check,
  Info,
  DollarSign,
  Calendar,
  Repeat,
  User,
  Wallet,
  FileText,
} from "lucide-react"

import { Agent, AgentData, AgentType } from "@/types"
import CustomSelect from "@/components/ui/custom-select"

export const agentTypes = [
  { value: "subscription", label: "Subscription", Icon: Music },
  { value: "salary", label: "Salary", Icon: Briefcase },
  { value: "rent", label: "Rent", Icon: Home },
  { value: "loan", label: "Loan", Icon: CreditCard },
  { value: "insurance", label: "Insurance", Icon: Shield },
  { value: "other", label: "Other", Icon: Settings },
]

const frequencies = [
  { value: "daily", label: "Daily", icon: Repeat },
  { value: "weekly", label: "Weekly", icon: Repeat },
  { value: "bi-weekly", label: "Bi-Weekly", icon: Repeat },
  { value: "monthly", label: "Monthly", icon: Repeat },
  { value: "quarterly", label: "Quarterly", icon: Repeat },
  { value: "yearly", label: "Yearly", icon: Repeat },
]

const recipientTypes = [
  { value: "USDC", label: "USDC", icon: DollarSign },
  { value: "Naira", label: "Naira", icon: Wallet },
]

interface AgentFormProps {
  agent?: Agent | null
  onSave: (agentData: AgentData) => void
  onCancel: () => void
}


const InputField = ({
  id,
  label,
  description,
  Icon,
  children,
  error,
}: {
  id: string
  label: string
  description: string
  Icon: React.ElementType
  children: React.ReactNode
  error?: string
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-foreground mb-1">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span>{label}</span>
      </div>
    </label>
    <p className="text-xs text-muted-foreground mb-2">{description}</p>
    {children}
    {error && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><Info className="w-3 h-3"/>{error}</p>}
  </div>
)

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
    const newErrors: { [key:string]: string } = {}
    if (!formData.name.trim()) newErrors.name = "A descriptive name is required."
    if (!formData.amount || Number.parseFloat(String(formData.amount)) <= 0) {
      newErrors.amount = "A valid positive amount is required."
    }
    if (!formData.recipient.trim()) newErrors.recipient = "Recipient address or name is required."
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
    // Simple date increment logic, might need more robust library for production
    switch (formData.frequency) {
      case "daily":
        nextRunDate.setDate(nextRunDate.getDate() + 1)
        break
      case "weekly":
        nextRunDate.setDate(nextRunDate.getDate() + 7)
        break
      case "bi-weekly":
        nextRunDate.setDate(nextRunDate.getDate() + 14)
        break
      case "monthly":
        nextRunDate.setMonth(nextRunDate.getMonth() + 1)
        break
      case "quarterly":
        nextRunDate.setMonth(nextRunDate.getMonth() + 3)
        break
      case "yearly":
        nextRunDate.setFullYear(nextRunDate.getFullYear() + 1)
        break
    }

    onSave({
      ...formData,
      amount: Number.parseFloat(String(formData.amount)),
      nextRun: nextRunDate.toISOString().split("T")[0],
    })
  }

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {agent ? "Edit Payment Agent" : "Create a New Payment Agent"}
          </h1>
          <p className="text-muted-foreground mt-2">Set up an autonomous recurring payment with complete control.</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3 text-center">
              What type of payment is this?
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {agentTypes.map((type) => {
                const IconComponent = type.Icon
                return (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInputChange("type", type.value as AgentType)}
                    className={`p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center justify-center aspect-square ${
                      formData.type === type.value
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <IconComponent
                      className={`w-7 h-7 mb-2 transition-colors ${
                        formData.type === type.value ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-xs font-medium text-foreground">{type.label}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="agentName"
              label="Agent Name"
              description="Give this payment agent a memorable name."
              Icon={FileText}
              error={errors.name}
            >
              <input
                id="agentName"
                type="text"
                placeholder="e.g., Netflix Subscription"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
              />
            </InputField>

            <InputField
              id="description"
              label="Description"
              description="Add an optional note for this payment."
              Icon={FileText}
            >
              <input
                id="description"
                type="text"
                placeholder="For my premium plan"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </InputField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              id="amount"
              label="Amount"
              description="How much to send each time."
              Icon={DollarSign}
              error={errors.amount}
            >
              <div className="flex items-center border border-border rounded-lg bg-input focus-within:ring-2 focus-within:ring-primary/50">
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`flex-1 px-4 py-2.5 bg-transparent text-foreground focus:outline-none rounded-l-lg ${
                    errors.amount ? "border-destructive" : ""
                  }`}
                />
                <CustomSelect
                  options={recipientTypes}
                  value={formData.recipientType}
                  onChange={(value) => handleInputChange("recipientType", value)}
                  className="w-32"
                  itemClassName="flex items-center gap-2"
                  borderRadiusClass="rounded-r-lg"
                />
              </div>
            </InputField>

            <InputField id="frequency" label="Frequency" description="How often to send." Icon={Repeat}>
              <CustomSelect
                options={frequencies}
                value={formData.frequency}
                onChange={(value) => handleInputChange("frequency", value)}
              />
            </InputField>

            <InputField id="startDate" label="Start Date" description="When the first payment is due." Icon={Calendar}>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
              />
            </InputField>
          </div>

          <InputField
            id="recipient"
            label="Recipient"
            description="The wallet address or ENS name."
            Icon={Wallet}
            error={errors.recipient}
          >
            <input
              id="recipient"
              type="text"
              placeholder="0x... or vitalik.eth"
              value={formData.recipient}
              onChange={(e) => handleInputChange("recipient", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errors.recipient ? "border-destructive" : "border-border"
              }`}
            />
          </InputField>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/30 border border-border/50 rounded-xl p-6 mt-8"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Payment Summary</h3>
            <div className="flex justify-around items-center text-center">
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {formData.recipientType === "USDC" ? "$" : "₦"}
                  {formData.amount || "0.00"}
                </p>
              </div>
              <div className="text-muted-foreground text-2xl">
                <ArrowRight />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">Recipient</p>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <p className="font-semibold text-foreground truncate max-w-[120px]">
                    {formData.recipient || "..."}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground text-2xl">
                <Repeat />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-semibold text-foreground capitalize">{formData.frequency}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-4 pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors font-medium"
            >
              <X className="w-5 h-5" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/20"
            >
              {agent ? "Update Agent" : "Create Agent"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
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
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Confirm Your Agent</h3>
                <p className="text-muted-foreground mt-2">
                  Please review the details below before confirming the agent setup.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 my-6 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Agent Name:</span>
                  <span className="font-semibold text-foreground">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-semibold text-foreground">
                    {formData.recipientType === "USDC" ? "$" : "₦"} {formData.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-semibold text-foreground truncate max-w-[180px]">
                    {formData.recipient}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-semibold text-foreground capitalize">{formData.frequency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">First Payment:</span>
                  <span className="font-semibold text-foreground">{formData.startDate}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
                >
                  <Check className="w-4 h-4" />
                  Activate
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
