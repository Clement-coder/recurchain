'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SignUpButton } from "../ui/SignUpButton"; // updated import path
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  // Listen for authentication changes
  useEffect(() => {
    if (authenticated) {
      // When user is authenticated, show success + redirect
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [authenticated, router]);

  const handleSignUp = async () => {
    if (!ready) return;

    setIsLoading(true);
    try {
      // Using Privy login flow
      await usePrivy().login();
      // The effect above will handle UI / redirect after login
    } catch (err) {
      console.error("Error during sign-up / login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div whileHover={{ scale: 0.99 }} whileTap={{ scale: 0.97 }}>
        <SignUpButton />
      </motion.div>

      {isLoading && (
        <p className="text-center text-sm">Logging you in...</p>
      )}

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-lg p-6 text-center max-w-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
              className="text-4xl mb-4"
            >
              ✓
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Account Created
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Redirecting to dashboard...
            </p>
          </motion.div>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        By signing up, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
