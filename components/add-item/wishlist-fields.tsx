"use client";

import { ArrowLeft, Link, PencilLine } from "lucide-react";
import { FormSection } from "@/components/add-item/form-section";
import type {
  WantedState,
  WishlistEntryMode,
} from "@/components/add-item/types";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type WishlistFieldsProps = {
  entryMode: WishlistEntryMode;
  onChange: (wanted: WantedState) => void;
  onEntryModeChange: (mode: WishlistEntryMode) => void;
  wanted: WantedState;
};

export function WishlistFields({
  entryMode,
  onChange,
  onEntryModeChange,
  wanted,
}: WishlistFieldsProps) {
  const update = (next: Partial<WantedState>) =>
    onChange({ ...wanted, ...next });

  if (entryMode === "choice") {
    return (
      <FormSection
        title="Add a wishlist item"
        description="Wishlist items are things you want but do not currently own."
        className="max-w-xl"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start p-4 text-left"
            leftIcon={<Link className="size-4" aria-hidden="true" />}
            onClick={() => onEntryModeChange("url")}
          >
            <span>
              <span className="block">Add via URL</span>
              <span className="block pt-1 text-xs font-normal text-muted-foreground">
                Paste a product link to start from a source page.
              </span>
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start p-4 text-left"
            leftIcon={<PencilLine className="size-4" aria-hidden="true" />}
            onClick={() => onEntryModeChange("manual")}
          >
            <span>
              <span className="block">Enter Manually</span>
              <span className="block pt-1 text-xs font-normal text-muted-foreground">
                Fill out the item details yourself.
              </span>
            </span>
          </Button>
        </div>
      </FormSection>
    );
  }

  if (entryMode === "url") {
    return (
      <FormSection
        title="Paste a link to your wishlist item"
        description="Use a public listing, store page, or reference page for the item you want."
        className="max-w-xl"
      >
        <FormField id="wanted-source-url" label="Source URL">
          <Input
            id="wanted-source-url"
            type="url"
            value={wanted.sourceUrl}
            onChange={(event) => update({ sourceUrl: event.target.value })}
            placeholder="https://"
          />
        </FormField>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button">Process</Button>
          <Button
            type="button"
            variant="outline"
            leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
            onClick={() => onEntryModeChange("choice")}
          >
            Back
          </Button>
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection
      eyebrow="Wishlist"
      title="Wishlist Details"
      description="Publish what you are looking for without adding it to owned inventory."
    >
      <FormField id="wanted-manual-source-url" label="Source URL">
        <Input
          id="wanted-manual-source-url"
          type="url"
          value={wanted.sourceUrl}
          onChange={(event) => update({ sourceUrl: event.target.value })}
          placeholder="https://"
        />
      </FormField>
      <FormField id="wanted-target-price" label="Target Price">
        <Input
          id="wanted-target-price"
          inputMode="decimal"
          value={wanted.targetPrice}
          onChange={(event) => update({ targetPrice: event.target.value })}
          placeholder="2200"
        />
      </FormField>
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">Visibility</div>
        <div className="grid grid-cols-2 rounded-lg border border-border bg-background p-1">
          {(["public", "private"] as const).map((visibility) => (
            <button
              key={visibility}
              type="button"
              className={cn(
                "h-9 rounded-md text-sm font-semibold text-muted-foreground transition",
                wanted.visibility === visibility &&
                  "bg-card text-foreground shadow-card",
              )}
              aria-pressed={wanted.visibility === visibility}
              onClick={() => update({ visibility })}
            >
              {visibility === "public" ? "Public" : "Private"}
            </button>
          ))}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
        onClick={() => onEntryModeChange("choice")}
      >
        Back
      </Button>
    </FormSection>
  );
}
