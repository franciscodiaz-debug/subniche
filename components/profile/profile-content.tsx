"use client"

import type { ComponentType, ReactNode } from "react"
import { useState } from "react"
import {
  Activity,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Heart,
  Mail,
  MoreHorizontal,
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
  ProfileTradeInterestReference,
} from "@/lib/profile-page-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CollectionCard } from "@/components/collection-card"
import { ListingCard } from "@/components/listing-card"
import { ProfileEditView } from "./profile-edit-view"
import { ProfileMobileSheet } from "./profile-mobile-sheet"
import { ProfileNicheSwitcher } from "./profile-niche-switcher"

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

export function ProfileContent() {
  const [ownProfileState, setOwnProfileState] = useState<ProfileSummaryReference>(ownProfile)
  const [otherProfileState] = useState<ProfileSummaryReference>(otherProfile)
  const [activeTab, setActiveTab] = useState<ProfileTab>("collections")
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<ProfileViewMode>("own")
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
    <div className="@container mx-auto max-w-4xl p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 border border-border">
            {profile.avatarUrl ? (
              <AvatarImage
                src={profile.avatarUrl}
                alt={`${profile.username} avatar`}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
              {profile.avatarLabel}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold leading-tight text-foreground @sm:text-lg">
              {profile.username}
            </h1>
            <p className="truncate text-xs text-muted-foreground">@{profile.ownerHandle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 @sm:gap-2">
            {isOwnProfile ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-9 gap-2 px-3 @sm:h-8"
                aria-label="Edit profile"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
                <span className="hidden @sm:inline">Profile</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant={isFollowing ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsFollowing((v) => !v)}
                className="h-9 gap-2 px-3 @sm:h-8"
                aria-pressed={isFollowing}
              >
                {isFollowing ? <Check className="h-4 w-4" aria-hidden /> : null}
                <span>{isFollowing ? "Following" : "Follow"}</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="flex h-9 w-9 @sm:hidden"
              aria-label="More options"
              onClick={() => setIsMobileSheetOpen(true)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <div className="hidden items-center gap-2 @sm:flex">
              <ProfileNicheSwitcher
                username={currentUser.username}
                activeNicheName={profile.username}
                isOwnProfile={isOwnProfile}
              />
              <Button
                type="button"
                variant="outline"
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
            </div>
          </div>
        </div>

        <p className="mt-2 truncate text-xs text-muted-foreground">
          {profile.location}
          <span className="mx-1.5 text-muted-foreground/50" aria-hidden>
            ·
          </span>
          Member since {formatMonthYear(profile.memberSince)}
        </p>

        {profile.bio ? (
          <div className="hidden @sm:block">
            <BioRow bio={profile.bio} />
          </div>
        ) : null}

        <div className="scrollbar-hide mt-3 -mx-1 flex items-center gap-x-2 overflow-x-auto whitespace-nowrap px-1 text-sm">
          <InlineStat label="Trades" value={profile.stats.totalTrades} />
          <StatDivider />
          <InlineStat label="Items" value={profile.stats.totalItems} />
          <StatDivider />
          <InlineStat label="Collections" value={profile.stats.totalCollections} />
          {isOwnProfile ? (
            <>
              <StatDivider />
              <InlineStat label="Following" value={profile.stats.totalFollowing} />
            </>
          ) : null}
        </div>

        <div className="hidden @sm:block">
          <VerifiedAndLinkedRow profile={profile} />
        </div>
      </div>

      <div className="mb-8 border-b border-border/60">
        <div className="-mb-px flex flex-nowrap items-center gap-3 @sm:gap-8">
          <TabButton
            active={activeTab === "collections"}
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </TabButton>
          <TabButton active={activeTab === "for-sale"} onClick={() => setActiveTab("for-sale")}>
            For Sale/Trade
          </TabButton>
          <TabButton
            active={activeTab === "looking-for"}
            onClick={() => setActiveTab("looking-for")}
          >
            Looking For
          </TabButton>
          <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>
            Activity
          </TabButton>
        </div>
      </div>

      {activeTab === "collections" && (
        <>
          {profile.bio ? (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground @sm:hidden">
              {profile.bio}
            </p>
          ) : null}
          {profilePageData.collections.length === 0 ? (
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
          )}
        </>
      )}

      {activeTab === "for-sale" &&
        (profilePageData.forSaleItems.length === 0 ? (
          <EmptyState
            icon={<Tag className="h-10 w-10 text-muted-foreground/50" />}
            title="No items for sale"
            body="List an item to show it in the public sale and trade view."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profilePageData.forSaleItems.map((item) => (
              <ListingCard
                key={item.id}
                image={item.imageUrl}
                title={item.title}
                subtitle={item.subtitle}
                price={item.price}
                href={`/listings/${item.id}`}
              />
            ))}
          </div>
        ))}

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
              <ul className="divide-y divide-border/60">
                {profilePageData.tradeInterests.map((interest) => (
                  <TradeInterestRow key={interest.id} interest={interest} />
                ))}
              </ul>
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
                  <ListingCard
                    key={item.id}
                    image={item.imageUrl}
                    title={item.title}
                    subtitle={item.subtitle}
                  />
                ))}
              </div>
            )}
          </CollapsibleSection>
        </div>
      )}

      {activeTab === "activity" &&
        (profilePageData.activity.length === 0 ? (
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
        ))}

      <ProfileMobileSheet
        open={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        profile={profile}
        isOwnProfile={isOwnProfile}
      />
      <DevViewToggle viewMode={viewMode} onChange={setViewMode} />
    </div>
  )
}

// ── Dev toggle ────────────────────────────────────────────────────────────────

function DevViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: ProfileViewMode
  onChange: (next: ProfileViewMode) => void
}) {
  return (
    <div
      role="region"
      aria-label="Prototype dev controls"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
    >
      <span className="font-mono uppercase tracking-wide text-muted-foreground">Dev</span>
      <span className="text-muted-foreground">View as:</span>
      <div className="inline-flex overflow-hidden rounded-md border border-border">
        <button
          type="button"
          onClick={() => onChange("own")}
          aria-pressed={viewMode === "own"}
          className={cn(
            "px-2 py-1 transition-colors",
            viewMode === "own"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Own
        </button>
        <button
          type="button"
          onClick={() => onChange("other")}
          aria-pressed={viewMode === "other"}
          className={cn(
            "px-2 py-1 transition-colors",
            viewMode === "other"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Other user
        </button>
      </div>
    </div>
  )
}

// ── Header sub-components ─────────────────────────────────────────────────────

function BioRow({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = bio.length > 80
  if (!isLong || expanded) {
    return <p className="mt-2 text-sm leading-relaxed text-foreground">{bio}</p>
  }
  return (
    <div className="mt-2 flex items-baseline gap-1.5">
      <p className="min-w-0 truncate text-sm text-foreground">{bio}</p>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-expanded={false}
        className="shrink-0 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ·· more
      </button>
    </div>
  )
}

function InlineStat({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded px-1 py-0.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="font-semibold text-foreground">{value}</span>
      <span className="ml-1 text-muted-foreground">{label}</span>
    </button>
  )
}

function StatDivider() {
  return (
    <span className="select-none text-muted-foreground/40" aria-hidden>
      ·
    </span>
  )
}

function VerifiedAndLinkedRow({ profile }: { profile: ProfileSummaryReference }) {
  const verifiedItems = [
    profile.verification.email && { icon: Mail, label: "Email" },
    profile.verification.phone && { icon: Phone, label: "Phone" },
    profile.verification.id && { icon: ShieldCheck, label: "ID" },
  ].filter(Boolean) as { icon: ComponentType<{ className?: string }>; label: string }[]

  if (verifiedItems.length === 0 && profile.linkedAccounts.length === 0) return null

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {verifiedItems.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Icon className="h-3 w-3 text-primary" aria-hidden />
          <span>{label} verified</span>
        </span>
      ))}
      {profile.linkedAccounts.slice(0, 3).map((account) => (
        <a
          key={`${account.platform}-${account.username}`}
          href="#"
          className="inline-flex items-center gap-1 rounded text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" aria-hidden />
          <span className="capitalize">{account.platform}</span>
          {account.verified ? <BadgeCheck className="h-3 w-3 text-primary" aria-hidden /> : null}
        </a>
      ))}
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors focus-visible:outline-none",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
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

function CollapsibleSection({
  label,
  defaultOpen = false,
  children,
}: {
  label: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-6 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded px-0.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? children : null}
    </div>
  )
}

// ── Content cards ─────────────────────────────────────────────────────────────

function TradeInterestRow({ interest }: { interest: ProfileTradeInterestReference }) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <p className="text-sm font-medium text-foreground">{interest.name}</p>
      {interest.description ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{interest.description}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {interest.criteria.map((criterion) => (
          <span
            key={criterion.label}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
          >
            <span className="text-muted-foreground">{criterion.label}:</span>
            <span>{criterion.value}</span>
          </span>
        ))}
      </div>
    </li>
  )
}


const activityIconMap: Record<
  ProfileActivityReference["type"],
  ComponentType<{ className?: string }>
> = {
  listing: Tag,
  trade: Repeat2,
  collection: FolderOpen,
  offer: Package,
  follow: Heart,
}

function ActivityRow({ item }: { item: ProfileActivityReference }) {
  const Icon = activityIconMap[item.type] ?? Activity
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
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
