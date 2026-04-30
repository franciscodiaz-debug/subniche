import { DevInfoDrawer } from "@/components/shared/dev-info-drawer"
import { TradeContent } from "@/components/trade/trade-content"

export const metadata = {
  title: "Trade — SubNiche",
  description:
    "Discover trade opportunities for your items. Browse perfect matches and inbound interests from your communities.",
}

export default function TradePage() {
  return (
    <>
      <TradeContent />
      <DevInfoDrawer
        status="DEV"
        module="Market · Trade"
        version="v3.2.0"
        lastSaved="2026-04-29"
        changeLog={[
          "Initial Trade module scaffolded from Market/Trade Screen Kit.",
          "Combined perfect matches + inbound interest with match-score sort.",
          "Trade item selector filters feed by my_item_id.",
          "Trade Interests sections unified across All-items and individual-item views to 'Global' / 'Individual'.",
          "Replaced the static 'for [item title]' subheading with the same TradeItemSelector used on the Trade grid, mounted in a 'For' row beneath the H1.",
          "Empty-state copy unified to 'No interests here yet.' across both sections in both views.",
          "Added 'Add existing' picker to pull authored interests into a single item without retyping.",
          "Single creation entry point in the header (rectangular primary button, label 'New Interest').",
          "Multi-match cards expand on hover after a 250ms intent delay (cancels if the cursor leaves early) and collapse the moment the cursor leaves. Click toggle preserved for touch and keyboard users.",
          "Match-overlay flush against the trigger row (removed mt-1 gap) to eliminate a hover dead zone between the footer and the floating list.",
          "Trade Interests row chrome lightened: dropped per-list card border/bg in favor of hairline dividers, added a leading swap icon, parenthesized listing count, and a chevron toggle. Title hovers to primary. Two distinct expand modes — chevron/title opens a lightweight pill-chip detail view (Category, Brand, Era, Budget, etc.) while the pencil icon opens the full editor as before.",
          "Seeded four global trade interests (Premium electric guitars, Vintage tube amplifiers, Pro studio gear, Rare effects pedals) so the Global section has scannable content on first paint.",
          "Both Global and Individual sections gained controlled expand/collapse via a chevron beside the section title; collapse state is parent-tracked so it survives unrelated re-renders (e.g. opening an interest editor).",
        ]}
        masterIndexHref="/"
      />
    </>
  )
}
