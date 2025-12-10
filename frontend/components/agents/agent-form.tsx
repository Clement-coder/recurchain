"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
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
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { parseUnits } from "viem"

import { RecurchainABI } from "@/constants/RecurChainAgentABI"
import { contractAddresses } from "@/constants/contracts";
import { Agent, AgentData, AgentType } from "@/types"
import CustomSelect from "@/components/ui/custom-select"

export const agentTypes = [
  { value: "subscription", label: "Subscription", Icon: Music, enum: 0 },
  { value: "salary", label: "Salary", Icon: Briefcase, enum: 1 },
  { value: "rent", label: "Rent", Icon: Home, enum: 2 },
  { value: "loan", label: "Loan", Icon: CreditCard, enum: 3 },
  { value: "insurance", label: "Insurance", Icon: Shield, enum: 4 },
  { value: "other", label: "Other", Icon: Settings, enum: 5 },
]

export const frequencies = [
  { value: "daily", label: "Daily", icon: Repeat, enum: 0 },
  { value: "weekly", label: "Weekly", icon: Repeat, enum: 1 },
  { value: "bi-weekly", label: "Bi-Weekly", icon: Repeat, enum: 2 },
  { value: "monthly", label: "Monthly", icon: Repeat, enum: 3 },
  { value: "quarterly", label: "Quarterly", icon: Repeat, enum: 4 },
  { value: "yearly", label: "Yearly", icon: Repeat, enum: 5 },
]

interface AgentFormProps {
  agent?: Agent | null
  onSaveSuccess: (agentId: bigint) => void
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

export default function AgentForm({ agent, onSaveSuccess, onCancel }: AgentFormProps) {
  const [formData, setFormData] = useState(
    agent || {
      name: "",
      type: "subscription" as AgentType,
      amount: "",
      frequency: "monthly",
      recipient: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
    }
  )

  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  
  const activeWallet = wallets[0];
  const contractAddress = activeWallet ? contractAddresses[activeWallet.chainId] : undefined;

  const embeddedWallet = useMemo(
    () =>
      wallets.find(
        (wallet) =>
          wallet.walletClientType === "privy"
      ),
    [wallets]
  )

  const validationErrors = useMemo(() => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = "A descriptive name is required."
    if (!formData.amount || Number.parseFloat(String(formData.amount)) <= 0) {
      newErrors.amount = "A valid positive amount is required."
    }
    if (!formData.recipient.trim()) {
      newErrors.recipient = "Recipient address is required."
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipient)) {
      newErrors.recipient = "Please enter a valid Ethereum address."
    } else if (formData.recipient.toLowerCase() === '0x0000000000000000000000000000000000000000') {
      newErrors.recipient = "Recipient cannot be the zero address."
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.startDate < today) {
        newErrors.startDate = "Start date cannot be in the past.";
    }

    return newErrors
  }, [formData])

  const formIsValid = Object.keys(validationErrors).length === 0

  const errorsToShow = useMemo(() => {
    const newErrors: { [key: string]: string } = {}
    for (const field in validationErrors) {
        if (touched[field]) {
            newErrors[field] = validationErrors[field as keyof typeof validationErrors];
        }
    }
    return newErrors
  }, [validationErrors, touched])

  const selectedAgentTypeEnum = agentTypes.find(t => t.value === formData.type)?.enum ?? 0
  const selectedFrequencyEnum = frequencies.find(f => f.value === formData.frequency)?.enum ?? 3
  const startDateTimestamp = Math.floor(new Date(formData.startDate).getTime() / 1000)

  const { data: txHash, writeContract, isPending: isWriteLoading, error: writeError, isError: isWriteError } = useWriteContract()

  const { isLoading: isTxLoading, isSuccess, isError: isTxError, error: txError } = useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess(data) {
      if (data.logs[0]?.data) {
        const agentId = BigInt(data.logs[0].data)
        onSaveSuccess(agentId)
      }
    },
  })

  useEffect(() => {
    console.log("--- AgentForm Debug ---");
    console.log("Privy Ready:", ready);
    console.log("Privy Authenticated:", authenticated);
    console.log("Wallets available:", wallets.length);
    console.log("Found Embedded Wallet on Base Sepolia:", !!embeddedWallet);
    console.log("Form is Valid:", formIsValid);
    console.log("Write function available:", !!writeContract);
    console.log("-----------------------");
  }, [ready, authenticated, wallets, embeddedWallet, formIsValid, writeContract]);


  const handleSubmit = () => {
    if (formIsValid && writeContract) {
      writeContract({
        address: contractAddress,
        abi: RecurchainABI,
        functionName: "createAgent",
        args: [
          formData.name,
          selectedAgentTypeEnum,
          formData.description,
          formData.recipient,
          formData.amount ? parseUnits(formData.amount, 6) : BigInt(0),
          selectedFrequencyEnum,
          BigInt(startDateTimestamp),
        ]
      })
    } else {
      const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
      setTouched(allTouched);
    }
  }

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }))
    if (!touched[field]) {
      setTouched((prevTouched) => ({ ...prevTouched, [field]: true }))
    }
  }, [touched])

  const isLoading = isWriteLoading || isTxLoading

  if (!ready) {
    return (
        <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-semibold text-foreground">Initializing...</p>
        </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 sm:p-6 md:p-8 relative">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-xl"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold text-foreground">
                {isWriteLoading ? "Waiting for confirmation..." : "Processing transaction..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Please keep this window open.</p>
              {txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-4"
                >
                  View on Basescan
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!embeddedWallet && (
            <div className="bg-yellow-100/10 border-l-4 border-yellow-500 text-yellow-200 p-4 mb-6 rounded-r-lg" role="alert">
                <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3"/>
                    <div>
                        <p className="font-bold text-yellow-300">Action Required</p>
                        <p className="text-sm">Please connect your Privy embedded wallet and ensure you are on the Base Sepolia network to create an agent.</p>
                    </div>
                </div>
            </div>
        )}

        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
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
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center justify-center aspect-square ${
                      formData.type === type.value
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <IconComponent
                      className={`w-6 h-6 sm:w-7 sm:h-7 mb-2 transition-colors ${
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
              error={errorsToShow.name}
            >
              <input
                id="agentName"
                type="text"
                placeholder="e.g., Netflix Subscription"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                  errorsToShow.name ? "border-destructive" : "border-border"
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
              label="Amount (USD)"
              description="How much to send each time."
              Icon={DollarSign}
              error={errorsToShow.amount}
            >
              <div className="flex items-center border border-border rounded-lg bg-input focus-within:ring-2 focus-within:ring-primary/50">
                <span className="pl-3 text-muted-foreground">$</span>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`flex-1 px-2 py-2.5 bg-transparent text-foreground focus:outline-none rounded-r-lg ${
                    errorsToShow.amount ? "border-destructive" : ""
                  }`}
                />
              </div>
            </InputField>

            <InputField id="frequency" label="Frequency" description="How often to send." Icon={Repeat}>
              <CustomSelect
                options={frequencies}
                value={formData.frequency}
                onChange={(value) => handleInputChange("frequency", value as string)}
              />
            </InputField>

            <InputField id="startDate" label="Start Date" description="When the first payment is due." Icon={Calendar} error={errorsToShow.startDate}>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
              />
            </InputField>
          </div>

          <InputField
            id="recipient"
            label="Recipient"
            description="The wallet address (e.g. 0x...)."
            Icon={Wallet}
            error={errorsToShow.recipient}
          >
            <input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={formData.recipient}
              onChange={(e) => handleInputChange("recipient", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errorsToShow.recipient ? "border-destructive" : "border-border"
              }`}
            />
          </InputField>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/30 border border-border/50 rounded-xl p-6 mt-8"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Payment Summary</h3>
            <div className="flex flex-col sm:flex-row justify-around items-center text-center gap-4 sm:gap-2">
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  ${formData.amount || "0.00"}
                </p>
              </div>
              <div className="text-muted-foreground text-2xl hidden sm:block">
                <ArrowRight />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">Recipient</p>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <p className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-[180px]">
                    {formData.recipient || "..."}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground text-2xl hidden sm:block">
                <Repeat />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-semibold text-foreground capitalize">{formData.frequency}</p>
              </div>
            </div>
          </motion.div>

          {(isTxError || isWriteError) && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-lg p-4 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5"/>
              <div>
                <p className="font-semibold">Transaction Error</p>
                <p className="mt-1">{(txError || writeError)?.message.split(".")[0]}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!formIsValid || !writeContract || isLoading || !embeddedWallet}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{agent ? "Update Agent" : "Create Agent"} <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
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
              className="bg-card border border-border rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Agent Created Successfully!</h3>
              <p className="text-muted-foreground mt-2">
                Your new payment agent is now active and ready to make payments.
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-4 block"
              >
                View Transaction on Basescan
              </a>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="w-full mt-6 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
              >
                Back to Dashboard
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}