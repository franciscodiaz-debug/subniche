import { Suspense } from "react"

import { MarketContent } from "@/components/market/market-content"

export const metadata = {
  title: "Market — SubNiche",
  description:
    "Browse listings from your communities. Filter by category, brand, condition, and price.",
}

export default function MarketPage() {
  return (
    <Suspense fallback={null}>
      <MarketContent />
    </Suspense>
  )
}
