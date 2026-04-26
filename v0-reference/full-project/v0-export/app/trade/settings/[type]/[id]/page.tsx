import { TradeSettingsContent } from "@/components/trade/trade-settings-content"

interface TradeSettingsPageProps {
  params: Promise<{
    type: string
    id: string
  }>
}

export default async function TradeSettingsPage({ params }: TradeSettingsPageProps) {
  const { type, id } = await params

  return <TradeSettingsContent itemType={type as "listing" | "collection_item"} itemId={id} />
}
