"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Landmark, X, Loader, ShieldCheck, AlertTriangle, PlusCircle } from "lucide-react";
import BeneficiaryForm from "./BeneficiaryForm";

interface OffRampModalProps {
  onClose: () => void;
  walletId: string;
  onInitiate: (
    walletId: string,
    amount: number,
    currency: string,
    beneficiaryId: string
  ) => Promise<{ success: boolean; message: string }>;
}

interface Beneficiary {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
}

interface Bank {
  id: string;
  name: string;
  code: string;
}

export default function OffRampModal({
  onClose,
  onInitiate,
  walletId,
}: OffRampModalProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false);
  
  const [isInitiating, setIsInitiating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"selectBeneficiary" | "input" | "confirm" | "success" | "error">(
    "selectBeneficiary"
  );
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [banksRes, beneficiariesRes] = await Promise.all([
          fetch("/api/offramp/banks"),
          fetch(`/api/offramp/beneficiaries?wallet_id=${walletId}`),
        ]);

        if (!banksRes.ok || !beneficiariesRes.ok) {
          throw new Error("Failed to fetch initial data.");
        }

        const banksData = await banksRes.json();
        const beneficiariesData = await beneficiariesRes.json();

        setBanks(banksData.data || []);
        setBeneficiaries(beneficiariesData.data || []);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [walletId]);

  const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setStep("input");
  };

  const handleCreateBeneficiary = async (data: {
    bank_code: string;
    account_number: string;
    account_name: string;
  }) => {
    const res = await fetch("/api/offramp/beneficiaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, wallet_id: walletId }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create beneficiary.");
    }
    const newBeneficiary = await res.json();
    setBeneficiaries([...beneficiaries, newBeneficiary.data]);
    setShowBeneficiaryForm(false);
  };

  const handleReview = () => {
    if (!amount || !selectedBeneficiary) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!selectedBeneficiary) return;
    setIsInitiating(true);
    try {
      const result = await onInitiate(walletId, parseFloat(amount), currency, selectedBeneficiary.id);
      setResultMessage(result.message);
      setStep(result.success ? "success" : "error");
    } catch (err: any) {
      setResultMessage(err.message || "An error occurred.");
      setStep("error");
    }
    finally {
      setIsInitiating(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader className="animate-spin text-primary" size={32} />
        </div>
      );
    }

    if (showBeneficiaryForm) {
      return (
        <BeneficiaryForm
          banks={banks}
          onSubmit={handleCreateBeneficiary}
          onCancel={() => setShowBeneficiaryForm(false)}
        />
      );
    }

    switch (step) {
      case "selectBeneficiary":
        return (
          <div>
            <h3 className="text-2xl font-bold text-foreground text-center mb-6">Select Beneficiary</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {beneficiaries.map((b) => (
                <motion.div
                  key={b.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleBeneficiarySelect(b)}
                  className="p-4 rounded-lg border border-border bg-input cursor-pointer"
                >
                  <p className="font-semibold">{b.account_name}</p>
                  <p className="text-sm text-muted-foreground">{b.bank_name} - {b.account_number}</p>
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBeneficiaryForm(true)}
              className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
            >
              <PlusCircle size={16} />
              Add New Beneficiary
            </motion.button>
          </div>
        );
      case "input":
        return (
          <>
            <h3 className="text-2xl font-bold text-foreground text-center mb-2">
              Off-Ramp to Bank
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Transfer funds to {selectedBeneficiary?.account_name}.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="text-sm text-muted-foreground">
                  Amount
                </label>
                <div className="relative mt-1">
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground">$</span>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="currency"
                  className="text-sm text-muted-foreground"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="NGN">NGN (Nigerian Naira)</option>
                </select>
              </div>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("selectBeneficiary")}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReview}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Review
                </motion.button>
              </div>
            </div>
          </>
        );
      case "confirm":
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground">
              Confirm Transfer
            </h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Please review the details below before confirming.
            </p>
            <div className="space-y-4 text-left bg-secondary/30 p-6 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">
                  {amount} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-semibold text-foreground">
                  {selectedBeneficiary?.account_name}
                </span>
              </div>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-semibold text-foreground">
                  {selectedBeneficiary?.bank_name}
                </span>
              </div>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-semibold text-foreground">
                  {selectedBeneficiary?.account_number}
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("input")}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isInitiating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isInitiating ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Initiating...</span>
                  </>
                ) : (
                  "Confirm & Initiate"
                )}
              </motion.button>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 mb-4">
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Success!</h3>
            <p className="text-muted-foreground mt-2">{resultMessage}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-6 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Done
            </motion.button>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Error</h3>
            <p className="text-muted-foreground mt-2">{resultMessage}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-6 w-full px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Close
            </motion.button>
          </div>
        );
    }
  };

  return (
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
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        {renderContent()}
      </motion.div>
    </motion.div>
  );
}