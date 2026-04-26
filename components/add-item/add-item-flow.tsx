"use client";

import { useMemo, useState } from "react";
import { CollectionFields } from "@/components/add-item/collection-fields";
import { ItemBasicsStep } from "@/components/add-item/item-basics-step";
import { ItemMediaStep } from "@/components/add-item/item-media-step";
import { PublishingContextFields } from "@/components/add-item/publishing-context-fields";
import { ReviewPanel } from "@/components/add-item/review-panel";
import { SaleFields } from "@/components/add-item/sale-fields";
import { StatusSelector } from "@/components/add-item/status-selector";
import { TradeFields } from "@/components/add-item/trade-fields";
import type {
  CollectionState,
  ItemBasicsState,
  ItemMode,
  OwnedStatusState,
  PublishingState,
  SaleState,
  SampleImage,
  TradeState,
  WantedState,
} from "@/components/add-item/types";
import { WishlistFields } from "@/components/add-item/wishlist-fields";
import type {
  MockCategory,
  MockCollection,
  MockCommunity,
  MockNiche,
} from "@/data/mock";
import { cn } from "@/lib/utils";

type AddItemFlowProps = {
  categories: MockCategory[];
  collections: MockCollection[];
  communities: MockCommunity[];
  niches: MockNiche[];
  sampleImages: SampleImage[];
};

export function AddItemFlow({
  categories,
  collections,
  communities,
  niches,
  sampleImages,
}: AddItemFlowProps) {
  const [mode, setMode] = useState<ItemMode>("owned");
  const [statuses, setStatuses] = useState<OwnedStatusState>({
    forSale: false,
    forTrade: false,
    inCollection: true,
  });
  const [basics, setBasics] = useState<ItemBasicsState>({
    title: "",
    description: "",
    nicheId: niches[0]?.id ?? "",
    categoryId: categories[0]?.id ?? "",
    condition: "Excellent",
    brand: "",
    model: "",
    year: "",
    location: "Portland, OR",
  });
  const [selectedImage, setSelectedImage] = useState(sampleImages[0]?.src ?? "");
  const [sale, setSale] = useState<SaleState>({
    price: "",
    acceptsOffers: true,
    fulfillment: "local",
  });
  const [trade, setTrade] = useState<TradeState>({
    acceptedCategoryIds: [categories[0]?.id ?? ""].filter(Boolean),
    notes: "",
    cashPreference: "either-way",
  });
  const [collection, setCollection] = useState<CollectionState>({
    collectionId: collections[0]?.id ?? "",
    visibility: "public",
    note: "",
  });
  const [wanted, setWanted] = useState<WantedState>({
    idealCondition: "Any clean example",
    targetPrice: "",
    notes: "",
    visibility: "public",
  });
  const [publishing, setPublishing] = useState<PublishingState>({
    publicMarket: true,
    communityIds: [communities[1]?.id ?? ""].filter(Boolean),
  });

  const activeStatuses = useMemo(
    () =>
      mode === "wanted"
        ? { forSale: false, forTrade: false, inCollection: false }
        : statuses,
    [mode, statuses],
  );

  const handleModeChange = (nextMode: ItemMode) => {
    setMode(nextMode);
    if (nextMode === "wanted") {
      setStatuses({ forSale: false, forTrade: false, inCollection: false });
      setPublishing({ publicMarket: true, communityIds: [] });
      return;
    }
    setStatuses((current) =>
      current.forSale || current.forTrade || current.inCollection
        ? current
        : { ...current, inCollection: true },
    );
  };

  return (
    <div className="space-y-6">
      <StatusSelector
        mode={mode}
        statuses={activeStatuses}
        onModeChange={handleModeChange}
        onStatusesChange={setStatuses}
      />

      <CategoryStrip
        categories={categories}
        selectedCategoryId={basics.categoryId}
        onCategoryChange={(categoryId) =>
          setBasics((current) => ({ ...current, categoryId }))
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <main className="space-y-6">
          <ItemBasicsStep
            basics={basics}
            categories={categories}
            niches={niches}
            onChange={setBasics}
          />
          {mode === "owned" && activeStatuses.forSale ? (
            <SaleFields sale={sale} onChange={setSale} />
          ) : null}
          {mode === "owned" && activeStatuses.forTrade ? (
            <TradeFields
              categories={categories}
              trade={trade}
              onChange={setTrade}
            />
          ) : null}
          {mode === "owned" && activeStatuses.inCollection ? (
            <CollectionFields
              collection={collection}
              collections={collections}
              onChange={setCollection}
            />
          ) : null}
          {mode === "wanted" ? (
            <WishlistFields wanted={wanted} onChange={setWanted} />
          ) : null}
          <PublishingContextFields
            communities={communities}
            publishing={publishing}
            onChange={setPublishing}
          />
        </main>
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <ItemMediaStep
            images={sampleImages}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
          />
          <ReviewPanel
            basics={basics}
            collection={collection}
            collections={collections}
            communities={communities}
            mode={mode}
            publishing={publishing}
            sale={sale}
            selectedImage={selectedImage}
            statuses={activeStatuses}
            trade={trade}
            wanted={wanted}
          />
        </aside>
      </div>
    </div>
  );
}

function CategoryStrip({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: {
  categories: MockCategory[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
}) {
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const parentLabel = selectedCategory?.name.includes("Guitar")
    ? "Guitars"
    : "Music Gear";
  const childLabel = selectedCategory?.name.replace(" Guitars", "") ?? "Other";

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 text-sm font-medium text-muted-foreground">
        Category
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {parentLabel}
        </span>
        <span className="text-2xl text-muted-foreground" aria-hidden="true">
          /
        </span>
        {categories.map((category) => {
          const active = category.id === selectedCategoryId;
          const label = category.name.replace(" Guitars", "");

          return (
            <button
              key={category.id}
              type="button"
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-border bg-background text-muted-foreground hover:border-accent/45 hover:text-foreground",
              )}
              onClick={() => onCategoryChange(category.id)}
            >
              {active ? childLabel : label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
