"use client";

import { Package, Truck } from "lucide-react";
import { FormSection } from "@/components/add-item/form-section";
import type { SaleState } from "@/components/add-item/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SaleFieldsProps = {
  sale: SaleState;
  onChange: (sale: SaleState) => void;
};

export function SaleFields({ onChange, sale }: SaleFieldsProps) {
  const update = (next: Partial<SaleState>) => onChange({ ...sale, ...next });

  return (
    <FormSection title="Payment">
      <div className="space-y-3">
        {[
          "Cash",
          "PayPal - Friends and Family",
          "PayPal - Goods and Services",
          "Venmo",
          "Cryptocurrency",
          "Other",
        ].map((label) => (
          <Label
            key={label}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            <Checkbox />
            {label}
          </Label>
        ))}
      </div>

      <div className="pt-2 text-sm font-semibold text-foreground">
        Logistics
      </div>
      <div className="space-y-3">
        <Label className="flex items-center gap-3 text-sm text-muted-foreground">
          <Checkbox
            checked={sale.fulfillment === "local" || sale.fulfillment === "both"}
            onChange={(event) =>
              update({
                fulfillment: event.target.checked ? "both" : "shipping",
              })
            }
          />
          <Package className="size-4" aria-hidden="true" />
          Local Pickup
        </Label>
        <Label className="flex items-center gap-3 text-sm text-muted-foreground">
          <Checkbox
            checked={sale.fulfillment === "shipping" || sale.fulfillment === "both"}
            onChange={(event) =>
              update({
                fulfillment: event.target.checked ? "both" : "local",
              })
            }
          />
          <Truck className="size-4" aria-hidden="true" />
          Shipping
        </Label>
      </div>

      <label
        htmlFor="return-policy"
        className="pt-2 text-sm font-semibold text-foreground"
      >
        Return Policy
      </label>
      <Textarea
        id="return-policy"
        placeholder="Describe your return policy, if any..."
        rows={2}
      />

      <div className="pt-2 text-sm font-semibold text-foreground">
        Publish To
      </div>
      <Label className="flex items-center gap-3 text-sm text-foreground">
        <Checkbox defaultChecked />
        General Niche
      </Label>
      <p className="pl-7 text-xs leading-5 text-muted-foreground">
        Join communities to publish listings directly to them.
      </p>
    </FormSection>
  );
}
