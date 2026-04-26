"use client";

import { CheckCircle2, Circle, Save } from "lucide-react";
import { AddItemPreviewCard } from "@/components/add-item/add-item-preview-card";
import type {
  CollectionState,
  ItemBasicsState,
  ItemMode,
  OwnedStatusState,
  PublishingState,
  SaleState,
  TradeState,
  WantedState,
} from "@/components/add-item/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MockCollection, MockCommunity } from "@/data/mock";

type ReviewPanelProps = {
  basics: ItemBasicsState;
  collection: CollectionState;
  collections: MockCollection[];
  communities: MockCommunity[];
  mode: ItemMode;
  publishing: PublishingState;
  sale: SaleState;
  selectedImage: string;
  statuses: OwnedStatusState;
  trade: TradeState;
  wanted: WantedState;
};

export function ReviewPanel(props: ReviewPanelProps) {
  const {
    basics,
    collection,
    collections,
    communities,
    mode,
    publishing,
    sale,
    selectedImage,
    statuses,
    trade,
    wanted,
  } = props;
  const selectedCollection = collections.find(
    (item) => item.id === collection.collectionId,
  );
  const selectedCommunities = communities.filter((community) =>
    publishing.communityIds.includes(community.id),
  );
  const checklist = [
    { label: "Title", complete: Boolean(basics.title.trim()) },
    { label: "Image", complete: Boolean(selectedImage) },
    {
      label: mode === "wanted" ? "Wanted details" : "Owned status",
      complete:
        mode === "wanted" ||
        statuses.forSale ||
        statuses.forTrade ||
        statuses.inCollection,
    },
    {
      label: "Trade criteria",
      complete: !statuses.forTrade || trade.acceptedCategoryIds.length > 0,
    },
    {
      label: "Publishing context",
      complete: publishing.publicMarket || publishing.communityIds.length > 0,
    },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <AddItemPreviewCard {...props} />
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">
            Review summary
          </h2>
          <Badge variant={mode === "wanted" ? "warning" : "secondary"}>
            {mode === "wanted" ? "Wanted mode" : "Owned item"}
          </Badge>
        </div>
        <div className="mt-4 space-y-2">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              {item.complete ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <Circle className="size-4" />
              )}
              {item.label}
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 text-sm text-muted-foreground">
          {mode === "owned" && statuses.forSale ? (
            <p>Sale: {sale.price ? `$${sale.price}` : "price recommended"}</p>
          ) : null}
          {mode === "owned" && statuses.inCollection ? (
            <p>Collection: {selectedCollection?.title ?? "Not selected"}</p>
          ) : null}
          {mode === "wanted" ? (
            <p>
              Wanted: {wanted.idealCondition}
              {wanted.targetPrice ? `, target $${wanted.targetPrice}` : ""}
            </p>
          ) : null}
          <p>
            Contexts:{" "}
            {[publishing.publicMarket ? "Public Market" : null, ...selectedCommunities.map((community) => community.name)]
              .filter(Boolean)
              .join(", ") || "None selected"}
          </p>
        </div>
        <Dialog>
          <DialogTrigger
            className={buttonVariants({
              className: "mt-5 w-full",
              variant: "primary",
            })}
          >
            <Save className="size-4" aria-hidden="true" />
            Save item
          </DialogTrigger>
          <DialogContent aria-label="Demo only">
            <DialogHeader>
              <DialogTitle>Demo only</DialogTitle>
              <DialogDescription>
                This prototype shows the save moment, but the item is not saved
                yet. Backend storage, image upload, and auth will connect later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <span className="text-sm text-muted-foreground">
                Nothing was persisted.
              </span>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
