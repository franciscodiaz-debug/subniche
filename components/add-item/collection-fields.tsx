"use client";

import { FormSection } from "@/components/add-item/form-section";
import type { CollectionState } from "@/components/add-item/types";
import { FormField } from "@/components/ui/form-field";
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
    <FormSection
      eyebrow="In Collection"
      title="Collection placement"
      description="Collections build identity and trust context without implying this item is always available."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="collection-id" label="Collection">
          <Select
            id="collection-id"
            value={collection.collectionId}
            onChange={(event) => update({ collectionId: event.target.value })}
          >
            {collections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="collection-visibility" label="Visibility">
          <Select
            id="collection-visibility"
            value={collection.visibility}
            onChange={(event) =>
              update({
                visibility: event.target.value as CollectionState["visibility"],
              })
            }
          >
            <option value="public">Public</option>
            <option value="profile">Profile only</option>
            <option value="private">Private</option>
          </Select>
        </FormField>
      </div>
      <FormField id="collection-note" label="Collection note">
        <Textarea
          id="collection-note"
          value={collection.note}
          onChange={(event) => update({ note: event.target.value })}
          placeholder="Why it belongs in this collection, setup history, or provenance."
        />
      </FormField>
    </FormSection>
  );
}
