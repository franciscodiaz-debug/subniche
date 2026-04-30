import Link from "next/link"

import { ListingDetailView } from "@/components/listing-detail/listing-detail-view"
import {
  getAllMockListingIds,
  getMockListing,
} from "@/lib/mock-listing-detail"

/**
 * Listing detail route.
 *
 * Accepts an `[id]` param which is looked up in the mock store. The four
 * demo listings exposed by `getAllMockListingIds()` exercise the state
 * variants called out in the spec — viewer with mutual match, viewer with
 * no match, collection-only, and owner view. Any unknown id falls through
 * to `notFound()`, which our custom 404 below catches to offer a list of
 * the known demo ids so reviewers can navigate between states.
 */

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = getMockListing(id)

  if (!listing) {
    // Fall back to a helpful prototype index so the page is self-navigable
    // when someone lands on `/listings/anything` out of the wild.
    return <UnknownListing />
  }

  return <ListingDetailView listing={listing} />
}

function UnknownListing() {
  const ids = getAllMockListingIds()
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Prototype demo
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          That listing isn&apos;t wired up yet.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          This is a prototype workspace. Pick one of the demo state variants
          below to preview the published listing layout.
        </p>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {ids.map((id) => (
          <li key={id}>
            <Link
              href={`/listings/${id}`}
              className="flex items-center justify-between gap-4 rounded-card border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60"
            >
              <span>{id}</span>
              <span className="text-xs text-muted-foreground">View →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Metadata is generated per-id so shared links preview the right title.
 */
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const listing = getMockListing(id)
  if (!listing) {
    return { title: "Listing not found · SubNiche" }
  }
  return {
    title: `${listing.title} · SubNiche`,
    description: listing.subtitle ?? listing.description.slice(0, 160),
  }
}


