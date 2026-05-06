import { AddItemFlow } from "@/components/add-item/add-item-flow";
import { PageShell } from "@/components/layout/page-shell";
import {
  mockCategories,
  mockCollections,
  mockCommunities,
  mockListings,
  mockNiches,
} from "@/data/mock";

export function AddItemPage() {
  return (
    <PageShell className="max-w-none space-y-5 lg:px-8 lg:pt-4 xl:px-8">
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
