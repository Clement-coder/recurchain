"use client"

import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AgentForm from "@/components/agents/agent-form"

export default function CreateAgentPage() {
  const router = useRouter()

  const handleSaveSuccess = (agentId: bigint) => {
    console.log("Successfully created agent with ID:", agentId)
    // Redirect to the agent's detail page or dashboard
    router.push("/agents")
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        <AgentForm onSaveSuccess={handleSaveSuccess} onCancel={handleCancel} agent={undefined} />
      </div>
    </DashboardLayout>
  )
}