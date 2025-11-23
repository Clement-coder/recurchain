"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Landmark, Wand2, Copy, Inbox } from "lucide-react";
import { Transaction } from "@/types";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WalletHeader from "@/components/wallet/wallet-header";
import WalletActions from "@/components/wallet/wallet-actions";
import TransactionHistory from "@/components/wallet/transaction-history";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { convertEthToUsd, formatUsd, formatEth } from "@/utils/currency"; // Import utility functions

export default function WalletPage() {
  const { user, ready: privyReady, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const [balance, setBalance] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethToUsdRate, setEthToUsdRate] = useState<number | null>(null); // New state for ETH to USD rate
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [filterType, setFilterType] = useState<"all" | string>("all");

  const filteredTransactions = transactions.filter((tx) => {
    if (filterStatus !== "all" && tx.status !== filterStatus) return false;
    if (filterType !== "all" && tx.type !== filterType) return false;
    return true;
  });

  // Effect: Fetch ETH to USD conversion rate
  useEffect(() => {
    const fetchEthToUsdRate = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await response.json();
        if (data.ethereum && data.ethereum.usd) {
          setEthToUsdRate(data.ethereum.usd);
        } else {
          console.error("Failed to fetch ETH to USD rate: Invalid response", data);
        }
      } catch (error) {
        console.error("Failed to fetch ETH to USD rate:", error);
      }
    };

    fetchEthToUsdRate();
  }, []); // Run once on component mount

  const fetchBalance = async () => {
    if (!walletsReady || !authenticated) return;
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (!embedded) return;

    setIsRefreshing(true);
    try {
      const provider = await embedded.getEthereumProvider();
      const etherProvider = new ethers.BrowserProvider(provider);
      const bal = await etherProvider.getBalance(embedded.address);
      const formatted = parseFloat(ethers.formatEther(bal));
      setBalance(formatted);
    } catch (err) {
      console.error("Error fetching balance", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Effect: find embedded wallet + fetch balance
  useEffect(() => {
    if (!privyReady || !walletsReady || !authenticated) {
      return;
    }

    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (!embedded) {
      console.warn("No embedded privy wallet found");
      return;
    }

    setWalletAddress(embedded.address);
    fetchBalance();
  }, [privyReady, walletsReady, authenticated, wallets]); // Added transactions as a dependency

  // Effect: Fetch transaction history
  useEffect(() => {
    if (!walletAddress) return;

    const fetchTransactions = async () => {
      try {
        // Using a placeholder API key for now. In a real app, this should be secured.
        const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";
        const url = `https://api.routescan.io/v2/network/testnet/evm/84532/etherscan/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "1" && Array.isArray(data.result)) {
          const fetchedTransactions: Transaction[] = data.result.map((tx: any) => {
            const isExpense = tx.from.toLowerCase() === walletAddress.toLowerCase();
            const timestamp = parseInt(tx.timeStamp) * 1000; // Convert to milliseconds
            const date = new Date(timestamp);

            return {
              id: tx.hash,
              type: isExpense ? "expense" : "income",
              agent: isExpense ? tx.to : tx.from, // Simplified: recipient/sender as agent
              amount: parseFloat(ethers.formatEther(tx.value)),
              currency: "ETH", // Assuming ETH for now
              status: tx.isError === "0" ? "success" : "failed",
              date: date.toLocaleDateString(),
              time: date.toLocaleTimeString(),
              recipient: isExpense ? tx.to : tx.from,
              txHash: tx.hash,
            };
          });
          setTransactions(fetchedTransactions);
        } else {
          console.error("Error fetching transactions:", data.message);
          setTransactions([]); // Clear transactions on error
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]); // Clear transactions on error
      }
    };

    fetchTransactions();
  }, [walletAddress]); // Re-run when walletAddress changes

  if (!privyReady || !walletsReady) {
    return <div className="text-5xl text-center item-center justify-center">Loading wallet info…</div>;
  }

  if (!authenticated) {
    return <div>Please log in to see your wallet.</div>;
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40 p-6"
        >
          <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        </motion.div>

        <div className="p-6 space-y-6">
          <WalletHeader
            balance={balance}
            walletAddress={walletAddress}
            ethToUsdRate={ethToUsdRate}
            onRefresh={fetchBalance}
            isRefreshing={isRefreshing}
          />
          <WalletActions
            onDeposit={() => setShowDepositModal(true)}
            onWithdraw={() => setShowWithdrawModal(true)}
          />
          {transactions.length > 0 ? (
            <TransactionHistory
              transactions={filteredTransactions}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              ethToUsdRate={ethToUsdRate} // Pass ethToUsdRate
            />
          ) : (
            <div className="relative text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="relative">
                <div className="flex justify-center">
                  <Inbox className="w-16 h-16" />
                </div>
                <p className="mt-4 text-lg">No transactions found.</p>
                <p className="text-sm">
                  Your recent transactions will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {showDepositModal && (
          <DepositModal
            walletAddress={walletAddress}
            onClose={() => setShowDepositModal(false)}
          />
        )}
        {showWithdrawModal && (
          <WithdrawModal
            onClose={() => setShowWithdrawModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

import QRCode from "react-qr-code"; // Import QRCode

// ... (rest of the file)

function DepositModal({
  onClose,
  walletAddress,
}: {
  onClose: () => void;
  walletAddress: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Deposit Funds
        </h3>
        <div className="space-y-4">
          <div className="text-center bg-secondary p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your Wallet Address
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-lg font-mono text-foreground truncate">
                {walletAddress}
              </p>
              <button onClick={handleCopy} className="p-1 text-foreground">
                {copied ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    ✓
                  </motion.div>
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>

          {walletAddress && (
            <div className="flex justify-center p-4 bg-background rounded-lg">
              <QRCode value={walletAddress} size={180} level="H" />
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to deposit funds to your wallet.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WithdrawModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-lg p-6 max-w-sm w-full text-center"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Withdraw Funds
        </h3>
        <div className="space-y-4">
          <Wand2 size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-foreground">
            Withdrawal functionality is coming soon!
          </p>
          <p className="text-sm text-muted-foreground">
            We're working hard to bring you this feature. Please check back later.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
