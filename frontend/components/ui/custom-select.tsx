"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface Option {
  value: string
  label: string
  icon?: React.ElementType
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  itemClassName?: string
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  itemClassName = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
          isOpen ? "ring-2 ring-primary/50 border-primary" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && <selectedOption.icon className="w-4 h-4 text-muted-foreground" />}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none"
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${
                  option.value === value ? "bg-accent text-accent-foreground font-medium" : "text-foreground"
                } ${itemClassName}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.icon && <option.icon className="w-4 h-4 text-muted-foreground" />}
                {option.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
