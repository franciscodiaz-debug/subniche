"use client";

import { Heart } from "lucide-react";
import { FormSection } from "@/components/add-item/form-section";
import type { WantedState } from "@/components/add-item/types";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type WishlistFieldsProps = {
  onChange: (wanted: WantedState) => void;
  wanted: WantedState;
};

const conditions = ["Any clean example", "Mint", "Excellent", "Very Good", "Good", "Project"];

export function WishlistFields({ onChange, wanted }: WishlistFieldsProps) {
  const update = (next: Partial<WantedState>) =>
    onChange({ ...wanted, ...next });

  return (
    <FormSection
      eyebrow="Wanted"
      title="Wanted item details"
      description="Wanted items show what you are looking for. They are not listed as something you own."
    >
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-warning">
        <Heart className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Wanted mode clears owned-item statuses so buyers and traders do not confuse this with inventory.
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField id="wanted-condition" label="Ideal condition">
          <Select
            id="wanted-condition"
            value={wanted.idealCondition}
            onChange={(event) =>
              update({ idealCondition: event.target.value })
            }
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="wanted-target-price" label="Target price">
          <Input
            id="wanted-target-price"
            value={wanted.targetPrice}
            onChange={(event) => update({ targetPrice: event.target.value })}
            placeholder="2200"
          />
        </FormField>
        <FormField id="wanted-visibility" label="Visibility">
          <Select
            id="wanted-visibility"
            value={wanted.visibility}
            onChange={(event) =>
              update({ visibility: event.target.value as WantedState["visibility"] })
            }
          >
            <option value="public">Public wanted item</option>
            <option value="private">Private note</option>
          </Select>
        </FormField>
      </div>
      <FormField id="wanted-notes" label="Notes">
        <Textarea
          id="wanted-notes"
          value={wanted.notes}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder="Finish, years, condition details, or trade flexibility."
        />
      </FormField>
    </FormSection>
  );
}
