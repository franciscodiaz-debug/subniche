"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightFromLineIcon,
  ChevronDown,
  ChevronUp,
  Repeat2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Community, InboundInterest, PerfectMatch } from "@/lib/types"
import type { TradeableItemSummary } from "@/lib/market-data"

type TradeInterestCardProps =
  | {
      type: "perfect"
      data: PerfectMatch
      showScoreOnboarding?: boolean
      /**
       * The viewer's tradeable items this listing matched. Length 1 → static
       * footer naming the single my_item. Length > 1 → collapsed footer with
       * "Matches X of your items" + chevron, expandable into a list. Empty
       * is treated like length 1 with the original `match.my_item.title`.
       */
      matchedItems?: TradeableItemSummary[]
    }
  | {
      type: "inbound"
      data: InboundInterest
      showScoreOnboarding?: boolean
      matchedItems?: TradeableItemSummary[]
    }

function getScoreColor(score: number): string {
  if (score >= 8) return "bg-emerald-500/10 text-emerald-600"
  if (score >= 5) return "bg-primary/10 text-primary"
  return "bg-secondary text-muted-foreground"
}

function GroupChips({
  groups,
  expanded,
  onToggle,
}: {
  groups: Community[]
  expanded: boolean
  onToggle: () => void
}) {
  const hasMoreGroups = groups.length > 2
  const visibleGroups = expanded ? groups : groups.slice(0, 2)

  return (
    <div className={cn("flex items-center gap-1", expanded ? "flex-wrap" : "flex-nowrap")}>
      {visibleGroups.map((group, index) => (
        <span
          key={group.id}
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground bg-secondary",
            !expanded && index === 0 && "max-w-[45%] flex-shrink-0",
            !expanded && index === 1 && hasMoreGroups && "max-w-[30%] min-w-0 flex-shrink",
            !expanded && index === 1 && !hasMoreGroups && "min-w-0 flex-1",
            expanded && "flex-shrink-0",
          )}
        >
          {group.icon ? <span className="flex-shrink-0">{group.icon}</span> : null}
          <span className="truncate">{group.name}</span>
        </span>
      ))}

      {hasMoreGroups ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            onToggle()
          }}
          className="ml-auto inline-flex flex-shrink-0 items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted"
        >
          {expanded ? (
            <>
              <span>Less</span>
              <ChevronUp className="h-2.5 w-2.5" />
            </>
          ) : (
            <>
              <span>+{groups.length - 2}</span>
              <ChevronDown className="h-2.5 w-2.5" />
            </>
          )}
        </button>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MatchFooter                                                                */
/*                                                                            */
/* The colored footer block at the bottom of every trade card. Three states:  */
/*   - 1 matched item, perfect: primary-tinted footer, naming the my_item    */
/*   - 1 matched item, inbound: muted footer, naming the my_item             */
/*   - >1 matched items: collapsible variant — same chrome, but the body     */
/*     row replaces the my_item title with "Matches X of your items" and     */
/*     reveals a chevron. Clicking the row expands a list of matched items   */
/*     with a top divider, hover row state, and right-aligned price.         */
/*                                                                           */
/* The expand toggle lives outside the parent <Link> wrapper (this footer    */
/* sits below it), so we can use a plain button here. Stop-propagation isn't */
/* needed.                                                                   */
/* -------------------------------------------------------------------------- */

interface MatchFooterProps {
  /** Determines chrome — primary tint for perfect, muted for inbound. */
  variant: "perfect" | "inbound"
  /** "Trade match for your" / "Interested in your" prefix. */
  singleLeadingLabel: string
  /** "Trade match for" / "Interested in" prefix when multi. */
  multiLeadingLabel: string
  /** Fallback title for the 1-item state when `matchedItems` is empty —
   *  preserves backwards compatibility with raw `match.my_item.title`. */
  fallbackItemTitle: string
  matchedItems: TradeableItemSummary[]
  /** The leading icon that sits inside the footer body row. */
  Icon: typeof Repeat2Icon
  iconClassName: string
  matchScore: number
  showScoreOnboarding: boolean
}

function MatchFooter({
  variant,
  singleLeadingLabel,
  multiLeadingLabel,
  fallbackItemTitle,
  matchedItems,
  Icon,
  iconClassName,
  matchScore,
  showScoreOnboarding,
}: MatchFooterProps) {
  const [open, setOpen] = useState(false)
  const isMulti = matchedItems.length > 1

  /* Hover-to-expand --------------------------------------------------------
   * For mouse users we open the matched-items list automatically after the
   * cursor sits on the footer for 250ms, and close it the moment the cursor
   * leaves either the footer trigger or the floating overlay. Click still
   * toggles for touch / keyboard users — this is purely additive.
   *
   * The 250ms delay serves two purposes:
   *   1. Avoids accidental opens when the cursor is just passing through
   *      the card on its way somewhere else.
   *   2. Gives the user a clear "I meant to do this" intent signal.
   *
   * `hoverIntentRef` holds the pending setTimeout id so we can cancel it
   * if the cursor leaves before the delay elapses. We also clear it on
   * unmount to avoid a setState-after-unmount warning if the card is
   * removed from the grid mid-hover.
   */
  const hoverIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHoverIntent = () => {
    if (hoverIntentRef.current !== null) {
      clearTimeout(hoverIntentRef.current)
      hoverIntentRef.current = null
    }
  }

  const handleMouseEnter = () => {
    if (!isMulti) return
    cancelHoverIntent()
    hoverIntentRef.current = setTimeout(() => {
      setOpen(true)
      hoverIntentRef.current = null
    }, 250)
  }

  const handleMouseLeave = () => {
    if (!isMulti) return
    cancelHoverIntent()
    setOpen(false)
  }

  useEffect(() => cancelHoverIntent, [])

  /* The score badge sits absolutely positioned inside the footer block so it
   * doesn't get pushed by the body row's content. We reserve right-padding
   * (pr-8) on the body so long item titles don't slide under it. */
  const scoreBadge = (
    <div
      className={cn(
        "absolute right-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
        getScoreColor(matchScore),
      )}
      data-onboarding={showScoreOnboarding ? "match-score" : undefined}
    >
      {matchScore.toFixed(1)}
    </div>
  )

  /* Body row — always rendered. When multi, it becomes a button so the
   * whole row is the click target (not just the chevron), which is much
   * easier to hit on mobile. */
  const body = (
    <>
      <Icon className={cn("h-4 w-4 flex-shrink-0", iconClassName)} />
      <div className="min-w-0 flex-1 pr-8">
        {isMulti ? (
          <>
            <p className="text-[10px] leading-tight text-muted-foreground">
              {multiLeadingLabel}
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              {matchedItems.length} of your items
            </p>
          </>
        ) : (
          <>
            <p className="text-[10px] leading-tight text-muted-foreground">
              {singleLeadingLabel}
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              {matchedItems[0]?.title ?? fallbackItemTitle}
            </p>
          </>
        )}
      </div>
      {isMulti ? (
        /* Reserves space next to the score badge — sits flush left of it.
         * Rotates 180° on open per the spec. */
        <ChevronDown
          className={cn(
            "absolute bottom-1 right-1.5 h-3.5 w-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      ) : null}
    </>
  )

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative mt-2 rounded border transition-colors",
        /* Variant chrome — perfect uses the existing primary tint, inbound
         * uses the muted secondary; the gold/amber hover ring matches the
         * score badge palette so the hover affordance reads as related. */
        variant === "perfect"
          ? "border-primary bg-primary/10 hover:border-primary"
          : "border-transparent bg-secondary hover:border-primary/40",
      )}
    >
      {scoreBadge}

      {isMulti ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? "Hide matched items" : "Show matched items"}
          /* The button must own the same flex+padding layout the static
           * footer used so visual rhythm doesn't shift between states. */
          className={cn(
            "flex w-full items-center gap-2 px-2 py-1.5 text-left",
            "rounded transition-colors",
            "hover:bg-foreground/5",
          )}
        >
          {body}
        </button>
      ) : (
        <div className="flex items-center gap-2 px-2 py-1.5">{body}</div>
      )}

      {isMulti && open ? (
        /* Floating overlay — positioned absolutely so the card itself never
         * grows or shifts the grid. Anchored flush to the bottom edge of
         * the match box (`top: 100%`, no top margin) so there's no dead
         * zone between trigger and overlay where the cursor could trigger
         * a stray mouseleave on hover-to-expand. Mirrors the box's variant
         * chrome (border + tint) so it reads as a continuation of the
         * footer, plus a soft shadow to lift it off whatever's beneath. */
        <ul
          role="list"
          className={cn(
            "absolute left-0 right-0 top-full z-30 overflow-hidden rounded border shadow-lg",
            variant === "perfect"
              ? "border-primary bg-card"
              : "border-border bg-card",
          )}
        >
          {matchedItems.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5",
                "transition-colors hover:bg-foreground/5",
                "[&:not(:last-child)]:border-b [&:not(:last-child)]:border-border/40",
              )}
            >
              {/* 36×36 thumbnail — uses the same rounded radius as cards
                  elsewhere (rounded-md ≈ 6px) for visual continuity. */}
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="truncate text-[10px] text-muted-foreground">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function TradeInterestCard(props: TradeInterestCardProps) {
  if (props.type === "perfect") {
    return (
      <PerfectMatchLayout
        match={props.data}
        showScoreOnboarding={props.showScoreOnboarding ?? false}
        matchedItems={props.matchedItems ?? []}
      />
    )
  }

  return (
    <InboundInterestLayout
      interest={props.data}
      showScoreOnboarding={props.showScoreOnboarding ?? false}
      matchedItems={props.matchedItems ?? []}
    />
  )
}

function PerfectMatchLayout({
  match,
  showScoreOnboarding,
  matchedItems,
}: {
  match: PerfectMatch
  showScoreOnboarding: boolean
  matchedItems: TradeableItemSummary[]
}) {
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const groups = match.their_item.published_groups ?? []
  const niche = match.their_item.niche
  const href = `/${match.their_item.type === "listing" ? "listings" : "collection"}/${match.their_item.id}`

  /* `overflow-hidden` used to live on this outer wrapper to clip the
   * image's `group-hover:scale-105`. We've pushed that clip down onto
   * the image container so the floating multi-match overlay (rendered
   * inside MatchFooter, anchored at `top: 100%`) can escape the card
   * without being chopped. The card itself stays at a fixed height,
   * and every ancestor on the path from the card root down to the
   * match box (card root → body wrapper → MatchFooter root) is
   * `overflow: visible` so the floating list never gets clipped. */
  return (
    <div className="group relative rounded-lg border border-border bg-card transition-all hover:border-primary/50">
      <Link href={href}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <Image
            src={match.their_item.images[0] || "/placeholder.svg"}
            alt={match.their_item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="space-y-1.5 p-3">
        <div>
          <Link href={href}>
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {match.their_item.title}
            </h3>
            {match.their_item.subtitle ? (
              <p className="truncate text-xs text-muted-foreground">
                {match.their_item.subtitle}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {typeof match.their_item.price === "number" ? (
              <p className="text-sm font-semibold text-primary">
                ${match.their_item.price.toLocaleString('en-US')}
              </p>
            ) : null}
            <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {match.their_item.user?.location ? (
            <p className="text-[10px] text-muted-foreground">
              {match.their_item.user.location}
            </p>
          ) : null}
        </div>

        {groups.length > 0 ? (
          <div className="pt-1">
            <GroupChips
              groups={groups}
              expanded={groupsExpanded}
              onToggle={() => setGroupsExpanded((value) => !value)}
            />
          </div>
        ) : niche ? (
          <div className="pt-0">
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {niche.icon ? <span>{niche.icon}</span> : null}
              <span className="max-w-[120px] truncate">{niche.name}</span>
            </span>
          </div>
        ) : null}

        <MatchFooter
          variant="perfect"
          singleLeadingLabel="Trade match for your"
          multiLeadingLabel="Trade match for"
          fallbackItemTitle={match.my_item.title}
          matchedItems={matchedItems}
          Icon={Repeat2Icon}
          iconClassName="text-primary"
          matchScore={match.match_score}
          showScoreOnboarding={showScoreOnboarding}
        />
      </div>
    </div>
  )
}

function InboundInterestLayout({
  interest,
  showScoreOnboarding,
  matchedItems,
}: {
  interest: InboundInterest
  showScoreOnboarding: boolean
  matchedItems: TradeableItemSummary[]
}) {
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const groups = interest.their_item.published_groups ?? []
  const niche = interest.their_item.niche
  const href = `/${interest.their_item.type === "listing" ? "listings" : "collection"}/${interest.their_item.id}`

  /* See PerfectMatchLayout for why `overflow-hidden` migrated off the
   * outer wrapper onto the image container, and why every ancestor of
   * the match box stays `overflow: visible`. */
  return (
    <div className="group relative rounded-lg border border-border bg-card transition-all hover:border-primary/50">
      <Link href={href}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <Image
            src={interest.their_item.images[0] || "/placeholder.svg"}
            alt={interest.their_item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="space-y-1.5 p-3">
        <div>
          <Link href={href}>
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {interest.their_item.title}
            </h3>
            {interest.their_item.subtitle ? (
              <p className="truncate text-xs text-muted-foreground">
                {interest.their_item.subtitle}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {typeof interest.their_item.price === "number" ? (
              <p className="text-sm font-semibold text-primary">
                ${interest.their_item.price.toLocaleString('en-US')}
              </p>
            ) : null}
            <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {interest.their_item.user?.location ? (
            <p className="text-[10px] text-muted-foreground">
              {interest.their_item.user.location}
            </p>
          ) : null}
        </div>

        {groups.length > 0 ? (
          <div className="pt-1">
            <GroupChips
              groups={groups}
              expanded={groupsExpanded}
              onToggle={() => setGroupsExpanded((value) => !value)}
            />
          </div>
        ) : niche ? (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {niche.icon ? <span>{niche.icon}</span> : null}
              <span className="max-w-[120px] truncate">{niche.name}</span>
            </span>
          </div>
        ) : null}

        <MatchFooter
          variant="inbound"
          singleLeadingLabel="Interested in your"
          multiLeadingLabel="Interested in"
          fallbackItemTitle={interest.my_item.title}
          matchedItems={matchedItems}
          Icon={ArrowRightFromLineIcon}
          iconClassName="text-muted-foreground"
          matchScore={interest.match_score}
          showScoreOnboarding={showScoreOnboarding}
        />
      </div>
    </div>
  )
}
