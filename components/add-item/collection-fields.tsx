"use client";

import { Folder, Upload } from "lucide-react";
import type { CollectionState } from "@/components/add-item/types";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MockCollection } from "@/data/mock";

type CollectionFieldsProps = {
  collection: CollectionState;
  collections: MockCollection[];
  onChange: (collection: CollectionState) => void;
};

export function CollectionFields({
  collection,
  collections,
  onChange,
}: CollectionFieldsProps) {
  const update = (next: Partial<CollectionState>) =>
    onChange({ ...collection, ...next });

  return (
    <section className="space-y-5 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Collection</h2>
        <Folder className="size-5 text-primary" aria-hidden="true" />
      </div>
      <FormField id="collection-id" label="Add to Collection *">
        <Select
          id="collection-id"
          value={collection.collectionId}
          onChange={(event) => update({ collectionId: event.target.value })}
        >
          <option value="">Select a collection...</option>
          {collections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="collection-note" label="Item Notes">
        <Textarea
          id="collection-note"
          value={collection.note}
          onChange={(event) => update({ note: event.target.value })}
          placeholder="Personal notes about this item in your collection..."
          rows={3}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="date-acquired" label="Date Acquired">
          <Input
            id="date-acquired"
            type="date"
            value={collection.dateAcquired}
            onChange={(event) => update({ dateAcquired: event.target.value })}
          />
        </FormField>
        <FormField id="acquisition-price" label="Acquisition Price">
          <Input
            id="acquisition-price"
            value={collection.acquisitionPrice}
            onChange={(event) =>
              update({ acquisitionPrice: event.target.value })
            }
            placeholder="$ 0.00"
          />
        </FormField>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Receipt / Proof of Purchase
        </div>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
        >
          <Upload className="size-4" aria-hidden="true" />
          Upload receipt (optional)
        </button>
      </div>
    </section>
  );
}
