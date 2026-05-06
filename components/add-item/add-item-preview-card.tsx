import { ListingCard } from "@/components/listing/listing-card";
import type {
  ItemBasicsState,
  ItemMode,
  OwnedStatusState,
  PublishingState,
  SaleState,
  TradeState,
  WantedState,
} from "@/components/add-item/types";
import type { MockCommunity } from "@/data/mock";

type AddItemPreviewCardProps = {
  basics: ItemBasicsState;
  communities: MockCommunity[];
  mode: ItemMode;
  publishing: PublishingState;
  sale: SaleState;
  selectedImage: string;
  statuses: OwnedStatusState;
  trade: TradeState;
  wanted: WantedState;
};

export function AddItemPreviewCard({
  basics,
  communities,
  mode,
  publishing,
  sale,
  selectedImage,
  statuses,
  trade,
  wanted,
}: AddItemPreviewCardProps) {
  const selectedCommunities = communities
    .filter((community) => publishing.communityIds.includes(community.id))
    .map((community) => community.name);
  const title =
    basics.title.trim() || (mode === "wanted" ? "Wanted item" : "Untitled item");
  const subtitle = basics.subtitle || [basics.brand, basics.model, basics.year]
    .filter(Boolean)
    .join(" ");
  const price =
    mode === "wanted"
      ? wanted.targetPrice
        ? `Target $${wanted.targetPrice}`
        : undefined
      : sale.price
        ? `$${sale.price}`
        : undefined;
  const priceMode =
    mode === "wanted"
      ? "wanted"
      : statuses.forSale && statuses.forTrade
        ? "cashPlusTrade"
        : statuses.forTrade
          ? "tradePreferred"
          : "cash";

  return (
    <ListingCard
      id="preview-listing"
      title={title}
      subtitle={subtitle || basics.description || "Preview updates as you type."}
      imageUrl={selectedImage}
      price={price}
      priceMode={priceMode}
      location={basics.location}
      sellerName="Kyle K"
      statuses={
        mode === "wanted"
          ? { wishlist: true }
          : {
              forSale: statuses.forSale,
              forTrade: statuses.forTrade,
              inCollection: statuses.inCollection,
            }
      }
      condition={basics.condition}
      communityContext={[
        ...(publishing.publicMarket ? ["Public Market"] : []),
        ...selectedCommunities,
      ]}
      tradeSummary={
        mode === "owned" && statuses.forTrade
          ? trade.notes || "Trade criteria will appear here."
          : undefined
      }
    />
  );
}
