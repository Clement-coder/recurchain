"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, X, Loader, ShieldCheck, AlertTriangle } from "lucide-react";

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

export default function OffRampModal({
  onClose,
  onInitiate,
  walletId,
}: OffRampModalProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "confirm" | "success" | "error">(
    "input"
  );
  const [resultMessage, setResultMessage] = useState("");

  const handleReview = () => {
    if (!amount || !beneficiaryId) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setIsInitiating(true);
    try {
      const result = await onInitiate(walletId, parseFloat(amount), currency, beneficiaryId);
      setResultMessage(result.message);
      setStep(result.success ? "success" : "error");
    } catch (err: any) {
      setResultMessage(err.message || "An error occurred.");
      setStep("error");
    } finally {
      setIsInitiating(false);
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
        {step === "input" && (
          <>
            <h3 className="text-2xl font-bold text-foreground text-center mb-2">
              Off-Ramp to Bank
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Transfer funds from your wallet to your bank account.
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
              <div>
                <label
                  htmlFor="beneficiary-id"
                  className="text-sm text-muted-foreground"
                >
                  Beneficiary ID
                </label>
                <input
                  id="beneficiary-id"
                  type="text"
                  value={beneficiaryId}
                  onChange={(e) => setBeneficiaryId(e.target.value)}
                  placeholder="Enter your beneficiary ID"
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Cancel
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
        )}

        {step === "confirm" && (
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
                <span className="text-muted-foreground">Beneficiary ID:</span>
                <span className="font-semibold text-foreground">
                  {beneficiaryId}
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
        )}

        {step === "success" && (
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
        )}

        {step === "error" && (
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
        )}
      </motion.div>
    </motion.div>
  );
}