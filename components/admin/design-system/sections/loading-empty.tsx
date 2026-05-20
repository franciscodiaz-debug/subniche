"use client"

import { Package, Search, Tag } from "lucide-react"

import {
  CollectionCardGridSkeleton,
  EmptyState,
  ItemCardGridSkeleton,
  ItemCardScrollerSkeleton,
  RowListSkeleton,
} from "@/components/loading/skeletons"
import { Button } from "@/components/ui/button"

import { DSSection } from "../ds-section"

export function LoadingEmptySection() {
  return (
    <div className="space-y-12">
      <DSSection id="custom-skeletons" title="Skeletons" source="Custom">
        <div className="space-y-8">
          <Block
            label="ItemCard grid"
            description="Placeholder for any feed of listings (home, market, profile listings). Aspect 4:3 image + two text lines + chip."
          >
            <ItemCardGridSkeleton count={4} />
          </Block>

          <Block
            label="ItemCard horizontal scroller"
            description="Placeholder for the horizontal feed sections used on home (Trending, Just Listed, etc.)."
          >
            <ItemCardScrollerSkeleton count={5} />
          </Block>

          <Block
            label="CollectionCard grid"
            description="Placeholder for collection feeds. 2×2 image mosaic + two text lines."
          >
            <CollectionCardGridSkeleton count={3} />
          </Block>

          <Block
            label="Row list"
            description="Placeholder for any list view (my-stuff list, search results in row mode)."
          >
            <RowListSkeleton count={3} />
          </Block>

          <SimUsageNote />
        </div>
      </DSSection>

      <DSSection id="custom-empty-states" title="Empty States" source="Custom">
        <div className="space-y-8">
          <Block
            label="Minimal"
            description="Title only — useful when the surrounding context already explains what should be there."
          >
            <EmptyState
              title="No items yet"
              body="Items you list for sale or trade will appear here."
            />
          </Block>

          <Block
            label="With icon + action"
            description="Use the CTA when there is a clear next step the user can take."
          >
            <EmptyState
              icon={<Package className="h-10 w-10" />}
              title="Nothing in your watchlist"
              body="Save items from the market to follow them. You'll get notified when their status changes."
              action={<Button size="sm">Browse market</Button>}
            />
          </Block>

          <Block
            label="Search result"
            description="Specific copy for empty search; suggest a recovery path."
          >
            <EmptyState
              icon={<Search className="h-10 w-10" />}
              title="No matches"
              body="Try a different search term or browse a niche directly."
            />
          </Block>

          <Block
            label="Listings (sample variant)"
            description="Same EmptyState component, different icon — use the most semantic icon for the surface."
          >
            <EmptyState
              icon={<Tag className="h-10 w-10" />}
              title="No items for sale"
              body="List an item to show it in the public sale and trade view."
            />
          </Block>
        </div>
      </DSSection>
    </div>
  )
}

function Block({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="rounded-lg border border-border/60 bg-background/40 p-4">{children}</div>
    </div>
  )
}

function SimUsageNote() {
  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
      <p className="mb-2 font-semibold uppercase tracking-wider text-primary">
        How to preview live
      </p>
      <p>
        On any page that uses these skeletons, append{" "}
        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-foreground">
          ?sim-loading=1
        </code>{" "}
        to force the loading state. Set a custom delay with{" "}
        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-foreground">
          ?sim-loading=3000
        </code>{" "}
        (milliseconds). Use{" "}
        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-foreground">?sim-empty=1</code>{" "}
        to force the empty state. Both flags are URL-only and off by default — no setup needed.
      </p>
    </div>
  )
}
