"use client";

import { Repeat2 } from "lucide-react";
import { FormSection } from "@/components/add-item/form-section";
import type { TradeState } from "@/components/add-item/types";

type TradeFieldsProps = {
  onChange: (trade: TradeState) => void;
  trade: TradeState;
};

export function TradeFields({ onChange, trade }: TradeFieldsProps) {
  void onChange;
  void trade;

  return (
    <FormSection
      eyebrow="For Trade"
      title="Trade interest setup"
      description="Trade interests are set in the next step after the item is saved."
    >
      <div className="rounded-xl border border-info/25 bg-info/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-info">
          <Repeat2 className="size-4" aria-hidden="true" />
          For Trade fields added - you&apos;ll set interests in the next step
        </div>
      </div>
    </FormSection>
  );
}
