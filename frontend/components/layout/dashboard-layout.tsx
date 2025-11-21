"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, Settings, Wallet, BookOpen, Bell, LogOut, ChevronLeft, ChevronRight, Zap } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Agents", href: "/agents", icon: Settings },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "History", href: "/history", icon: BookOpen },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("recurchain_session")
    window.location.href = "/"
  }

  return (
    <div className="flex h-screen bg-background">
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-sidebar border-r border-sidebar-border flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <motion.div animate={{ scale: sidebarOpen ? 1 : 0.8 }} className="text-2xl font-bold text-sidebar-primary">
            {sidebarOpen ? "RC" : <Zap className="w-6 h-6" />}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const IconComponent = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors relative ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                  }`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  {isActive && sidebarOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 w-1 h-8 bg-sidebar-accent rounded-l"
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/20 text-sm transition-colors flex items-center justify-center"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-destructive/20 text-sm transition-colors text-destructive flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
