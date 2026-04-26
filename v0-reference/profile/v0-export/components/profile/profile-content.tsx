"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { useState } from "react"
import {
  Activity,
  BadgeCheck,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  FolderOpen,
  Heart,
  Repeat2,
  Lock,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Tag,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { profilePageData } from "@/lib/profile-page-data"
import type {
  ProfileActivityReference,
  ProfileCollectionReference,
  ProfileLinkedAccountReference,
  ProfileSummaryReference,
  ProfileTradeInterestReference,
  ProfileWishlistReference,
} from "@/lib/profile-page-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DiscoverListingCard } from "@/components/discover-listing-card"

import { EditProfileModal } from "./edit-profile-modal"

type ProfileTab = "collections" | "for-sale" | "looking-for" | "activity"

function money(value: number) {
  return `$${value.toLocaleString()}`
}

function formatMonthYear(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
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
  const [profile, setProfile] = useState<ProfileSummaryReference>(profilePageData.profile)
  const [activeTab, setActiveTab] = useState<ProfileTab>("collections")
  const [showEditModal, setShowEditModal] = useState(false)

  const linkedCount = profile.linkedAccounts.length
  const linkedVerifiedCount = profile.linkedAccounts.filter((a) => a.verified).length

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row">
        <Avatar className="h-24 w-24 border-4 border-card sm:h-32 sm:w-32">
          {profile.avatarUrl ? (
            <AvatarImage
              src={profile.avatarUrl}
              alt={`${profile.username} avatar`}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-secondary text-2xl font-semibold text-foreground sm:text-3xl">
            {profile.avatarLabel}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="space-y-3">
            <div className="flex flex-nowrap items-center gap-3">
              <h1 className="min-w-0 truncate text-2xl font-bold text-foreground">
                {profile.username}
              </h1>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="gap-2"
                  aria-label="Edit profile"
                  title="Edit profile"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Share profile"
                  title="Share profile"
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

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since {formatMonthYear(profile.memberSince)}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>

            <div className="space-y-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-muted-foreground">Verified:</span>
                <VerificationPill icon={Mail} active={profile.verification.email} subject="Email" />
                <VerificationPill icon={Phone} active={profile.verification.phone} subject="Phone" />
                <VerificationPill icon={ShieldCheck} active={profile.verification.id} subject="ID" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-muted-foreground">Linked:</span>
                {profile.linkedAccounts.map((account) => (
                  <LinkedAccountPill
                    key={`${account.platform}-${account.username}`}
                    account={account}
                  />
                ))}
                {linkedCount > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    ({linkedVerifiedCount} verified)
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-6">
            <StatColumn label="Items" value={profile.stats.totalItems} />
            <StatColumn label="Collections" value={profile.stats.totalCollections} />
            <StatColumn label="Trades" value={profile.stats.totalTrades} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
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

      {/* Collections */}
      {activeTab === "collections" && (
        <>
          {profilePageData.collections.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-10 w-10 text-muted-foreground/50" />}
              title="No collections yet"
              body="Create a collection to start organizing items on this profile."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profilePageData.collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </>
      )}

      {/* For sale / trade */}
      {activeTab === "for-sale" && (
        <>
          {profilePageData.forSaleItems.length === 0 ? (
            <EmptyState
              icon={<Tag className="h-10 w-10 text-muted-foreground/50" />}
              title="No items for sale"
              body="List an item to show it in the public sale and trade view."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profilePageData.forSaleItems.map((item) => (
                <DiscoverListingCard
                  key={item.id}
                  listing={{
                    id: item.id,
                    title: item.title,
                    subtitle: item.subtitle,
                    price: item.price,
                    images: [item.imageUrl],
                    for_trade: item.forTrade,
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Looking for */}
      {activeTab === "looking-for" && (
        <div>
          <CollapsibleSection
            label={`${profilePageData.tradeInterests.length} trade ${
              profilePageData.tradeInterests.length === 1 ? "interest" : "interests"
            }`}
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
            label={`${profilePageData.lookingForItems.length} wishlist ${
              profilePageData.lookingForItems.length === 1 ? "item" : "items"
            }`}
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
                  <WishlistCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </CollapsibleSection>
        </div>
      )}

      {/* Activity */}
      {activeTab === "activity" && (
        <>
          {profilePageData.activity.length === 0 ? (
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
          )}
        </>
      )}

      <EditProfileModal
        open={showEditModal}
        profile={profile}
        onOpenChange={setShowEditModal}
        onSave={(next) => {
          setProfile(next)
          setShowEditModal(false)
        }}
      />
    </div>
  )
}

/* ---------- Sub components ---------- */

function StatColumn({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function VerificationPill({
  icon: Icon,
  active,
  subject,
}: {
  icon: typeof Mail
  active: boolean
  subject: string
}) {
  const accessibleLabel = active ? "Verified" : "Not verified"

  return (
    <span
      aria-label={accessibleLabel}
      title={accessibleLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
        active
          ? "bg-secondary text-secondary-foreground"
          : "border border-border bg-transparent text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      {active ? <BadgeCheck className="h-3 w-3 text-primary" aria-hidden /> : null}
    </span>
  )
}

function LinkedAccountPill({ account }: { account: ProfileLinkedAccountReference }) {
  const accessibleLabel = account.verified ? "Verified" : "Unverified"

  return (
    <a
      href="#"
      title={accessibleLabel}
      aria-label={accessibleLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
        account.verified
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          : "border border-border bg-transparent text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground",
      )}
    >
      <span className="capitalize">{account.platform}</span>
      {account.verified ? (
        <BadgeCheck className="h-3 w-3 text-primary" aria-hidden />
      ) : null}
      <ExternalLink className="h-2.5 w-2.5 opacity-50" />
    </a>
  )
}

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
        "text-xl font-semibold transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

/* ---------- Collection card ---------- */

const visibilityConfig = {
  public: { icon: Eye, label: "Public" },
  unlisted: { icon: EyeOff, label: "Link Only" },
  private: { icon: Lock, label: "Private" },
} as const

function CollectionCard({ collection }: { collection: ProfileCollectionReference }) {
  const { icon: VisibilityIcon, label: visibilityLabel } = visibilityConfig[collection.visibility]
  const gridImages = (collection.previewImages ?? []).slice(0, 4)
  const hasImages = gridImages.length > 0

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      {/* Image grid */}
      <div className="relative aspect-[16/10] overflow-hidden bg-card">
        {hasImages ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[3px]">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative overflow-hidden bg-secondary">
                {gridImages[index] ? (
                  <Image
                    src={gridImages[index]}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary/50" />
                )}
              </div>
            ))}
          </div>
        ) : collection.isWishlist ? (
          <div className="flex h-full w-full items-center justify-center">
            <Heart className="h-10 w-10 text-rose-500/30" aria-hidden />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderOpen className="h-10 w-10 text-primary/30" aria-hidden />
          </div>
        )}

        {/* Wishlist badge */}
        {collection.isWishlist ? (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 backdrop-blur-sm">
            <Heart className="h-3 w-3 fill-current text-rose-500" aria-hidden />
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="relative p-3">
        <div
          className="absolute right-3 top-3 text-muted-foreground"
          title={visibilityLabel}
          aria-label={visibilityLabel}
        >
          <VisibilityIcon className="h-4 w-4" />
        </div>

        <h3 className="truncate pr-6 font-medium text-foreground">{collection.name}</h3>
        {collection.description ? (
          <p className="mt-0.5 truncate pr-6 text-sm text-muted-foreground">
            {collection.description}
          </p>
        ) : null}
        <div className="mt-2.5 border-t border-border pt-2.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm text-muted-foreground">
              {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
            </p>
            {collection.totalValue > 0 ? (
              <p className="text-sm font-medium text-foreground">{money(collection.totalValue)}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Wishlist card ---------- */

function WishlistCard({ item }: { item: ProfileWishlistReference }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-dashed border-border bg-secondary/30 transition-colors hover:border-chart-5/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary opacity-60">
        <HeroTile label={item.imageLabel} imageUrl={item.imageUrl} alt={item.title} faded />
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="truncate text-sm font-semibold text-muted-foreground transition-colors group-hover:text-chart-5">
          {item.title}
        </h3>
        <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
        <div className="flex items-center justify-end gap-1.5">
          <Search className="h-3.5 w-3.5 text-chart-5" aria-label="Looking for" />
        </div>
      </div>
    </div>
  )
}

/* ---------- Activity row ---------- */

type ActivityType = ProfileActivityReference["type"]

const activityIcon: Record<ActivityType, { icon: typeof Tag; color: string }> = {
  listing: { icon: Tag, color: "text-primary" },
  trade: { icon: Package, color: "text-emerald-500" },
  collection: { icon: FolderOpen, color: "text-sky-500" },
  offer: { icon: Tag, color: "text-amber-500" },
  follow: { icon: Heart, color: "text-rose-500" },
}

function ActivityRow({ item }: { item: ProfileActivityReference }) {
  const { icon: Icon, color } = activityIcon[item.type]
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <div className="rounded-full bg-muted p-2">
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground">{item.description}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatActivityTime(item.timestamp)}
        </p>
      </div>
    </div>
  )
}

/* ---------- Shared helpers ---------- */

function HeroTile({
  label,
  imageUrl,
  alt,
  faded = false,
}: {
  label: string
  imageUrl?: string
  alt?: string
  faded?: boolean
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt || label}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "object-cover transition-transform duration-300 group-hover:scale-[1.02]",
          faded && "grayscale-[40%]",
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary via-card to-secondary text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground",
        faded && "opacity-80",
      )}
    >
      {label}
    </div>
  )
}

/* ---------- Collapsible section ---------- */

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
  const contentId = `collapsible-${label.replace(/\s+/g, "-").toLowerCase()}`

  return (
    <section className="border-t border-border first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={contentId}
        className="group -mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-md px-2 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <span className="inline-flex items-center rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={contentId} className="pb-6">
          {children}
        </div>
      ) : null}
    </section>
  )
}

/* ---------- Trade interest row ---------- */

function TradeInterestRow({ interest }: { interest: ProfileTradeInterestReference }) {
  const [open, setOpen] = useState(false)
  const criteriaCount = interest.criteria.length
  const contentId = `trade-interest-${interest.id}-criteria`
  const hasCriteria = criteriaCount > 0

  return (
    <li>
      <button
        type="button"
        onClick={() => (hasCriteria ? setOpen((prev) => !prev) : undefined)}
        aria-expanded={hasCriteria ? open : undefined}
        aria-controls={hasCriteria ? contentId : undefined}
        className={cn(
          "group flex w-full items-center gap-3 py-2.5 text-left",
          hasCriteria ? "cursor-pointer" : "cursor-default",
        )}
      >
        <Repeat2
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 self-start text-muted-foreground/70"
          aria-hidden
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              "truncate text-sm text-foreground transition-colors",
              hasCriteria && "group-hover:text-primary",
            )}
          >
            {interest.name}
          </span>
          {interest.description ? (
            <span className="truncate text-xs leading-snug text-muted-foreground">
              {interest.description}
            </span>
          ) : null}
        </span>
        {hasCriteria ? (
          <>
            <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground/70 transition-colors group-hover:text-foreground">
              ({criteriaCount})
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60 transition-all duration-200 group-hover:text-foreground",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </>
        ) : null}
      </button>

      {hasCriteria && open ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Collapse trade interest details"
          onClick={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setOpen(false)
            }
          }}
          className="cursor-pointer pb-3 pl-6 pr-3"
        >
          <dl id={contentId} className="flex flex-wrap gap-1.5 text-xs">
            {interest.criteria.map((criterion) => (
              <div
                key={`${interest.id}-${criterion.label}`}
                className="inline-flex items-baseline gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1"
              >
                <dt className="text-muted-foreground">{criterion.label}</dt>
                <dd className="font-medium text-foreground">{criterion.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </li>
  )
}

/* ---------- Empty state ---------- */

function EmptyState({
  title,
  body,
  icon,
}: {
  title: string
  body: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
      <div className="mx-auto mb-3 flex items-center justify-center">{icon}</div>
      <p className="text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
