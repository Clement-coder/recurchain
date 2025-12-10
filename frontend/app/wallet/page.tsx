"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Landmark, Wand2, Copy, Inbox } from "lucide-react";
import { Transaction } from "@/types";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WalletHeader from "@/components/wallet/wallet-header";
import WalletActions from "@/components/wallet/wallet-actions";
import TransactionHistory from "@/components/wallet/transaction-history";
import OffRampModal from "@/components/wallet/OffRampModal";

import NetworkSwitcher from "@/components/ui/NetworkSwitcher";
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
  const [isTransactionsRefreshing, setIsTransactionsRefreshing] =
    useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showOffRampModal, setShowOffRampModal] = useState(false);
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
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        if (data.ethereum && data.ethereum.usd) {
          setEthToUsdRate(data.ethereum.usd);
        } else {
          console.error(
            "Failed to fetch ETH to USD rate: Invalid response",
            data
          );
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

  const fetchTransactions = async () => {
    if (!walletAddress) return;

    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (!embedded) return;
    const activeChain = embedded.supportedChains.find(chain => chain.id === embedded.chainId);
    if(!activeChain) return;

    setIsTransactionsRefreshing(true);
    try {
      // Using a placeholder API key for now. In a real app, this should be secured.
      const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";
      const network_type = activeChain.name.toLowerCase().includes("sepolia") ? "testnet" : "mainnet";
      const url = `https://api.routescan.io/v2/network/${network_type}/evm/${activeChain.id}/etherscan/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "1" && Array.isArray(data.result)) {
        const fetchedTransactions: Transaction[] = data.result.map(
          (tx: any) => {
            const isExpense =
              tx.from.toLowerCase() === walletAddress.toLowerCase();
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
          }
        );
        setTransactions(fetchedTransactions);
      } else {
        console.error("Error fetching transactions:", data.message);
        setTransactions([]); // Clear transactions on error
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]); // Clear transactions on error
    } finally {
      setIsTransactionsRefreshing(false);
    }
  };

  // Effect: Fetch transaction history
  useEffect(() => {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (!embedded || !embedded.supportedChains) return;
    const activeChain = embedded.supportedChains.find(chain => chain.id === embedded.chainId);
    if(!activeChain) return;
    fetchTransactions();
  }, [walletAddress, wallets]); // Re-run when walletAddress or active chain changes

  const handleSend = async (to: string, amount: string) => {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (!embedded) {
      throw new Error("No embedded privy wallet found");
    }

    const provider = await embedded.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const tx = {
      to: to,
      value: ethers.parseEther(amount),
    };

    const txResponse = await signer.sendTransaction(tx);
    await txResponse.wait(); // wait for transaction to be mined

    // Refetch balance and transactions
    await fetchBalance();
    await fetchTransactions();
  };

  const handleInitiateOffRamp = async (
    walletId: string,
    amount: number,
    currency: string,
    beneficiaryId: string
  ) => {
    try {
      const response = await fetch("/api/offramp/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_id: walletId, amount, currency, beneficiary_id: beneficiaryId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Off-ramp initiation failed");
      }

      return { success: true, message: data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "An unknown error occurred.",
      };
    }
  };

  if (!privyReady || !walletsReady) {
    return (
      <div className="text-5xl text-center item-center justify-center">
        Loading wallet info…
      </div>
    );
  }

  if (!authenticated) {
    return <div>Please log in to see your wallet.</div>;
  }

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const activeChain = embeddedWallet?.supportedChains?.find(chain => chain.id === embeddedWallet.chainId);
  const isOffRampDisabled = activeChain?.name.toLowerCase().includes("sepolia");

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40 p-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
            <NetworkSwitcher />
          </div>
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
            onSend={() => setShowSendModal(true)}
            onOffRamp={() => setShowOffRampModal(true)}
            isOffRampDisabled={isOffRampDisabled}
          />
          {transactions.length > 0 ? (
            <TransactionHistory
              transactions={filteredTransactions}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              ethToUsdRate={ethToUsdRate} // Pass ethToUsdRate
              onRefresh={fetchTransactions}
              isRefreshing={isTransactionsRefreshing}
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
        {showSendModal && (
          <SendModal
            onClose={() => setShowSendModal(false)}
            onSend={handleSend}
            ethToUsdRate={ethToUsdRate}
          />
        )}
        {showOffRampModal && user && (
          <OffRampModal
            walletId={user.id}
            onClose={() => setShowOffRampModal(false)}
            onInitiate={handleInitiateOffRamp}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

import QRCode from "react-qr-code"; // Import QRCode
import {
  Loader,
  Wallet,
  ArrowRight,
  User,
  Package,
  DollarSign,
  Coins,
} from "lucide-react";

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

function SendModal({
  onClose,
  onSend,
  ethToUsdRate,
}: {
  onClose: () => void;
  onSend: (to: string, amount: string) => Promise<void>;
  ethToUsdRate: number | null;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "confirm">("input");

  const handleReview = () => {
    if (!to || !amount) {
      setError("Please fill in all fields.");
      return;
    }
    if (!ethers.isAddress(to)) {
      setError("Invalid recipient address.");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setIsSending(true);
    try {
      await onSend(to, amount);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while sending.");
      setStep("input"); // Go back to input screen on error
    } finally {
      setIsSending(false);
    }
  };

  const usdAmount = convertEthToUsd(parseFloat(amount || "0"), ethToUsdRate);

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
        {step === "input" && (
          <>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Send Funds
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="recipient-address"
                  className="text-sm text-muted-foreground"
                >
                  Recipient Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wallet
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>
                  <input
                    id="recipient-address"
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="0x..."
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-input border border-border text-foreground mt-1"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="text-sm text-muted-foreground"
                >
                  Amount (ETH)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Coins size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    id="amount"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.05"
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-input border border-border text-foreground mt-1"
                  />
                </div>
                {usdAmount !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatUsd(usdAmount)}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Confirm Transaction
            </h3>
            <div className="space-y-4 bg-secondary/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <User size={16} className="text-muted-foreground" />
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="text-sm font-mono text-foreground break-all">
                    {to}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-foreground">
                    {amount} ETH
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  {usdAmount !== null && (
                    <p className="text-sm text-muted-foreground">
                      {formatUsd(usdAmount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep("input")}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Confirm & Send"
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}