"use client";

import { FormSection } from "@/components/add-item/form-section";
import type { ItemBasicsState } from "@/components/add-item/types";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MockCategory, MockNiche } from "@/data/mock";

type ItemBasicsStepProps = {
  basics: ItemBasicsState;
  categories: MockCategory[];
  niches: MockNiche[];
  onChange: (basics: ItemBasicsState) => void;
};

const conditions = ["Mint", "Excellent", "Very Good", "Good", "Fair", "Project"];

export function ItemBasicsStep({
  basics,
  categories,
  niches,
  onChange,
}: ItemBasicsStepProps) {
  const update = (next: Partial<ItemBasicsState>) =>
    onChange({ ...basics, ...next });

  return (
    <FormSection
      title="Item Details"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <FormField id="item-title" label="Title">
          <Input
            id="item-title"
            className="h-20 text-3xl font-bold tracking-normal placeholder:text-muted-foreground/45"
            value={basics.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Enter item title"
          />
        </FormField>
        <FormField id="item-location" label="Location">
          <Input
            id="item-location"
            value={basics.location}
            onChange={(event) => update({ location: event.target.value })}
            placeholder="Portland, OR"
          />
        </FormField>
      </div>
      <FormField id="item-description" label="Description">
        <Textarea
          id="item-description"
          className="min-h-44 text-base leading-7"
          value={basics.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder="Describe your item in detail..."
        />
      </FormField>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField id="item-niche" label="Niche">
          <Select
            id="item-niche"
            value={basics.nicheId}
            onChange={(event) => update({ nicheId: event.target.value })}
          >
            {niches.map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="item-category" label="Category">
          <Select
            id="item-category"
            value={basics.categoryId}
            onChange={(event) => update({ categoryId: event.target.value })}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="item-condition" label="Condition">
          <Select
            id="item-condition"
            value={basics.condition}
            onChange={(event) => update({ condition: event.target.value })}
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField id="item-brand" label="Brand">
          <Input
            id="item-brand"
            value={basics.brand}
            onChange={(event) => update({ brand: event.target.value })}
            placeholder="Fender"
          />
        </FormField>
        <FormField id="item-model" label="Model">
          <Input
            id="item-model"
            value={basics.model}
            onChange={(event) => update({ model: event.target.value })}
            placeholder="American Pro II"
          />
        </FormField>
        <FormField id="item-year" label="Year">
          <Input
            id="item-year"
            value={basics.year}
            onChange={(event) => update({ year: event.target.value })}
            placeholder="2022"
          />
        </FormField>
      </div>
    </FormSection>
  );
}
