export const agentIcons = {
  subscription: "♫",
  salary: "💼",
  rent: "🏠",
  loan: "💳",
  insurance: "🛡️",
  other: "⚙️",
}

export type AgentType = keyof typeof agentIcons

export interface Agent {
  id: string
  name: string
  icon: string
  amount: number
  frequency: string
  recipient: string
  recipientType: string
  nextRun: string
  status: "active" | "paused"
  startDate: string
  description: string
  type: AgentType
  lastPayment?: string
}

export interface AgentData {
  name: string
  type: AgentType
  amount: number
  frequency: string
  recipient: string
  recipientType: string
  description: string
  startDate: string
  nextRun: string
}

export interface Transaction {
  id: string
  type: "expense" | "income"
  agent: string
  amount: number
  currency: "USDC" | "Naira"
  status: "success" | "pending" | "failed"
  date: string
  time: string
  recipient: string
  txHash?: string
  proof?: string
}
