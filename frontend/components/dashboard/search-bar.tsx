"use client"

import { motion } from "framer-motion"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
      <input
        type="text"
        placeholder="Search agents, recipients, or transaction type..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
    </motion.div>
  )
}
