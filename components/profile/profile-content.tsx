"use client"

import type { ComponentType, ReactNode } from "react"
import { useState } from "react"
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  FolderOpen,
  Heart,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Repeat2,
  Share2,
  ShieldCheck,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/current-user"
import { ownProfile, otherProfile, profilePageData } from "@/lib/profile-page-data"
import type {
  ProfileActivityReference,
  ProfileSummaryReference,
} from "@/lib/profile-page-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CollectionCard } from "@/components/collection-card"
import { ItemCard } from "@/components/item-card"
import { ProfileEditView } from "./profile-edit-view"
import { ProfileMobileSheet } from "./profile-mobile-sheet"
import { ProfileNicheSwitcher } from "./profile-niche-switcher"
import { TradeInterestRow } from "@/components/trade/trade-interest-row"

type ProfileTab = "collections" | "for-sale" | "looking-for" | "activity"
type ProfileViewMode = "own" | "other"

function money(value: number) {
  return `$${value.toLocaleString("en-US")}`
}
function formatMonthYear(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}
function formatActivityTime(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ProfileContent({ initialViewMode = "own" }: { initialViewMode?: ProfileViewMode }) {
  const [ownProfileState, setOwnProfileState] = useState<ProfileSummaryReference>(ownProfile)
  const [otherProfileState] = useState<ProfileSummaryReference>(otherProfile)
  const [activeTab, setActiveTab] = useState<ProfileTab>("collections")
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<ProfileViewMode>(initialViewMode)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  const isOwnProfile = viewMode === "own"
  const profile = isOwnProfile ? ownProfileState : otherProfileState

  if (isEditing) {
    return (
      <ProfileEditView
        profile={profile}
        onBack={() => setIsEditing(false)}
        onSave={(next) => {
          setOwnProfileState(next)
          setIsEditing(false)
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">

      {/* ── Profile header ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex gap-6 md:gap-8">

        {/* Avatar */}
        <Avatar className="h-24 w-24 shrink-0 border-2 border-border md:h-32 md:w-32">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={`${profile.username} avatar`} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-secondary text-lg font-semibold text-foreground">
            {profile.avatarLabel}
          </AvatarFallback>
        </Avatar>

        {/* Info column */}
        <div className="min-w-0 flex-1">

          {/* Username + action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-semibold leading-tight text-foreground">{profile.username}</h1>
              <span className="text-xs text-muted-foreground">@{profile.ownerHandle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isOwnProfile ? (
                <Button
                  variant="quiet_outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? "secondary" : "quiet_outline"}
                  size="sm"
                  onClick={() => setIsFollowing((v) => !v)}
                  aria-pressed={isFollowing}
                  className="gap-1.5"
                >
                  {isFollowing ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
              <Button
                variant="quiet_outline"
                size="icon-sm"
                aria-label="Share profile"
                onClick={() => {
                  if (typeof window === "undefined") return
                  const url = `${window.location.origin}/profile/${profile.username}`
                  if (navigator?.share) {
                    navigator.share({ title: `${profile.username}'s profile`, url }).catch(() => {})
                  } else if (navigator?.clipboard) {
                    navigator.clipboard.writeText(url).catch(() => {})
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <ProfileNicheSwitcher
                username={currentUser.username}
                activeNicheName={profile.username}
                isOwnProfile={isOwnProfile}
              />
            </div>
          </div>

          {/* Location + member since — stays with identity */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {profile.location}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Member since {formatMonthYear(profile.memberSince)}
            </span>
          </div>

          {/* Bio — separate group */}
          {profile.bio ? (
            <div className="mt-4">
              <BioRow bio={profile.bio} />
            </div>
          ) : null}

          {/* Trust signals — verified + linked */}
          <div className="mt-5 space-y-2">
            <VerifiedRow profile={profile} />
            <LinkedRow profile={profile} />
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap items-start gap-x-9 gap-y-3">
            <StatBlock value={profile.stats.totalItems} label="Items" />
            <StatBlock value={profile.stats.totalCollections} label="Collections" />
            <StatBlock value={profile.stats.totalTrades} label="Trades" />
            {isOwnProfile ? (
              <StatBlock value={profile.stats.totalFollowing} label="Following" />
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Tab navigation ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-nowrap items-center gap-8">
          <TabButton active={activeTab === "collections"} onClick={() => setActiveTab("collections")}>
            Collections
          </TabButton>
          <TabButton active={activeTab === "for-sale"} onClick={() => setActiveTab("for-sale")}>
            For Sale/Trade
          </TabButton>
          <TabButton active={activeTab === "looking-for"} onClick={() => setActiveTab("looking-for")}>
            Looking For
          </TabButton>
          <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>
            Activity
          </TabButton>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}

      {activeTab === "collections" && (
        profilePageData.collections.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-10 w-10 text-muted-foreground/50" />}
            title="No collections yet"
            body="Create a collection to start organizing items on this profile."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profilePageData.collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={{
                  id: collection.id,
                  name: collection.name,
                  description: collection.description,
                  visibility: collection.visibility,
                  is_wishlist: collection.isWishlist,
                  item_count: collection.itemCount,
                  total_user_value: collection.totalValue,
                }}
                view="grid"
                itemImages={collection.previewImages}
                href={`/collection/${collection.id}`}
              />
            ))}
          </div>
        )
      )}

      {activeTab === "for-sale" && (
        profilePageData.forSaleItems.length === 0 ? (
          <EmptyState
            icon={<Tag className="h-10 w-10 text-muted-foreground/50" />}
            title="No items for sale"
            body="List an item to show it in the public sale and trade view."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profilePageData.forSaleItems.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                image={item.imageUrl}
                title={item.title}
                subtitle={item.subtitle}
                price={item.price}
                forSale={item.forSale}
                forTrade={item.forTrade}
                href={`/listings/${item.id}`}
              />
            ))}
          </div>
        )
      )}

      {activeTab === "looking-for" && (
        <div>
          <CollapsibleSection
            label={`${profilePageData.tradeInterests.length} trade interests`}
            defaultOpen
          >
            {profilePageData.tradeInterests.length === 0 ? (
              <EmptyState
                icon={<Repeat2 className="h-10 w-10 text-muted-foreground/50" />}
                title="No trade interests yet"
                body="Save a set of trade filters to show collectors what you're open to."
              />
            ) : (
              <div className="divide-y divide-border/60">
                {profilePageData.tradeInterests.map((interest) => (
                  <TradeInterestRow
                    key={interest.id}
                    name={interest.name}
                    description={interest.description}
                    chips={interest.criteria}
                  />
                ))}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            label={`${profilePageData.lookingForItems.length} wishlist items`}
            defaultOpen
          >
            {profilePageData.lookingForItems.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-10 w-10 text-muted-foreground/50" />}
                title="No wishlist items"
                body="Add public wishlist items to show what this profile is looking for."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profilePageData.lookingForItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    image={item.imageUrl}
                    title={item.title}
                    subtitle={item.subtitle}
                    href={`/listings/${item.id}`}
                  />
                ))}
              </div>
            )}
          </CollapsibleSection>
        </div>
      )}

      {activeTab === "activity" && (
        profilePageData.activity.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-10 w-10 text-muted-foreground/50" />}
            title="No recent activity"
            body="Recent sales, follows, and collection actions will appear here."
          />
        ) : (
          <div className="space-y-3">
            {profilePageData.activity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        )
      )}

      <ProfileMobileSheet
        open={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        profile={profile}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}

// ── Header sub-components ─────────────────────────────────────────────────────

function BioRow({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = bio.length > 500
  if (!isLong || expanded) {
    return <p className="text-sm leading-6 text-muted-foreground">{bio}</p>
  }
  return (
    <div className="mt-2 flex items-baseline gap-1.5">
      <p className="min-w-0 truncate text-sm leading-6 text-muted-foreground">{bio}</p>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        ·· more
      </button>
    </div>
  )
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-semibold leading-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function VerifiedRow({ profile }: { profile: ProfileSummaryReference }) {
  const items = [
    profile.verification.email && { icon: Mail, label: "Email" },
    profile.verification.phone && { icon: Phone, label: "Phone" },
    profile.verification.id && { icon: ShieldCheck, label: "ID" },
  ].filter(Boolean) as { icon: ComponentType<{ className?: string }>; label: string }[]

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Verified:</span>
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          title={`${label} verified`}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
        >
          <Icon className="h-3 w-3" aria-hidden />
          <Check className="h-3 w-3 text-primary" aria-hidden />
        </span>
      ))}
    </div>
  )
}

function LinkedRow({ profile }: { profile: ProfileSummaryReference }) {
  const accounts = [...profile.linkedAccounts].sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
  if (accounts.length === 0) return null
  const verifiedCount = accounts.filter((a) => a.verified).length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Linked:</span>
      {accounts.slice(0, 4).map((account) => (
        <a
          key={`${account.platform}-${account.username}`}
          href="#"
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            account.verified
              ? "bg-secondary text-secondary-foreground hover:bg-muted hover:text-foreground"
              : "border border-border/60 bg-transparent text-muted-foreground hover:bg-secondary/60 hover:border-border hover:text-foreground",
          )}
        >
          <span className="capitalize">{account.platform}</span>
          {account.verified ? <BadgeCheck className="h-3 w-3 text-primary" aria-hidden /> : null}
          <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden />
        </a>
      ))}
      {verifiedCount > 0 ? (
        <span className="text-xs text-muted-foreground">({verifiedCount} verified)</span>
      ) : null}
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 py-2 text-xl font-bold transition-colors focus-visible:outline-none",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/40 py-12 text-center">
      {icon}
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

function CollapsibleSection({ label, defaultOpen = false, children }: { label: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-6 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-4 flex items-center"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
          {label}
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </span>
      </button>
      {open ? children : null}
    </div>
  )
}

// ── Content rows ──────────────────────────────────────────────────────────────

const activityIconConfig: Record<
  ProfileActivityReference["type"],
  { icon: ComponentType<{ className?: string }>; bg: string; color: string }
> = {
  listing: { icon: Tag,        bg: "bg-amber-500/10",   color: "text-amber-500" },
  trade:   { icon: Repeat2,    bg: "bg-primary/10",     color: "text-primary" },
  collection: { icon: FolderOpen, bg: "bg-blue-500/10", color: "text-blue-400" },
  offer:   { icon: Package,    bg: "bg-orange-500/10",  color: "text-orange-400" },
  follow:  { icon: Heart,      bg: "bg-rose-500/10",    color: "text-rose-400" },
}

function ActivityRow({ item }: { item: ProfileActivityReference }) {
  const config = activityIconConfig[item.type] ?? { icon: Activity, bg: "bg-muted", color: "text-muted-foreground" }
  const Icon = config.icon
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3">
      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", config.bg)}>
        <Icon className={cn("h-3.5 w-3.5", config.color)} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{item.description}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden />
          {formatActivityTime(item.timestamp)}
        </p>
      </div>
    </div>
  )
}
