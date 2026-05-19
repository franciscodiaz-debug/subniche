"use client"

import type { LucideIcon } from "lucide-react"
import type { ChangeEvent, ReactNode } from "react"
import { useRef, useState } from "react"
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Camera,
  Eye,
  Globe,
  Info,
  Lock,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/current-user"
import type {
  ProfileLinkedAccountReference,
  ProfileSummaryReference,
  ProfileVerificationReference,
} from "@/lib/profile-page-types"

interface ProfileEditViewProps {
  profile: ProfileSummaryReference
  onSave: (next: ProfileSummaryReference) => void
  onBack: () => void
}

interface AccountSettingsState {
  notificationsEmail: boolean
  notificationsPush: boolean
  privateProfile: boolean
  showActivity: boolean
}

const defaultSettings: AccountSettingsState = {
  notificationsEmail: true,
  notificationsPush: true,
  privateProfile: false,
  showActivity: true,
}

const platformOptions = ["reddit", "ebay", "reverb", "instagram", "discogs", "etsy"] as const

export function ProfileEditView({ profile, onSave, onBack }: ProfileEditViewProps) {
  const [nicheName, setNicheName] = useState(profile.username)
  const [location, setLocation] = useState(profile.location)
  const [bio, setBio] = useState(profile.bio)
  const [showActivityOnPublicProfile, setShowActivityOnPublicProfile] = useState<boolean>(
    profile.showActivityOnPublicProfile ?? true,
  )
  const [linkedAccounts, setLinkedAccounts] = useState<ProfileLinkedAccountReference[]>(
    profile.linkedAccounts,
  )
  const [verification, setVerification] = useState<ProfileVerificationReference>(
    profile.verification,
  )
  const [settings, setSettings] = useState<AccountSettingsState>(defaultSettings)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newPlatform, setNewPlatform] = useState<string>(platformOptions[0])
  const [newAccountUsername, setNewAccountUsername] = useState("")
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(profile.avatarUrl)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const avatarLabel = (nicheName.slice(0, 2) || profile.avatarLabel).toUpperCase()
  const isDirty =
    nicheName !== profile.username ||
    location !== profile.location ||
    bio !== profile.bio ||
    showActivityOnPublicProfile !== (profile.showActivityOnPublicProfile ?? true) ||
    JSON.stringify(linkedAccounts) !== JSON.stringify(profile.linkedAccounts) ||
    JSON.stringify(verification) !== JSON.stringify(profile.verification)

  const handleSave = () => {
    onSave({
      ...profile,
      username: nicheName.trim() || profile.username,
      location,
      bio,
      avatarLabel,
      avatarUrl: avatarPreviewUrl,
      linkedAccounts,
      verification,
      showActivityOnPublicProfile,
    })
  }

  const handleBack = () => {
    if (isDirty) {
      const proceed =
        typeof window === "undefined"
          ? true
          : window.confirm("Discard unsaved changes and return to your profile?")
      if (!proceed) return
    }
    onBack()
  }

  const toggleLinkedVerified = (index: number) => {
    setLinkedAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, verified: !a.verified } : a)),
    )
  }

  const removeLinkedAccount = (index: number) => {
    setLinkedAccounts((prev) => prev.filter((_, i) => i !== index))
  }

  const addLinkedAccount = () => {
    const handle = newAccountUsername.trim()
    if (!handle) return
    setLinkedAccounts((prev) => [...prev, { platform: newPlatform, username: handle, verified: false }])
    setNewAccountUsername("")
    setShowAddAccount(false)
  }

  const openAvatarDialog = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreviewUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="@container">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur @md:px-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Back to profile</span>
        </button>
        <Button type="button" size="sm" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <div className="px-4 py-6 @md:px-6 @lg:px-8">
        {/* Avatar */}
        <section className="mb-2 flex flex-col items-start gap-4 @sm:flex-row @sm:items-center">
          <div className="relative">
            <button
              type="button"
              onClick={openAvatarDialog}
              className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Change profile photo"
            >
              <Avatar className="h-20 w-20 border-4 border-card @sm:h-24 @sm:w-24">
                {avatarPreviewUrl ? (
                  <AvatarImage
                    src={avatarPreviewUrl}
                    alt={`${nicheName} avatar`}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-secondary text-xl font-semibold text-foreground @sm:text-2xl">
                  {avatarLabel}
                </AvatarFallback>
              </Avatar>
            </button>
            <button
              type="button"
              onClick={openAvatarDialog}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarFileChange}
              aria-label="Upload profile photo"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Profile photo</p>
            <p className="text-xs text-muted-foreground">
              Upload an image to represent this niche profile.
            </p>
          </div>
        </section>

        <Divider />

        <EditSection title="Profile Info" description="Visible on this niche profile.">
          <div className="grid gap-4 @lg:grid-cols-2">
            <EditField label="Niche name" htmlFor="edit-niche-name">
              <Input
                id="edit-niche-name"
                value={nicheName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNicheName(e.target.value)}
                placeholder="e.g. guitar_collector"
                className="bg-card"
              />
              <FieldHint>Per-niche display name. Each of your niches can use a different one.</FieldHint>
            </EditField>
            <EditField label="Username" htmlFor="edit-username">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="edit-username"
                    type="button"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md py-2 pr-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`@${currentUser.username}. Show username details.`}
                  >
                    <span>@{currentUser.username}</span>
                    <Info className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" side="top" className="w-72 text-xs leading-relaxed">
                  Your username is shared across all your niches. This cannot be changed.
                </PopoverContent>
              </Popover>
            </EditField>
          </div>
          <EditField label="Bio" htmlFor="edit-bio">
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell people what this niche is about."
              className="bg-card"
            />
          </EditField>
          <EditField label="Location" htmlFor="edit-location">
            <Input
              id="edit-location"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="bg-card"
            />
          </EditField>
        </EditSection>

        <Divider />

        <EditSection
          title="Linked Accounts"
          description="Connect external profiles to add credibility to your trades."
          action={
            <Button
              type="button"
              variant="quiet_outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowAddAccount((v) => !v)}
              aria-expanded={showAddAccount}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          }
        >
          {linkedAccounts.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
              No linked accounts yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-card/40">
              {linkedAccounts.map((account, index) => (
                <li
                  key={`${account.platform}-${account.username}-${index}`}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize text-foreground">
                      {account.platform}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">@{account.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLinkedVerified(index)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
                      account.verified
                        ? "bg-secondary text-secondary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={account.verified}
                  >
                    <BadgeCheck className="h-3 w-3" aria-hidden />
                    {account.verified ? "Verified" : "Unverified"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLinkedAccount(index)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label={`Remove ${account.platform} account`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showAddAccount ? (
            <div className="rounded-md border border-border bg-card/60 p-3">
              <div className="grid gap-3 @sm:grid-cols-[160px_1fr_auto] @sm:items-end">
                <EditField label="Platform" htmlFor="add-platform" compact>
                  <select
                    id="add-platform"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm capitalize text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {platformOptions.map((p) => (
                      <option key={p} value={p} className="capitalize">
                        {p}
                      </option>
                    ))}
                  </select>
                </EditField>
                <EditField label="Username" htmlFor="add-username" compact>
                  <Input
                    id="add-username"
                    value={newAccountUsername}
                    onChange={(e) => setNewAccountUsername(e.target.value)}
                    placeholder="username"
                    className="bg-card"
                  />
                </EditField>
                <div className="flex gap-2 @sm:pb-0.5">
                  <Button
                    type="button"
                    variant="quiet_outline"
                    size="sm"
                    onClick={() => {
                      setShowAddAccount(false)
                      setNewAccountUsername("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={addLinkedAccount}>
                    Link
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </EditSection>

        <Divider />

        <EditSection
          title="Verified Badges"
          description="Trust signals shown next to your name across the marketplace."
        >
          <div className="space-y-2">
            <VerificationRow
              icon={Mail}
              label="Email"
              description="Confirms ownership of your contact email."
              active={verification.email}
              onToggle={() => setVerification((prev) => ({ ...prev, email: !prev.email }))}
            />
            <VerificationRow
              icon={Phone}
              label="Phone"
              description="SMS verification helps protect against fraud."
              active={verification.phone}
              onToggle={() => setVerification((prev) => ({ ...prev, phone: !prev.phone }))}
            />
            <VerificationRow
              icon={ShieldCheck}
              label="Government ID"
              description="Higher trust tier for high-value trades."
              active={verification.id}
              onToggle={() => setVerification((prev) => ({ ...prev, id: !prev.id }))}
            />
          </div>
        </EditSection>

        <Divider />

        <section id="settings-section" className="py-5 opacity-95">
          <div className="mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
              Settings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Notification and privacy preferences for this account.
            </p>
          </div>
          <div className="space-y-2">
            <SettingRow
              icon={Bell}
              label="Email notifications"
              description="Offers, messages, and trade activity."
              active={settings.notificationsEmail}
              onToggle={() =>
                setSettings((prev) => ({ ...prev, notificationsEmail: !prev.notificationsEmail }))
              }
            />
            <SettingRow
              icon={Bell}
              label="Push notifications"
              description="Real-time alerts on this device."
              active={settings.notificationsPush}
              onToggle={() =>
                setSettings((prev) => ({ ...prev, notificationsPush: !prev.notificationsPush }))
              }
            />
            <SettingRow
              icon={Lock}
              label="Private profile"
              description="Only people you approve can follow you."
              active={settings.privateProfile}
              onToggle={() =>
                setSettings((prev) => ({ ...prev, privateProfile: !prev.privateProfile }))
              }
            />
            <SettingRow
              icon={Eye}
              label="Show activity feed"
              description="Display your recent listings, trades, and collection actions on your public profile."
              active={showActivityOnPublicProfile}
              onToggle={() => setShowActivityOnPublicProfile((v) => !v)}
            />
            <SettingRow
              icon={Globe}
              label="Manage niches"
              description="Create, rename, or remove niche profiles."
              active={false}
              disabled
              hint="Coming soon"
              onToggle={() => {}}
            />
          </div>
        </section>
        <div className="h-8" />
      </div>
    </div>
  )
}

function EditSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="py-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground/80">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex-shrink-0">{action}</div> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Divider() {
  return <div className="border-t border-border" aria-hidden />
}

function EditField({
  label,
  htmlFor,
  children,
  compact,
}: {
  label: string
  htmlFor: string
  children: ReactNode
  compact?: boolean
}) {
  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

function FieldHint({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      {Icon ? <Icon className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden /> : null}
      <span>{children}</span>
    </p>
  )
}

function VerificationRow({
  icon: Icon,
  label,
  description,
  active,
  onToggle,
}: {
  icon: LucideIcon
  label: string
  description: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2.5">
      <span
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md",
          active ? "bg-secondary text-secondary-foreground" : "bg-card text-muted-foreground",
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {label}
          {active ? <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden /> : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <Toggle active={active} onToggle={onToggle} label={label} />
    </div>
  )
}

function SettingRow({
  icon: Icon,
  label,
  description,
  active,
  onToggle,
  disabled,
  hint,
}: {
  icon: LucideIcon
  label: string
  description: string
  active: boolean
  onToggle: () => void
  disabled?: boolean
  hint?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border/60 bg-card/30 px-3 py-2.5",
        disabled && "opacity-60",
      )}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-card text-muted-foreground"
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="truncate text-xs text-muted-foreground">
          {hint ? <span className="font-medium text-foreground/70">{hint} · </span> : null}
          {description}
        </p>
      </div>
      <Toggle active={active} onToggle={onToggle} label={label} disabled={disabled} />
    </div>
  )
}

function Toggle({
  active,
  onToggle,
  label,
  disabled,
}: {
  active: boolean
  onToggle: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors",
        active ? "bg-primary" : "bg-secondary",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform",
          active ? "translate-x-[18px]" : "translate-x-0.5",
        )}
        aria-hidden
      />
    </button>
  )
}
