"use client";

import { useState, useEffect, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AgentGrid from "@/components/dashboard/agent-grid";
import NotificationsPanel from "@/components/dashboard/notifications-panel";
import SearchBar from "@/components/dashboard/search-bar";
import { Agent, agentIcons, AgentType } from "@/types";
import { useWallets } from "@privy-io/react-auth";
import { contractAddresses } from "@/constants/contracts";
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { RecurchainABI } from '@/constants/RecurChainAgentABI';
import { formatUnits } from 'viem';
import { agentTypes, frequencies } from '@/components/agents/agent-form';

export default function DashboardPage() {
  const { user, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const activeWallet = wallets[0];
  const contractAddress = activeWallet ? contractAddresses[activeWallet.chainId] : undefined;

  const { data: agentIds, isLoading: isLoadingAgentIds, refetch: refetchAgentIds } = useReadContract({
    address: contractAddress,
    abi: RecurchainABI,
    functionName: 'getUserAgents',
    args: [user?.wallet?.address!],
    // @ts-ignore
    enabled: !!user?.wallet?.address && !!contractAddress,
  });

  const agentContracts = useMemo(() => {
    if (!agentIds || !contractAddress) return [];
    // @ts-ignore
    return (agentIds as bigint[]).map(id => ({
      address: contractAddress,
      abi: RecurchainABI,
      functionName: 'getAgent',
      args: [id],
    }));
  }, [agentIds, contractAddress]);

  const { data: agentsData, isLoading: isLoadingAgents, refetch: refetchAgentsData } = useReadContracts({
    // @ts-ignore
    contracts: agentContracts,
    query: {
        // @ts-ignore
      enabled: agentContracts.length > 0,
    }
  });

  const { data: txHash, writeContract, isPending: isWriteLoading, error: writeError } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess(data) {
      refetchAgentIds();
      refetchAgentsData();
    },
  });

  useEffect(() => {
    if (agentsData && agentIds) {
      const formattedAgents = (agentsData as any[])
        .map((data, index) => {
          if (!data.result) return null;
          const [
            owner,
            name,
            agentType, // number
            description,
            recipient,
            amount, // bigint
            frequency, // number
            startDate, // bigint
            nextExecutionTime, // bigint
            isActive, // boolean
            // ... other fields
          ] = data.result;

          const agentTypeInfo = agentTypes.find(t => t.enum === agentType);
          const frequencyInfo = frequencies.find(f => f.enum === frequency);
          const typeName = agentTypeInfo?.value || 'other';

          return {
            id: (agentIds as bigint[])[index].toString(),
            name,
            type: typeName as AgentType,
            status: isActive ? 'active' : 'paused',
            amount: parseFloat(formatUnits(amount, 6)),
            frequency: frequencyInfo?.label || 'Unknown',
            recipient,
            recipientType: 'USDC',
            lastPayment: '', // TODO
            nextRun: new Date(Number(nextExecutionTime) * 1000).toLocaleDateString(),
            icon: agentIcons[typeName as AgentType],
            description,
            startDate: new Date(Number(startDate) * 1000).toLocaleDateString(),
          };
        })
        .filter(Boolean) as Agent[];
      setAgents(formattedAgents);
      setFilteredAgents(formattedAgents);
    }
  }, [agentsData, agentIds]);

  // Compute displayName or email
  const displayName = (() => {
    if (!user) return "";
    // Try Google first
    if (user.google && user.google.name) {
      return user.google.name;
    }
    // Then GitHub
    if (user.github && user.github.name) {
      return user.github.name;
    }
    // Then email (if linked)
    if (user.email && user.email.address) {
      return user.email.address;
    }
    return "";
  })();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredAgents(agents);
      return;
    }
    const filtered = agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.recipient.toLowerCase().includes(query.toLowerCase()) ||
        agent.recipientType.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAgents(filtered);
  };

  const handlePauseResume = (id: string, status: 'active' | 'paused') => {
    const functionName = status === 'active' ? 'pauseAgent' : 'resumeAgent';
    writeContract({
      address: contractAddress,
      abi: RecurchainABI,
      functionName,
      args: [BigInt(id)],
    });
  };

  const handleDeleteAgent = (id: string) => {
    writeContract({
      address: contractAddress,
      abi: RecurchainABI,
      functionName: 'cancelAgent',
      args: [BigInt(id)],
    });
  };

  const isLoading = !ready || isLoadingAgentIds || isLoadingAgents || isWriteLoading || isTxLoading;

  // Require auth to show dashboard
  if (!authenticated && ready) {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-40 p-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {displayName
                    ? `Welcome, ${displayName}`
                    : `Manage ${agents.length} recurring payment agents`}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </motion.button>
            </div>
            <SearchBar value={searchQuery} onChange={handleSearch} />
          </div>
        </motion.div>

        <div className="p-6 space-y-6">
          {/* <invalid-jsx /> */}
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
             < NotificationsPanel />
            </motion.div>
          )}

          <AgentGrid
            agents={filteredAgents}
            onPauseResume={handlePauseResume}
            onDelete={handleDeleteAgent}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
