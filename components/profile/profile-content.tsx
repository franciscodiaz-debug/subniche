"use client"

import type { ComponentType, MouseEvent, ReactNode } from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  FolderOpen,
  Heart,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Repeat2,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/current-user"
import { ownProfile, otherProfile, profilePageData } from "@/lib/profile-page-data"
import type {
  ProfileActivityReference,
  ProfileLinkedAccountReference,
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

type ActivityFilter = "all" | "listings" | "trades" | "collections" | "wishlist"

const ACTIVITY_FILTER_OPTIONS: { value: ActivityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "listings", label: "Listings" },
  { value: "trades", label: "Trades" },
  { value: "collections", label: "Collections" },
  { value: "wishlist", label: "Wishlist" },
]

/** Maps activity types onto the filter chips above the feed. */
function activityMatchesFilter(
  type: ProfileActivityReference["type"],
  filter: ActivityFilter,
): boolean {
  if (filter === "listings") {
    return type === "listing_created" || type === "listing_sold" || type === "listing"
  }
  if (filter === "trades") {
    return type === "trade_completed" || type === "trade" || type === "offer"
  }
  if (filter === "collections") {
    return type === "collection_created" || type === "item_added_to_collection" || type === "collection"
  }
  if (filter === "wishlist") {
    return type === "wishlist_added" || type === "wishlist_acquired"
  }
  return true
}

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
  const [activeTab, setActiveTab] = useState<ProfileTab>("for-sale")
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all")
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<ProfileViewMode>(initialViewMode)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  const filteredActivity = useMemo(() => {
    const items = profilePageData.activity
    if (activityFilter === "all") return items
    return items.filter((a) => activityMatchesFilter(a.type, activityFilter))
  }, [activityFilter])

  const isOwnProfile = viewMode === "own"
  const profile = isOwnProfile ? ownProfileState : otherProfileState
  /* Owner always sees their own Activity tab. Visitors only see it when
   * the owner has opted in (default true on legacy profiles). */
  const showActivityTab =
    isOwnProfile || (profile.showActivityOnPublicProfile ?? true)
  const handleShareProfile = () => {
    if (typeof window === "undefined") return
    const url = `${window.location.origin}/profile/${profile.username}`
    if (navigator?.share) {
      navigator.share({ title: `${profile.username}'s profile`, url }).catch(() => {})
    } else if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[80] overflow-y-auto bg-background animate-in slide-in-from-right-full duration-300 lg:static lg:z-auto lg:overflow-visible lg:animate-none">
        <ProfileEditView
          profile={profile}
          onBack={() => setIsEditing(false)}
          onSave={(next) => {
            setOwnProfileState(next)
            setIsEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 lg:p-8">

      {/* ── Mobile profile header ──────────────────────────────────────────── */}
      <div className="mb-6 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Avatar className="h-20 w-20 shrink-0 border-2 border-border">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={`${profile.username} avatar`} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-secondary text-base font-semibold text-foreground">
              {profile.avatarLabel}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pt-2">
            <h1 className="truncate text-2xl font-semibold leading-tight text-foreground">{profile.username}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="min-w-0 truncate text-sm font-medium text-muted-foreground">@{profile.ownerHandle}</span>
              <ProfileNicheSwitcher
                username={currentUser.username}
                activeNicheName={profile.username}
                isOwnProfile={isOwnProfile}
                buttonClassName="h-7 w-7 rounded-md border-border/70"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {profile.location}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {formatMonthYear(profile.memberSince)}
              </span>
            </div>
            <div className="mt-4 flex items-start gap-8">
              <MobileStat value={profile.stats.totalItems} label="Items" />
              <MobileStat value={profile.stats.totalCollections} label="Collections" />
              <MobileStat value={profile.stats.totalTrades} label="Trades" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {isOwnProfile ? (
            <Button
              variant="quiet_outline"
              onClick={() => setIsEditing(true)}
              className="h-10 flex-1 gap-1.5 rounded-lg text-sm font-semibold"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? "secondary" : "quiet_outline"}
              onClick={() => setIsFollowing((v) => !v)}
              aria-pressed={isFollowing}
              className="h-10 flex-1 gap-1.5 rounded-lg text-sm font-semibold"
            >
              {isFollowing ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
          <Button
            variant="quiet_outline"
            onClick={handleShareProfile}
            className="h-10 flex-1 gap-1.5 rounded-lg text-sm font-semibold"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share profile
          </Button>
        </div>

        {profile.bio ? (
          <div className="mt-4">
            <BioRow bio={profile.bio} />
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          <VerifiedRow profile={profile} />
          <LinkedRow profile={profile} />
        </div>
      </div>

      {/* ── Desktop profile header ─────────────────────────────────────────── */}
      <div className="mb-8 hidden gap-6 md:gap-8 lg:flex">

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
              <ProfileNicheSwitcher
                username={currentUser.username}
                activeNicheName={profile.username}
                isOwnProfile={isOwnProfile}
              />
              <Button
                variant="quiet_outline"
                size="icon-sm"
                aria-label="Share profile"
                onClick={handleShareProfile}
              >
                <Share2 className="h-4 w-4" />
              </Button>
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

          {/* Stats */}
          <div className="mt-5 flex flex-wrap items-start gap-x-9 gap-y-3">
            <StatBlock value={profile.stats.totalItems} label="Items" />
            <StatBlock value={profile.stats.totalCollections} label="Collections" />
            <StatBlock value={profile.stats.totalTrades} label="Trades" />
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
        </div>
      </div>

      {/* ── Tab navigation ──────────────────────────────────────────────────── */}
      <div className="mb-5 border-b border-border/60 lg:mb-8 lg:border-b-0">
        <div className="-mx-4 flex flex-nowrap items-center gap-6 overflow-x-auto px-4 lg:mx-0 lg:gap-8 lg:overflow-visible lg:px-0">
          <TabButton active={activeTab === "for-sale"} onClick={() => setActiveTab("for-sale")}>
            For Sale/Trade
          </TabButton>
          <TabButton active={activeTab === "collections"} onClick={() => setActiveTab("collections")}>
            Collections
          </TabButton>
          <TabButton active={activeTab === "looking-for"} onClick={() => setActiveTab("looking-for")}>
            Looking For
          </TabButton>
          {showActivityTab ? (
            <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>
              Activity
            </TabButton>
          ) : null}
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

      {activeTab === "activity" && showActivityTab && (
        profilePageData.activity.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-10 w-10 text-muted-foreground/50" />}
            title="No recent activity"
            body="Recent sales, follows, and collection actions will appear here."
          />
        ) : (
          <div className="flex flex-col gap-4">
            <ActivityFilterChips
              value={activityFilter}
              onChange={setActivityFilter}
            />
            {filteredActivity.length === 0 ? (
              <EmptyState
                icon={<Activity className="h-10 w-10 text-muted-foreground/50" />}
                title="No matching activity"
                body="Nothing of this kind yet. Try a different filter."
              />
            ) : (
              <div className="space-y-3">
                {filteredActivity.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            )}
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
  const mobileBioRef = useRef<HTMLParagraphElement>(null)
  const isLong = bio.length > 500
  const [mobilePreviewLength, setMobilePreviewLength] = useState(() =>
    Math.min(96, bio.length),
  )
  const mobilePreview =
    bio.length > mobilePreviewLength
      ? bio.slice(0, mobilePreviewLength).trimEnd()
      : bio

  useLayoutEffect(() => {
    if (expanded) return

    const bioElement = mobileBioRef.current
    if (!bioElement) return

    const measure = () => {
      const bioStyle = window.getComputedStyle(bioElement)
      if (bioStyle.display === "none") return

      const width = bioElement.clientWidth
      if (width <= 0) return

      const measurer = document.createElement("p")
      measurer.className = bioElement.className
      Object.assign(measurer.style, {
        height: "auto",
        left: "-9999px",
        maxHeight: "none",
        overflow: "visible",
        pointerEvents: "none",
        position: "absolute",
        top: "0",
        visibility: "hidden",
        whiteSpace: "normal",
        width: `${width}px`,
      })

      const previewNode = document.createTextNode("")
      const button = document.createElement("button")
      button.className = "inline font-semibold text-foreground"
      button.textContent = "See more"
      measurer.append(previewNode, document.createTextNode("... "), button)
      document.body.appendChild(measurer)

      const lineHeight = Number.parseFloat(window.getComputedStyle(measurer).lineHeight) || 24
      const maxHeight = lineHeight * 2 + 0.5
      let bestLength = Math.min(96, bio.length)
      let bestGap = Number.POSITIVE_INFINITY

      for (let length = 1; length <= bio.length; length += 1) {
        previewNode.textContent = bio.slice(0, length).trimEnd()

        const textRect = measurer.getBoundingClientRect()
        const buttonRect = button.getBoundingClientRect()
        const buttonLine = Math.round((buttonRect.top - textRect.top) / lineHeight) + 1
        const rightGap = textRect.right - buttonRect.right

        if (
          textRect.height <= maxHeight &&
          buttonLine === 2 &&
          rightGap >= 0 &&
          rightGap < bestGap
        ) {
          bestLength = length
          bestGap = rightGap
        }
      }

      measurer.remove()
      setMobilePreviewLength((current) =>
        current === bestLength ? current : bestLength,
      )
    }

    const frame = window.requestAnimationFrame(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(bioElement)
    window.addEventListener("resize", measure)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [bio, expanded])

  if (expanded) return <p className="text-sm leading-6 text-muted-foreground">{bio}</p>

  return (
    <>
      <p ref={mobileBioRef} className="text-sm leading-6 text-muted-foreground lg:hidden">
        {mobilePreview}
        {bio.length > mobilePreview.length ? (
          <>
            ...{" "}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline font-semibold text-foreground transition-colors hover:text-primary"
            >
              See more
            </button>
          </>
        ) : null}
      </p>
      <p className={cn(
        "hidden text-sm leading-6 text-muted-foreground lg:block",
        isLong && "lg:truncate",
      )}>
        {bio}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline"
        >
          See more
        </button>
      ) : null}
    </>
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

function MobileStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="shrink-0 text-center">
      <p className="text-base font-semibold leading-tight text-foreground">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{label}</p>
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
          onClick={(event) => handleLinkedAccountClick(event, account)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            account.verified
              ? "bg-secondary text-secondary-foreground hover:bg-muted hover:text-foreground"
              : "border border-border/60 bg-transparent text-muted-foreground hover:bg-secondary/60 hover:border-border hover:text-foreground",
          )}
        >
          <span className="capitalize">{account.platform}</span>
          {account.verified ? <Check className="h-3 w-3 text-primary" aria-hidden /> : null}
          <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden />
        </a>
      ))}
      {verifiedCount > 0 ? (
        <span className="text-xs text-muted-foreground">({verifiedCount} verified)</span>
      ) : null}
    </div>
  )
}

function handleLinkedAccountClick(
  event: MouseEvent<HTMLAnchorElement>,
  account: ProfileLinkedAccountReference,
) {
  if (account.verified) return

  event.preventDefault()
  window.alert("This account has not been verified by the user.")
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 border-b-2 px-1 py-3 text-base font-semibold transition-colors focus-visible:outline-none lg:border-b-0 lg:py-2 lg:text-xl lg:font-bold",
        active
          ? "border-primary text-foreground lg:border-transparent"
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
  listing_created:           { icon: Plus,        bg: "bg-amber-500/10",  color: "text-amber-500" },
  listing_sold:              { icon: DollarSign,  bg: "bg-emerald-500/10", color: "text-emerald-500" },
  trade_completed:           { icon: Repeat2,     bg: "bg-primary/10",    color: "text-primary" },
  collection_created:        { icon: FolderOpen,  bg: "bg-blue-500/10",   color: "text-blue-400" },
  item_added_to_collection:  { icon: FolderOpen,  bg: "bg-blue-500/10",   color: "text-blue-400" },
  wishlist_added:            { icon: Heart,       bg: "bg-chart-5/10",    color: "text-chart-5" },
  wishlist_acquired:         { icon: Sparkles,    bg: "bg-chart-5/10",    color: "text-chart-5" },
  verified:                  { icon: ShieldCheck, bg: "bg-status-success/10", color: "text-status-success" },
  // Legacy types — kept so existing mock data still renders.
  listing:    { icon: Tag,        bg: "bg-amber-500/10",  color: "text-amber-500" },
  trade:      { icon: Repeat2,    bg: "bg-primary/10",    color: "text-primary" },
  collection: { icon: FolderOpen, bg: "bg-blue-500/10",   color: "text-blue-400" },
  offer:      { icon: Package,    bg: "bg-orange-500/10", color: "text-orange-400" },
  follow:     { icon: Heart,      bg: "bg-rose-500/10",   color: "text-rose-400" },
}

function ActivityFilterChips({
  value,
  onChange,
}: {
  value: ActivityFilter
  onChange: (v: ActivityFilter) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter activity"
      className="flex w-full items-center gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {ACTIVITY_FILTER_OPTIONS.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all",
              selected
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ActivityRow({ item }: { item: ProfileActivityReference }) {
  const config = activityIconConfig[item.type] ?? { icon: Activity, bg: "bg-muted", color: "text-muted-foreground" }
  const Icon = config.icon

  const body = (
    <>
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
    </>
  )

  // When the activity has a click destination, render the row as a Link
  // so the whole card is clickable and gets a hover treatment. Without a
  // destination, the row stays as a passive informational item.
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card/60"
      >
        {body}
      </Link>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3">
      {body}
    </div>
  )
}
