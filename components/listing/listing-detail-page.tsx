import { Check, Flag } from "lucide-react";
import { ListingActionPanel } from "@/components/listing/listing-action-panel";
import { ListingAttributes } from "@/components/listing/listing-attributes";
import { ListingDetailHeader } from "@/components/listing/listing-detail-header";
import { ListingImageGallery } from "@/components/listing/listing-image-gallery";
import { ListingPublishingContext } from "@/components/listing/listing-publishing-context";
import { RelatedListings } from "@/components/listing/related-listings";
import { TradeInterestPanel } from "@/components/listing/trade-interest-panel";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMockCategoryById,
  getMockNicheById,
  getMockProfileById,
  getMockTradeInterestsForListing,
  getMockTradeOpportunitiesForListing,
  getRelatedMockListings,
  getSellerListingStats,
} from "@/data/mock";
import type { MockListing } from "@/data/mock/types";

type ListingDetailPageProps = {
  listing: MockListing;
};

export function ListingDetailPage({ listing }: ListingDetailPageProps) {
  const seller = getMockProfileById(listing.sellerId);
  const category = getMockCategoryById(listing.categoryId);
  const niche = getMockNicheById(listing.nicheId);
  const tradeInterests = getMockTradeInterestsForListing(listing.id);
  const tradeOpportunities = getMockTradeOpportunitiesForListing(listing.id);
  const relatedListings = getRelatedMockListings(listing);
  const sellerStats = getSellerListingStats(listing.sellerId);

  return (
    <PageShell className="max-w-none space-y-6 pb-44 lg:px-8 lg:py-6 lg:pb-6 xl:px-12">
      <div className="grid gap-8 xl:grid-cols-[minmax(360px,492px)_minmax(0,1fr)] xl:items-start">
        <main className="space-y-6">
          <ListingDetailHeader
            listing={listing}
            category={category}
            niche={niche}
          />

          <div className="hidden space-y-4 xl:block">
            <ListingActionPanel
              listing={listing}
              seller={seller}
              listingCount={sellerStats.listingCount}
            />
            <ListingPublishingContext listing={listing} />
          </div>

          <div className="xl:hidden">
            <ListingImageGallery images={listing.images} title={listing.title} />
          </div>

          <div className="space-y-4 xl:hidden">
            <ListingActionPanel
              listing={listing}
              seller={seller}
              listingCount={sellerStats.listingCount}
              showMobileDock
            />
            <ListingPublishingContext listing={listing} />
            <ListingCommerceCard listing={listing} />
          </div>

          <DescriptionCard description={listing.description} />
          <ListingAttributes
            listing={listing}
            category={category}
            niche={niche}
          />
          <TradeInterestPanel
            listing={listing}
            interests={tradeInterests}
            opportunities={tradeOpportunities}
          />
          <RelatedListings listings={relatedListings} />
        </main>

        <aside className="hidden xl:block xl:pt-[68px]">
          <div className="sticky top-6 space-y-4">
            <ListingImageGallery images={listing.images} title={listing.title} />
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <Flag className="size-3.5" aria-hidden="true" />
                Report listing
              </button>
            </div>
            <ListingCommerceCard listing={listing} />
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function ListingCommerceCard({ listing }: { listing: MockListing }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-6 p-5">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Payment</h2>
          <CommerceLine label="Cash" />
          <CommerceLine label="PayPal - Goods and Services" />
          <CommerceLine label="Venmo" />
        </section>
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Shipping</h2>
          <CommerceLine
            label={`Local pickup${listing.location ? ` - ${listing.location}` : ""}`}
          />
          <CommerceLine label="Shipping - $85" />
        </section>
        <section className="border-t border-border pt-5">
          <h2 className="text-sm font-semibold text-foreground">
            Return Policy
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            48-hour approval window from delivery. If it is not as described,
            return it in the same condition for a refund minus return shipping.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

function CommerceLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Check className="size-4 text-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function DescriptionCard({ description }: { description?: string }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">
          {description || "No detailed notes yet."}
        </p>
      </CardContent>
    </Card>
  );
}
