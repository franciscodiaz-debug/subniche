"use client";

import { Repeat2 } from "lucide-react";
import { FormSection } from "@/components/add-item/form-section";
import type { TradeState } from "@/components/add-item/types";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MockCategory } from "@/data/mock";

type TradeFieldsProps = {
  categories: MockCategory[];
  onChange: (trade: TradeState) => void;
  trade: TradeState;
};

const cashOptions: Array<{ label: string; value: TradeState["cashPreference"] }> = [
  { label: "Open to cash either way", value: "either-way" },
  { label: "I can add cash", value: "i-can-add" },
  { label: "I would need cash added", value: "need-cash-added" },
  { label: "Straight trade preferred", value: "straight-trade" },
];

export function TradeFields({ categories, onChange, trade }: TradeFieldsProps) {
  const update = (next: Partial<TradeState>) => onChange({ ...trade, ...next });
  const toggleCategory = (categoryId: string) => {
    const active = trade.acceptedCategoryIds.includes(categoryId);
    update({
      acceptedCategoryIds: active
        ? trade.acceptedCategoryIds.filter((id) => id !== categoryId)
        : [...trade.acceptedCategoryIds, categoryId],
    });
  };

  return (
    <FormSection
      eyebrow="For Trade"
      title="Trade interests"
      description="Set explicit criteria so true trade matches are not watered down into loose suggestions."
    >
      <div className="rounded-xl border border-info/25 bg-info/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-info">
          <Repeat2 className="size-4" aria-hidden="true" />
          Trade matches only count when they meet the criteria you set.
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <Label
            key={category.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm font-medium text-muted-foreground"
          >
            <Checkbox
              checked={trade.acceptedCategoryIds.includes(category.id)}
              onChange={() => toggleCategory(category.id)}
            />
            {category.name}
          </Label>
        ))}
      </div>
      <FormField id="trade-notes" label="Specific wants / notes">
        <Textarea
          id="trade-notes"
          value={trade.notes}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder="Vintage Fender combos, boutique modulation, or clean semi-hollows."
        />
      </FormField>
      <FormField id="cash-preference" label="Cash adjustment preference">
        <Select
          id="cash-preference"
          value={trade.cashPreference}
          onChange={(event) =>
            update({
              cashPreference: event.target.value as TradeState["cashPreference"],
            })
          }
        >
          {cashOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>
    </FormSection>
  );
}
