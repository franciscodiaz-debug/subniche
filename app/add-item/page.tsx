import { ArrowRight, Plus, Sparkles } from "lucide-react";
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
    <PageShell className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Plus className="size-8 text-accent" aria-hidden="true" />
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Add Item
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled>
            <Sparkles className="size-4" aria-hidden="true" />
            AI Assist
          </Button>
          <Button variant="secondary">Save Draft</Button>
          <a href="#review-panel" className={buttonVariants()}>
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
