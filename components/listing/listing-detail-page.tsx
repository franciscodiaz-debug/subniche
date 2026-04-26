import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CommunityContextBadge } from "@/components/community/community-context-badge";
import { ListingActionPanel } from "@/components/listing/listing-action-panel";
import { ListingAttributes } from "@/components/listing/listing-attributes";
import { ListingDetailHeader } from "@/components/listing/listing-detail-header";
import { ListingImageGallery } from "@/components/listing/listing-image-gallery";
import { RelatedListings } from "@/components/listing/related-listings";
import { TradeInterestPanel } from "@/components/listing/trade-interest-panel";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <PageShell className="max-w-none space-y-6 lg:px-12">
      <div>
        <Link
          href="/market"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Market
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,440px)] xl:items-start">
        <main className="space-y-6">
          <ListingDetailHeader
            listing={listing}
            category={category}
            niche={niche}
          />

          <div className="xl:hidden">
            <ListingImageGallery images={listing.images} title={listing.title} />
          </div>

          <div className="space-y-4 xl:hidden">
            <ListingActionPanel
              listing={listing}
              seller={seller}
              listingCount={sellerStats.listingCount}
            />
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
          <div className="lg:hidden">
            <PublishingContextCard listing={listing} />
          </div>
          <RelatedListings listings={relatedListings} />
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-4">
            <ListingImageGallery images={listing.images} title={listing.title} />
            <ListingActionPanel
              listing={listing}
              seller={seller}
              listingCount={sellerStats.listingCount}
            />
            <PublishingContextCard listing={listing} />
          </div>
        </aside>
      </div>
    </PageShell>
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

function PublishingContextCard({ listing }: { listing: MockListing }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Publishing context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {listing.publishingContexts.map((context) => (
            <CommunityContextBadge
              key={`${context.type}-${context.label}`}
              label={context.label}
              publicMarket={context.type === "public_market"}
            />
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          These badges show where the same listing is visible. Community markets
          are publishing contexts, not duplicate copies of the item.
        </p>
      </CardContent>
    </Card>
  );
}
