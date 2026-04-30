import { MarketContent } from "@/components/market/market-content"
import { DevInfoDrawer } from "@/components/shared/dev-info-drawer"

export const metadata = {
  title: "Market — SubNiche",
  description:
    "Browse listings from your communities. Filter by category, brand, condition, and price.",
}

export default function MarketPage() {
  return (
    <>
      <MarketContent />
      <DevInfoDrawer
        status="DEV"
        module="Market · For Sale"
        version="v0.1"
        lastSaved="2026-04-24"
        changeLog={[
          "Initial Market module scaffolded from Market/Trade Screen Kit.",
          "Filter sidebar, histogram slider, grid density selector wired up.",
          "Onboarding tour gated by localStorage key subniche.onboarding.market.v1.",
        ]}
        masterIndexHref="/"
      />
    </>
  )
}
