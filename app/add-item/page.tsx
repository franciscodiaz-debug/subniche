import { PageShell } from "@/components/layout/page-shell";
import { AddItemFlow } from "@/components/add-item/add-item-flow";
import { SectionHeader } from "@/components/ui/section-header";
import {
  mockCategories,
  mockCollections,
  mockCommunities,
  mockListings,
  mockNiches,
} from "@/data/mock";

export default function AddItemPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Add item"
        title="List it, trade it, or add it to your collection."
        description="Add the item once, then decide where it belongs - for sale, for trade, in your collection, or on your wanted list."
      />
      <AddItemFlow
        categories={mockCategories}
        collections={mockCollections}
        communities={mockCommunities}
        niches={mockNiches}
        sampleImages={mockListings.slice(0, 6).map((listing) => ({
          alt: listing.title,
          src: listing.imageUrl ?? listing.images[0],
        }))}
      />
    </PageShell>
  );
}
