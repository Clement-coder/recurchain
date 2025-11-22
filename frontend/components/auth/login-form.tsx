"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { WalletButton } from "../ui/walletButton"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSignUp = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)

      // Store session in local storage
      localStorage.setItem(
        "recurchain_session",
        JSON.stringify({
          user: email || "user@example.com",
          timestamp: new Date().toISOString(),
        }),
      )

      // Redirect to dashboard after 1.5s
      setTimeout(() => {
        window.location.href = "/dashbaord"
      }, 1500)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      <motion.div whileHover={{ scale: 0.99 }} whileTap={{ scale: 0.97 }}>
        <WalletButton/>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="rounded-md border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          onClick={handleSignUp}
        >
          Google
        </Button>
        <Button
          variant="outline"
          className="rounded-md border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          onClick={handleSignUp}
        >
          GitHub
        </Button>
      </div>

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
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6 }} className="text-4xl mb-4">
              ✓
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Account Created</h3>
            <p className="text-muted-foreground text-sm mb-4">Redirecting to dashboard...</p>
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
  )
}
