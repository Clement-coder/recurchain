"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

interface BeneficiaryFormProps {
  banks: { id: string; name: string; code: string }[];
  onSubmit: (data: {
    bank_code: string;
    account_number: string;
    account_name: string;
  }) => Promise<any>;
  onCancel: () => void;
}

export default function BeneficiaryForm({
  banks,
  onSubmit,
  onCancel,
}: BeneficiaryFormProps) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveAccount = async () => {
      if (accountNumber.length >= 10 && bankCode) {
        setIsResolving(true);
        setError(null);
        try {
          const res = await fetch("/api/offramp/resolve-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to resolve account.");
          }
          const result = await res.json();
          setAccountName(result.data.account_name);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsResolving(false);
        }
      }
    };
    resolveAccount();
  }, [accountNumber, bankCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode || !accountNumber || !accountName) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h4 className="text-lg font-semibold text-foreground mb-4">
        Add New Beneficiary
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bank" className="text-sm text-muted-foreground">
            Bank
          </label>
          <select
            id="bank"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select a bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="account-number"
            className="text-sm text-muted-foreground"
          >
            Account Number
          </label>
          <input
            id="account-number"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter account number"
            className="w-full mt-1 px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label
            htmlFor="account-name"
            className="text-sm text-muted-foreground"
          >
            Account Name
          </label>
          <div className="relative">
            <input
              id="account-name"
              type="text"
              value={accountName}
              disabled
              placeholder="Account name will be resolved automatically"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {isResolving && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader size={16} className="animate-spin" />
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3 pt-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || isResolving || !accountName}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Beneficiary"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
