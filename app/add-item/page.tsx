import { ArrowRight, ImagePlus, Plus, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { AddItemFlow } from "@/components/add-item/add-item-flow";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  mockCategories,
  mockCollections,
  mockCommunities,
  mockListings,
  mockNiches,
} from "@/data/mock";

export default function AddItemPage() {
  return (
    <PageShell className="max-w-none space-y-8 lg:px-12">
      <header className="flex flex-col gap-5 border-b border-border pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <Plus className="size-9 text-primary" aria-hidden="true" />
            <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
              Add Item
            </h1>
          </div>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Build the listing, collection record, or wanted post in one place.
            Status, publishing context, photos, and trust details stay visible
            as you work.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="rounded-full bg-transparent" disabled>
            <Sparkles className="size-4" aria-hidden="true" />
            AI Assist
          </Button>
          <Button variant="outline" className="rounded-full bg-transparent">
            <ImagePlus className="size-4" aria-hidden="true" />
            Save Draft
          </Button>
          <a
            href="#review-panel"
            className={buttonVariants({
              variant: "primary",
              className: "rounded-full",
            })}
          >
            Add Item
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </header>
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
