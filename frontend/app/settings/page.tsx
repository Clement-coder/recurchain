"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardLayout from "@/components/layout/dashboard-layout"
import SettingsSection from "@/components/settings/settings-section"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    profile: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex@example.com",
      phone: "+234 701 234 5678",
    },
    bank: {
      bankName: "Bank of Lagos",
      accountName: "Alex Johnson",
      accountNumber: "1234567890",
      accountType: "savings",
    },
    notifications: {
      emailOnSuccess: true,
      emailOnFailure: true,
      emailOnReminder: true,
      smsAlerts: false,
      pushNotifications: true,
      lowBalanceThreshold: 100,
    },
    security: {
      twoFactorAuth: false,
      biometricAuth: true,
      sessionTimeout: 30,
    },
    privacy: {
      dataCollection: true,
      analyticsTracking: true,
      showBalance: true,
    },
  })

  const [editingSection, setEditingSection] = useState<keyof typeof settings | null>(null)
  const [showSaveMessage, setShowSaveMessage] = useState(false)
  const [tempSettings, setTempSettings] = useState<typeof settings | null>(null)

  type SettingsSectionType = keyof typeof settings

  const handleEdit = (section: SettingsSectionType) => {
    setTempSettings(JSON.parse(JSON.stringify(settings)))
    setEditingSection(section)
  }

  const handleSave = (section: SettingsSectionType, updatedData: any) => {
    setSettings({
      ...settings,
      [section]: updatedData,
    })
    setEditingSection(null)
    setShowSaveMessage(true)
    setTimeout(() => setShowSaveMessage(false), 2000)
  }

  const handleCancel = () => {
    setEditingSection(null)
    setTempSettings(null)
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40 p-6"
        >
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and security</p>
        </motion.div>

        <div className="p-6 max-w-4xl space-y-6">
          <AnimatePresence>
            {showSaveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-primary/20 border border-primary rounded-lg p-4 text-primary text-sm font-medium flex items-center gap-2"
              >
                ✓ Settings saved successfully
              </motion.div>
            )}
          </AnimatePresence>

          <SettingsSection
            title="Profile Information"
            description="Update your personal details"
            isEditing={editingSection === "profile"}
            onEdit={() => handleEdit("profile")}
            onSave={(data) => handleSave("profile", data)}
            onCancel={handleCancel}
          >
            {editingSection !== "profile" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">First Name</p>
                    <p className="font-semibold text-foreground">{settings.profile.firstName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Name</p>
                    <p className="font-semibold text-foreground">{settings.profile.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{settings.profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{settings.profile.phone}</p>
                  </div>
                </div>
              </div>
            ) : editingSection === "profile" && tempSettings ? (
              <ProfileForm
                data={tempSettings.profile}
                onChange={(field, value) => {
                  setTempSettings({
                    ...tempSettings,
                    profile: { ...tempSettings.profile, [field]: value },
                  })
                }}
                onSave={() => handleSave("profile", tempSettings.profile)}
              />
            ) : null}
          </SettingsSection>

          <SettingsSection
            title="Bank Account"
            description="Manage your bank details for Naira payouts"
            isEditing={editingSection === "bank"}
            onEdit={() => handleEdit("bank")}
            onSave={(data) => handleSave("bank", data)}
            onCancel={handleCancel}
          >
            {editingSection !== "bank" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Bank Name</p>
                    <p className="font-semibold text-foreground">{settings.bank.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Type</p>
                    <p className="font-semibold text-foreground capitalize">{settings.bank.accountType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Name</p>
                    <p className="font-semibold text-foreground">{settings.bank.accountName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    <p className="font-semibold text-foreground">{settings.bank.accountNumber}</p>
                  </div>
                </div>
              </div>
            ) : editingSection === "bank" && tempSettings ? (
              <BankForm
                data={tempSettings.bank}
                onChange={(field, value) => {
                  setTempSettings({
                    ...tempSettings,
                    bank: { ...tempSettings.bank, [field]: value },
                  })
                }}
                onSave={() => handleSave("bank", tempSettings.bank)}
              />
            ) : null}
          </SettingsSection>

          <SettingsSection
            title="Notification Preferences"
            description="Control how and when you receive alerts"
            isEditing={editingSection === "notifications"}
            onEdit={() => handleEdit("notifications")}
            onSave={(data) => handleSave("notifications", data)}
            onCancel={handleCancel}
          >
            {editingSection !== "notifications" ? (
              <NotificationDisplay notifications={settings.notifications} />
            ) : editingSection === "notifications" && tempSettings ? (
              <NotificationForm
                data={tempSettings.notifications}
                onChange={(field, value) => {
                  setTempSettings({
                    ...tempSettings,
                    notifications: { ...tempSettings.notifications, [field]: value },
                  })
                }}
                onSave={() => handleSave("notifications", tempSettings.notifications)}
              />
            ) : null}
          </SettingsSection>

          <SettingsSection
            title="Security"
            description="Protect your account with additional security options"
            isEditing={editingSection === "security"}
            onEdit={() => handleEdit("security")}
            onSave={(data) => handleSave("security", data)}
            onCancel={handleCancel}
          >
            {editingSection !== "security" ? (
              <SecurityDisplay security={settings.security} />
            ) : editingSection === "security" && tempSettings ? (
              <SecurityForm
                data={tempSettings.security}
                onChange={(field, value) => {
                  setTempSettings({
                    ...tempSettings,
                    security: { ...tempSettings.security, [field]: value },
                  })
                }}
                onSave={() => handleSave("security", tempSettings.security)}
              />
            ) : null}
          </SettingsSection>

          <SettingsSection
            title="Privacy & Data"
            description="Manage your privacy preferences"
            isEditing={editingSection === "privacy"}
            onEdit={() => handleEdit("privacy")}
            onSave={(data) => handleSave("privacy", data)}
            onCancel={handleCancel}
          >
            {editingSection !== "privacy" ? (
              <PrivacyDisplay privacy={settings.privacy} />
            ) : editingSection === "privacy" && tempSettings ? (
              <PrivacyForm
                data={tempSettings.privacy}
                onChange={(field, value) => {
                  setTempSettings({
                    ...tempSettings,
                    privacy: { ...tempSettings.privacy, [field]: value },
                  })
                }}
                onSave={() => handleSave("privacy", tempSettings.privacy)}
              />
            ) : null}
          </SettingsSection>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ProfileForm({
  data,
  onChange,
  onSave,
}: {
  data: any
  onChange: (field: string, value: string) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
        <input
          type="text"
          value={data.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
        <input
          type="text"
          value={data.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <button
        onClick={onSave}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Save Changes
      </button>
    </div>
  )
}

function BankForm({
  data,
  onChange,
  onSave,
}: {
  data: any
  onChange: (field: string, value: string) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
        <input
          type="text"
          value={data.bankName}
          onChange={(e) => onChange("bankName", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Account Name</label>
        <input
          type="text"
          value={data.accountName}
          onChange={(e) => onChange("accountName", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
        <input
          type="text"
          value={data.accountNumber}
          onChange={(e) => onChange("accountNumber", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Account Type</label>
        <select
          value={data.accountType}
          onChange={(e) => onChange("accountType", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>
      <button
        onClick={onSave}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Save Changes
      </button>
    </div>
  )
}

function NotificationDisplay({ notifications }: { notifications: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Success notifications</span>
        <span className={notifications.emailOnSuccess ? "text-primary" : "text-muted-foreground"}>
          {notifications.emailOnSuccess ? "✓" : "○"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Failure alerts</span>
        <span className={notifications.emailOnFailure ? "text-primary" : "text-muted-foreground"}>
          {notifications.emailOnFailure ? "✓" : "○"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Payment reminders</span>
        <span className={notifications.emailOnReminder ? "text-primary" : "text-muted-foreground"}>
          {notifications.emailOnReminder ? "✓" : "○"}
        </span>
      </div>
    </div>
  )
}

function NotificationForm({
  data,
  onChange,
  onSave,
}: {
  data: any
  onChange: (field: string, value: boolean | number) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.emailOnSuccess}
            onChange={(e) => onChange("emailOnSuccess", e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Email on successful payment</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.emailOnFailure}
            onChange={(e) => onChange("emailOnFailure", e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Email on payment failure</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.emailOnReminder}
            onChange={(e) => onChange("emailOnReminder", e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Payment reminders</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.smsAlerts}
            onChange={(e) => onChange("smsAlerts", e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">SMS alerts</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.pushNotifications}
            onChange={(e) => onChange("pushNotifications", e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Push notifications</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Low Balance Alert Threshold (USDC)</label>
        <input
          type="number"
          value={data.lowBalanceThreshold}
          onChange={(e) => onChange("lowBalanceThreshold", Number.parseInt(e.target.value))}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <button
        onClick={onSave}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Save Changes
      </button>
    </div>
  )
}

function SecurityDisplay({ security }: { security: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Two-factor authentication</span>
        <span className={security.twoFactorAuth ? "text-primary" : "text-muted-foreground"}>
          {security.twoFactorAuth ? "✓" : "○"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Biometric authentication</span>
        <span className={security.biometricAuth ? "text-primary" : "text-muted-foreground"}>
          {security.biometricAuth ? "✓" : "○"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Session timeout</span>
        <span className="text-sm font-semibold text-foreground">{security.sessionTimeout} minutes</span>
      </div>
    </div>
  )
}

function SecurityForm({
  data,
  onChange,
  onSave,
}: {
  data: any
  onChange: (field: string, value: boolean | number) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.twoFactorAuth}
          onChange={(e) => onChange("twoFactorAuth", e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <span className="text-sm text-foreground">Enable two-factor authentication</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.biometricAuth}
          onChange={(e) => onChange("biometricAuth", e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <span className="text-sm text-foreground">Enable biometric authentication</span>
      </label>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Session Timeout (minutes)</label>
        <input
          type="number"
          value={data.sessionTimeout}
          onChange={(e) => onChange("sessionTimeout", Number.parseInt(e.target.value))}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <button
        onClick={onSave}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Save Changes
      </button>
    </div>
  )
}

function PrivacyDisplay({ privacy }: { privacy: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Allow data collection</span>
        <span className={privacy.dataCollection ? "text-primary" : "text-muted-foreground"}>
          {privacy.dataCollection ? "✓" : "○"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Analytics tracking</span>
        <span className={privacy.analyticsTracking ? "text-primary" : "text-muted-foreground"}>
          {privacy.analyticsTracking ? "✓" : "○"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Public balance</span>
        <span className={privacy.showBalance ? "text-primary" : "text-muted-foreground"}>
          {privacy.showBalance ? "✓" : "○"}
        </span>
      </div>
    </div>
  )
}

function PrivacyForm({
  data,
  onChange,
  onSave,
}: {
  data: any
  onChange: (field: string, value: boolean) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.dataCollection}
          onChange={(e) => onChange("dataCollection", e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <span className="text-sm text-foreground">Allow anonymous data collection for improvement</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.analyticsTracking}
          onChange={(e) => onChange("analyticsTracking", e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <span className="text-sm text-foreground">Enable analytics tracking</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.showBalance}
          onChange={(e) => onChange("showBalance", e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <span className="text-sm text-foreground">Show balance publicly</span>
      </label>
      <button
        onClick={onSave}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Save Changes
      </button>
    </div>
  )
}
