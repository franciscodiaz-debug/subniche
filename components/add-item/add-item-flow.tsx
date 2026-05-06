"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Box,
  ChevronRight,
  CheckCircle2,
  CircleHelp,
  FolderOpen,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { CollectionFields } from "@/components/add-item/collection-fields";
import { ItemBasicsStep } from "@/components/add-item/item-basics-step";
import { ItemMediaStep } from "@/components/add-item/item-media-step";
import { SaleFields } from "@/components/add-item/sale-fields";
import { StatusSelector } from "@/components/add-item/status-selector";
import type {
  CollectionState,
  ItemBasicsState,
  ItemMode,
  OwnedStatusState,
  SaleState,
  SampleImage,
  WantedState,
  WishlistEntryMode,
} from "@/components/add-item/types";
import { WishlistFields } from "@/components/add-item/wishlist-fields";
import type {
  MockCategory,
  MockCollection,
  MockCommunity,
  MockNiche,
} from "@/data/mock";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useLocalStorageFlag } from "@/lib/use-local-storage-flag";

type AddItemFlowProps = {
  categories: MockCategory[];
  collections: MockCollection[];
  communities: MockCommunity[];
  niches: MockNiche[];
  sampleImages: SampleImage[];
};

const conditions = ["Mint", "Excellent", "Very Good", "Good", "Fair", "Project"];
const ADD_ITEM_TOUR_STORAGE_KEY = "purple-door-add-item-tour-dismissed";
const ADD_ITEM_TOUR_CHANGE_EVENT = "purple-door-add-item-tour-dismissed-change";

const tourSteps = [
  {
    target: "status",
    title: "Item Status",
    body: "Choose what you want to do with your item. You can select multiple.",
    action: "Next",
    bullets: [],
  },
  {
    target: "profile",
    title: "Your Profile",
    body: "This is how your profile appears to others. A more complete profile means more trust from other users.",
    action: "Next",
    bullets: [],
  },
  {
    target: "ai",
    title: "AI Assist",
    body: "Add a title, subtitle, and at least one photo, then AI can help fill in the rest.",
    action: "Get started",
    bullets: ["Title + Subtitle", "At least one photo"],
  },
] as const;

type TourTarget = (typeof tourSteps)[number]["target"];
type SubmissionFeedback = {
  body: string;
  missing?: string[];
  title: string;
  tone: "success" | "warning";
};

export function AddItemFlow({
  collections,
  sampleImages,
}: AddItemFlowProps) {
  const [mode, setMode] = useState<ItemMode>("owned");
  const [statuses, setStatuses] = useState<OwnedStatusState>({
    forSale: false,
    forTrade: false,
    inCollection: false,
  });
  const [basics, setBasics] = useState<ItemBasicsState>({
    title: "",
    subtitle: "",
    description: "",
    nicheId: "music-gear",
    categoryId: "",
    condition: "",
    conditionDetails: "",
    brand: "",
    model: "",
    year: "",
    location: "Portland, OR",
  });
  const [selectedImage, setSelectedImage] = useState("");
  const [sale, setSale] = useState<SaleState>({
    price: "",
    acceptsOffers: true,
    fulfillment: "local",
  });
  const [collection, setCollection] = useState<CollectionState>({
    collectionId: collections[0]?.id ?? "",
    visibility: "public",
    note: "",
    dateAcquired: "",
    acquisitionPrice: "",
  });
  const [wanted, setWanted] = useState<WantedState>({
    idealCondition: "Any clean example",
    sourceUrl: "",
    targetPrice: "",
    notes: "",
    visibility: "public",
  });
  const [wishlistEntryMode, setWishlistEntryMode] =
    useState<WishlistEntryMode>("choice");
  const [addItemTourDismissed, setAddItemTourDismissed] = useLocalStorageFlag(
    ADD_ITEM_TOUR_STORAGE_KEY,
    ADD_ITEM_TOUR_CHANGE_EVENT,
  );
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] =
    useState<SubmissionFeedback | null>(null);

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
      setWishlistEntryMode("choice");
      return;
    }
    setStatuses((current) => current);
  };

  const publishingFieldsActive =
    mode === "owned" && (activeStatuses.forSale || activeStatuses.forTrade);
  const showItemForm = mode === "owned" || wishlistEntryMode === "manual";
  const primaryActionLabel =
    mode === "wanted" ? "Add to Wishlist" : "Add Item";
  const missingRequirements = useMemo(() => {
    const missing: string[] = [];

    if (mode === "wanted" && wishlistEntryMode === "choice") {
      missing.push("Choose Add via URL or Enter Manually");
      return missing;
    }

    if (!basics.title.trim()) {
      missing.push("Title");
    }
    if (!selectedImage) {
      missing.push("At least one photo");
    }
    if (activeStatuses.forSale && !sale.price.trim()) {
      missing.push("Price");
    }
    if (
      mode === "wanted" &&
      !wanted.sourceUrl.trim() &&
      !wanted.targetPrice.trim()
    ) {
      missing.push("Wishlist source URL or target price");
    }

    return missing;
  }, [
    activeStatuses.forSale,
    basics.title,
    mode,
    sale.price,
    selectedImage,
    wanted.sourceUrl,
    wanted.targetPrice,
    wishlistEntryMode,
  ]);
  const publishSummary = useMemo(() => {
    if (mode === "wanted") {
      return {
        label: wanted.visibility === "public" ? "Public wishlist" : "Private wishlist",
        successTitle: "Wishlist item added",
        successBody:
          wanted.visibility === "public"
            ? "This wanted item is now visible from your public wishlist."
            : "This wanted item is saved privately in your wishlist.",
      };
    }

    const destinations: string[] = [];
    if (activeStatuses.inCollection) destinations.push("saved to your collection");
    if (activeStatuses.forSale) destinations.push("visible for sale");
    if (activeStatuses.forTrade) destinations.push("open to trade offers");

    if (destinations.length === 0) {
      return {
        label: "Private inventory",
        successTitle: "Private item added",
        successBody:
          "This item was added to My Stuff and is not visible to other users yet.",
      };
    }

    const body = destinations.join(", ").replace(/, ([^,]*)$/, " and $1");
    return {
      label:
        destinations.length === 1
          ? destinations[0]
          : `${destinations.length} destinations`,
      successTitle: "Item added",
      successBody: `${body.charAt(0).toUpperCase()}${body.slice(1)}.`,
    };
  }, [
    activeStatuses.forSale,
    activeStatuses.forTrade,
    activeStatuses.inCollection,
    mode,
    wanted.visibility,
  ]);
  const activeTourStep = addItemTourDismissed ? null : tourSteps[tourStepIndex];
  const tourHighlightClass = (target: TourTarget) =>
    activeTourStep?.target === target
      ? "relative z-50 rounded-xl ring-2 ring-primary ring-offset-4 ring-offset-background shadow-overlay"
      : "";
  const closeTour = () => {
    setAddItemTourDismissed(true);
  };
  const saveDraft = () => {
    setDraftSaved(true);
  };
  const handlePrimaryAction = () => {
    if (missingRequirements.length > 0) {
      setSubmissionFeedback({
        title: "A few details are still needed",
        body: "Fill these in before adding the item.",
        missing: missingRequirements,
        tone: "warning",
      });
      return;
    }

    setSubmissionFeedback({
      title: publishSummary.successTitle,
      body: publishSummary.successBody,
      tone: "success",
    });
  };

  useEffect(() => {
    if (!draftSaved) {
      return;
    }

    const timeout = window.setTimeout(() => setDraftSaved(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [draftSaved]);

  return (
    <div className="space-y-5">
      <header
        id="add-item-top"
        className="scroll-mt-6 flex flex-col gap-4 pb-2 xl:flex-row xl:items-center xl:justify-between"
      >
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Add Item
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          {draftSaved ? (
            <span
              role="status"
              className="rounded-full border border-success/35 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
            >
              Draft saved
            </span>
          ) : null}
          <div className={tourHighlightClass("ai")}>
            <Button variant="outline" className="rounded-lg bg-transparent" disabled>
              <Sparkles className="size-4" aria-hidden="true" />
              AI Assist
            </Button>
          </div>
          <div className="hidden md:block">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg bg-transparent"
              onClick={saveDraft}
            >
              <Save className="size-4" aria-hidden="true" />
              Save Draft
            </Button>
          </div>
          <div className="hidden md:block">
            <Button
              type="button"
              className="rounded-lg"
              onClick={handlePrimaryAction}
            >
              {primaryActionLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      {submissionFeedback ? (
        <AddItemSubmissionFeedback
          feedback={submissionFeedback}
          onDismiss={() => setSubmissionFeedback(null)}
        />
      ) : null}

      <div
        className={cn(
          "transition",
          activeTourStep?.target === "status" && "-m-3 bg-card p-3",
          tourHighlightClass("status"),
        )}
      >
        <StatusSelector
          mode={mode}
          statuses={activeStatuses}
          onModeChange={handleModeChange}
          onStatusesChange={setStatuses}
        />
      </div>

      {mode === "wanted" && wishlistEntryMode !== "manual" ? (
        <WishlistFields
          entryMode={wishlistEntryMode}
          wanted={wanted}
          onChange={setWanted}
          onEntryModeChange={setWishlistEntryMode}
        />
      ) : null}

      {showItemForm ? (
        <>
          <CategoryStrip
            selectedCategoryId={basics.categoryId}
            onCategoryChange={(categoryId) =>
              setBasics((current) => ({ ...current, categoryId }))
            }
          />

          <div className="xl:hidden">
            <ItemMediaStep
              images={sampleImages}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.9fr)]">
            <main className="space-y-4">
              <ItemBasicsStep
                basics={basics}
                price={sale.price}
                onChange={setBasics}
                onPriceChange={
                  activeStatuses.forSale
                    ? (price) => setSale((current) => ({ ...current, price }))
                    : undefined
                  }
                />
              <div
                className={cn(
                  "transition",
                  activeTourStep?.target === "profile" && "-m-2 p-2",
                  tourHighlightClass("profile"),
                )}
              >
                <ProfileContextCard />
              </div>
              <DescriptionPanel basics={basics} onChange={setBasics} />
              {activeStatuses.forSale ||
              activeStatuses.forTrade ||
              activeStatuses.inCollection ? (
                <ConditionPanel basics={basics} onChange={setBasics} />
              ) : null}
              <SpecificationsPanel basics={basics} onChange={setBasics} />
            </main>
            <aside className="space-y-4">
              <div className="hidden xl:block">
                <ItemMediaStep
                  images={sampleImages}
                  selectedImage={selectedImage}
                  onSelectImage={setSelectedImage}
                />
              </div>
              {publishingFieldsActive ? (
                <SaleFields sale={sale} onChange={setSale} />
              ) : null}
              {mode === "owned" && activeStatuses.inCollection ? (
                <CollectionFields
                  collection={collection}
                  collections={collections}
                  onChange={setCollection}
                />
              ) : null}
              {mode === "wanted" && wishlistEntryMode === "manual" ? (
                <WishlistFields
                  entryMode={wishlistEntryMode}
                  wanted={wanted}
                  onChange={setWanted}
                  onEntryModeChange={setWishlistEntryMode}
                />
              ) : null}
              <div
                id="add-item-actions"
                className="flex justify-center pt-2 text-sm text-muted-foreground"
              >
                <BackToTopLink
                  label={
                    mode === "wanted"
                      ? "Back to top to add to wishlist"
                      : "Back to top to add item"
                  }
                />
              </div>
            </aside>
          </div>
        </>
      ) : (
        <div
          id="add-item-actions"
          className="flex justify-center pt-2 text-sm text-muted-foreground"
        >
          <BackToTopLink label="Back to top to add to wishlist" />
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-2 shadow-overlay backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit rounded-md border-primary/60 bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          >
            {publishSummary.label}
          </Badge>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-lg"
              onClick={saveDraft}
            >
              <Save className="size-4" aria-hidden="true" />
              Save Draft
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={handlePrimaryAction}
            >
              {primaryActionLabel}
            </Button>
          </div>
        </div>
      </div>
      {activeTourStep ? (
        <AddItemTour
          step={activeTourStep}
          stepIndex={tourStepIndex}
          onClose={closeTour}
          onNext={() => {
            if (tourStepIndex >= tourSteps.length - 1) {
              closeTour();
              return;
            }
            setTourStepIndex((current) => current + 1);
          }}
        />
      ) : null}
    </div>
  );
}

function AddItemSubmissionFeedback({
  feedback,
  onDismiss,
}: {
  feedback: SubmissionFeedback;
  onDismiss: () => void;
}) {
  const Icon = feedback.tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <section
      role={feedback.tone === "success" ? "status" : "alert"}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-card",
        feedback.tone === "success"
          ? "border-success/35"
          : "border-warning/35",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
            feedback.tone === "success"
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">
            {feedback.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {feedback.body}
          </p>
          {feedback.missing?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {feedback.missing.map((item) => (
                <Badge key={item} variant="warning">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/my-stuff"
                className="text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                View in My Stuff
              </a>
              <button
                type="button"
                onClick={onDismiss}
                className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                Add another
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Dismiss add item feedback"
          onClick={onDismiss}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function AddItemTour({
  onClose,
  onNext,
  step,
  stepIndex,
}: {
  onClose: () => void;
  onNext: () => void;
  step: (typeof tourSteps)[number];
  stepIndex: number;
}) {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-40 bg-background/72 backdrop-blur-[1px]"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Add item tour"
        className={cn(
          "fixed z-50 w-auto rounded-lg border border-border bg-card text-card-foreground shadow-overlay",
          "left-4 right-4 top-[13.75rem] sm:left-8 sm:right-auto sm:w-80",
          step.target === "status" && "lg:left-[22rem] lg:top-[15.25rem]",
          step.target === "profile" && "top-[22rem] lg:left-[25rem] lg:top-[26rem]",
          step.target === "ai" && "top-[8.5rem] lg:left-auto lg:right-[12rem] lg:top-[9.25rem]",
        )}
      >
        <div className="border-b border-border p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {tourSteps.map((tourStep, index) => (
                <span
                  key={tourStep.target}
                  className={cn(
                    "block h-1.5 rounded-full bg-muted",
                    index === stepIndex ? "w-4 bg-primary" : "w-1.5",
                    index < stepIndex && "bg-primary/75",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Close add item tour"
              className="grid size-6 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={onClose}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <h2 className="text-sm font-semibold text-foreground">{step.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {step.body}
          </p>
          {step.bullets ? (
            <ul className="mt-3 space-y-1.5 text-sm text-foreground">
              {step.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <button
            type="button"
            className="rounded-md px-1 text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            onClick={onClose}
          >
            Skip tour
          </button>
          <Button type="button" variant="primary" size="sm" onClick={onNext}>
            {step.action}
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </>
  );
}

function BackToTopLink({ label }: { label: string }) {
  return (
    <a
      href="#add-item-top"
      className="rounded-full px-3 py-1 transition hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      ↑ {label}
    </a>
  );
}

function DescriptionPanel({
  basics,
  onChange,
}: {
  basics: ItemBasicsState;
  onChange: (basics: ItemBasicsState) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <label
        htmlFor="item-description"
        className="text-base font-semibold text-foreground"
      >
        Description
      </label>
      <textarea
        id="item-description"
        value={basics.description}
        onChange={(event) =>
          onChange({ ...basics, description: event.target.value })
        }
        placeholder="Describe your item in detail..."
        className="mt-5 min-h-32 w-full resize-none rounded-lg border border-transparent bg-transparent px-3 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-border focus:bg-background focus:ring-2 focus:ring-primary/15"
      />
    </section>
  );
}

function ConditionPanel({
  basics,
  onChange,
}: {
  basics: ItemBasicsState;
  onChange: (basics: ItemBasicsState) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <h2 className="text-base font-semibold text-foreground">Condition</h2>
      <div className="mt-3">
        <label htmlFor="item-condition" className="sr-only">
          Condition
        </label>
        <Select
          id="item-condition"
          className="w-36 bg-background"
          value={basics.condition}
          onChange={(event) =>
            onChange({ ...basics, condition: event.target.value })
          }
        >
          <option value="">Set grade</option>
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </Select>
      </div>
      <label htmlFor="item-condition-details" className="sr-only">
        Condition notes
      </label>
      <textarea
        id="item-condition-details"
        aria-label="Condition notes"
        value={basics.conditionDetails}
        onChange={(event) =>
          onChange({ ...basics, conditionDetails: event.target.value })
        }
        placeholder={
          basics.condition
            ? "Add notes on wear, packaging, quirks..."
            : "Pick a grade above, then add notes on wear, packaging, quirks..."
        }
        className="mt-3 min-h-24 w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground/55 hover:border-primary/35 focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
      />
    </section>
  );
}

function SpecificationsPanel({
  basics,
  onChange,
}: {
  basics: ItemBasicsState;
  onChange: (basics: ItemBasicsState) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-semibold text-foreground outline-none transition hover:bg-secondary/40 focus-visible:bg-secondary/60"
      >
        Specifications
        <span className="text-muted-foreground">{open ? "−" : "⌄"}</span>
      </button>
      {open ? (
        <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-foreground">
            Brand
            <input
              value={basics.brand}
              onChange={(event) =>
                onChange({ ...basics, brand: event.target.value })
              }
              placeholder="Fender"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            Model
            <input
              value={basics.model}
              onChange={(event) =>
                onChange({ ...basics, model: event.target.value })
              }
              placeholder="American Pro II"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            Year
            <input
              value={basics.year}
              onChange={(event) =>
                onChange({ ...basics, year: event.target.value })
              }
              placeholder="2022"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}

function ProfileContextCard() {
  return (
    <section className="rounded-lg border border-border bg-card p-4 transition hover:border-primary/35">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-medium uppercase text-muted-foreground">
          Your Profile
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
            <span className="block h-full w-3/4 bg-primary" />
          </span>
          75%
          <CircleHelp className="size-3.5" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 rounded-full">
            <AvatarImage src="/avatar-jordan.jpg" alt="" />
            <AvatarFallback>JM</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold text-foreground">
              JillMusic
            </div>
            <p className="text-sm text-muted-foreground">
              Collector and player. Into vintage gear.
            </p>
            <p className="text-xs text-muted-foreground">
              San Francisco, CA · Joined Apr 2026
            </p>
          </div>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
        <Badge variant="secondary">
          <Box className="size-3" aria-hidden="true" />
          1 listings
        </Badge>
        <Badge variant="secondary">
          <FolderOpen className="size-3" aria-hidden="true" />
          0 collections
        </Badge>
      </div>
    </section>
  );
}

function CategoryStrip({
  selectedCategoryId,
  onCategoryChange,
}: {
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
}) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const categories = [
    {
      id: "guitars",
      label: "Guitars",
      subcategories: ["Electric", "Acoustic", "Bass"],
    },
    { id: "drums", label: "Drums", subcategories: ["Kits", "Snares", "Cymbals"] },
    {
      id: "keyboards",
      label: "Keyboards",
      subcategories: ["Synths", "Stage", "MIDI"],
    },
    {
      id: "audio-equipment",
      label: "Audio Equipment",
      subcategories: ["Amps", "Pedals", "Microphones", "Monitors"],
    },
    {
      id: "accessories",
      label: "Accessories",
      subcategories: ["Cases", "Cables", "Stands"],
    },
    { id: "other", label: "Other", subcategories: ["Parts", "Vinyl", "Misc"] },
  ];
  const activeCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const visibleCategories = activeCategory ? [activeCategory] : categories;
  const visibleSubcategories = selectedSubcategory
    ? [selectedSubcategory]
    : activeCategory?.subcategories ?? [];
  const resetCategory = () => {
    setSelectedSubcategory(null);
    onCategoryChange("");
  };

  return (
    <section className="rounded-lg border border-border bg-card p-3 transition focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/20">
      <div className="mb-2 text-sm font-semibold text-muted-foreground">
        Category
      </div>
      <div
        className={cn(
          "flex items-center gap-2",
          activeCategory ? "overflow-x-auto whitespace-nowrap" : "flex-wrap",
        )}
      >
        {visibleCategories.map((category) => {
          const active = category.id === selectedCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
                active
                  ? "rounded-full border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-accent/45 hover:text-foreground",
              )}
              onClick={() => {
                if (active) {
                  resetCategory();
                  return;
                }
                setSelectedSubcategory(null);
                onCategoryChange(category.id);
              }}
            >
              {category.label}
            </button>
          );
        })}
        {activeCategory && visibleSubcategories.length > 0 ? (
          <>
          <span className="text-xl text-muted-foreground" aria-hidden="true">
            ›
          </span>
          {visibleSubcategories.map((subcategory) => {
            const active = subcategory === selectedSubcategory;

            return (
              <button
                key={subcategory}
                type="button"
                aria-pressed={active}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
                  active
                    ? "rounded-full border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/45 hover:text-foreground",
                )}
                onClick={() => {
                  if (active) {
                    setSelectedSubcategory(null);
                    return;
                  }
                  setSelectedSubcategory(subcategory);
                }}
              >
                {subcategory}
              </button>
            );
          })}
          </>
        ) : null}
      </div>
    </section>
  );
}
