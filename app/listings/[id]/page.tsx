import { notFound } from "next/navigation";
import { ListingDetailPage } from "@/components/listing/listing-detail-page";
import { getMockListingById, mockListings } from "@/data/mock";

type ListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = getMockListingById(id);

  if (!listing) {
    notFound();
  }

  return <ListingDetailPage listing={listing} />;
}

export function generateStaticParams() {
  return mockListings.map((listing) => ({
    id: listing.id,
  }));
}
