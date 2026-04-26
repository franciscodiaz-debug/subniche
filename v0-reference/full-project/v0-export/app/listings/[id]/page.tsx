import { ListingDetail } from "@/components/listing-detail"
import { getDemoListing, demoListings } from "@/lib/demo-data"
import { notFound } from "next/navigation"

interface ListingPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params
  const listing = getDemoListing(id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <ListingDetail listing={listing} />
    </div>
  )
}

export async function generateStaticParams() {
  return demoListings.map((listing) => ({
    id: listing.id,
  }))
}
