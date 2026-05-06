"use client";

import type { ItemBasicsState } from "@/components/add-item/types";

type ItemBasicsStepProps = {
  basics: ItemBasicsState;
  price?: string;
  onChange: (basics: ItemBasicsState) => void;
  onPriceChange?: (price: string) => void;
};

export function ItemBasicsStep({
  basics,
  price = "",
  onChange,
  onPriceChange,
}: ItemBasicsStepProps) {
  const update = (next: Partial<ItemBasicsState>) =>
    onChange({ ...basics, ...next });

  return (
    <div className="space-y-4">
      <section className="rounded-lg px-1 py-2 transition focus-within:ring-2 focus-within:ring-primary/20">
        <label htmlFor="item-title" className="sr-only">
          Title
        </label>
        <input
          id="item-title"
          className="min-h-12 w-full bg-transparent text-4xl font-semibold tracking-normal text-foreground outline-none placeholder:text-muted-foreground/45"
          value={basics.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder="Enter item title"
        />
        <label htmlFor="item-subtitle" className="sr-only">
          Subtitle
        </label>
        <input
          id="item-subtitle"
          className="mt-2 h-8 w-full bg-transparent text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/50"
          value={basics.subtitle}
          onChange={(event) => update({ subtitle: event.target.value })}
          placeholder="Subtitle (e.g., color, year, variant)"
        />
        {onPriceChange ? (
          <div className="mt-4 flex items-center text-4xl font-semibold text-primary">
            <span aria-hidden="true">$</span>
            <label htmlFor="item-asking-price" className="sr-only">
              Asking price
            </label>
            <input
              id="item-asking-price"
              inputMode="decimal"
              value={price}
              onChange={(event) => onPriceChange(event.target.value)}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-primary/65"
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
