"use client"

import { TokensSection } from "./sections/tokens"
import { ShadcnSection } from "./sections/shadcn-components"
import { CustomSection } from "./sections/custom-components"

const nav = [
  {
    group: "Foundation",
    id: "tokens-root",
    items: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "spacing", label: "Spacing" },
      { id: "radii-shadows", label: "Radii & Shadows" },
    ],
  },
  {
    group: "shadcn/ui",
    id: "shadcn-root",
    items: [
      { id: "shadcn-buttons", label: "Button" },
      { id: "shadcn-badge", label: "Badge" },
      { id: "shadcn-alert", label: "Alert" },
      { id: "shadcn-feedback", label: "Progress · Skeleton · Spinner" },
      { id: "shadcn-avatar", label: "Avatar" },
      { id: "shadcn-form", label: "Form Elements" },
      { id: "shadcn-card", label: "Card" },
      { id: "shadcn-separator", label: "Separator" },
      { id: "shadcn-overlays", label: "Overlays" },
      { id: "shadcn-dropdown", label: "DropdownMenu" },
      { id: "shadcn-command", label: "Command" },
      { id: "shadcn-tabs", label: "Tabs" },
      { id: "shadcn-accordion", label: "Accordion" },
      { id: "shadcn-scroll-area", label: "ScrollArea" },
      { id: "shadcn-table", label: "Table" },
      { id: "shadcn-breadcrumb", label: "Breadcrumb" },
      { id: "shadcn-pagination", label: "Pagination" },
      { id: "shadcn-toggle", label: "Toggle" },
    ],
  },
  {
    group: "Custom",
    id: "custom-root",
    items: [
      { id: "custom-logo", label: "SubnicheLogo" },
      { id: "custom-item-card", label: "ItemCard" },
      { id: "custom-collection-card", label: "CollectionCard" },
      { id: "custom-listing-card", label: "ListingCard" },
      { id: "custom-discover-card", label: "DiscoverListingCard" },
      { id: "custom-my-item-card", label: "MyItemCard" },
      { id: "custom-action-card", label: "ActionCard" },
      { id: "custom-home-utils", label: "Home Utilities" },
      { id: "custom-onboarding", label: "OnboardingChecklist" },
      { id: "custom-shared", label: "MarketTabs · GridDensity" },
    ],
  },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function DesignSystemPage() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Design System</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visual reference for all design tokens and components used in SubNiche.{" "}
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
              shadcn/ui
            </span>
            = shadcn/ui primitive ·{" "}
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Custom
            </span>
            = custom component
          </span>
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sticky sidebar nav */}
        <aside className="sticky top-0 h-fit w-52 shrink-0 space-y-5">
          {nav.map((group) => (
            <div key={group.group}>
              <button
                type="button"
                onClick={() => scrollTo(group.id)}
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {group.group}
              </button>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(item.id)}
                      className="w-full truncate rounded-md px-2 py-1 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-16 pb-16">
          <div>
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Foundation
            </h2>
            <TokensSection />
          </div>

          <div>
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              shadcn/ui Components
            </h2>
            <ShadcnSection />
          </div>

          <div>
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Custom Components
            </h2>
            <CustomSection />
          </div>
        </div>
      </div>
    </div>
  )
}
