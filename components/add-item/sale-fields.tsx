"use client";

import { DollarSign } from "lucide-react";
import { FormSection } from "@/components/add-item/form-section";
import type { SaleState } from "@/components/add-item/types";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type SaleFieldsProps = {
  sale: SaleState;
  onChange: (sale: SaleState) => void;
};

export function SaleFields({ onChange, sale }: SaleFieldsProps) {
  const update = (next: Partial<SaleState>) => onChange({ ...sale, ...next });

  return (
    <FormSection
      eyebrow="For Sale"
      title="Sale details"
      description="Price can stay flexible in the prototype, but it should be clear when a sale listing has no asking price."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          id="sale-price"
          label="Asking price"
          helpText={
            sale.price ? undefined : "Recommended when For Sale is active."
          }
        >
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="sale-price"
              className="pl-9"
              value={sale.price}
              onChange={(event) => update({ price: event.target.value })}
              placeholder="1749"
            />
          </div>
        </FormField>
        <FormField id="sale-fulfillment" label="Pickup / shipping">
          <Select
            id="sale-fulfillment"
            value={sale.fulfillment}
            onChange={(event) =>
              update({ fulfillment: event.target.value as SaleState["fulfillment"] })
            }
          >
            <option value="local">Local pickup preferred</option>
            <option value="shipping">Shipping available</option>
            <option value="both">Local pickup or shipping</option>
          </Select>
        </FormField>
      </div>
      <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Checkbox
          checked={sale.acceptsOffers}
          onChange={(event) => update({ acceptsOffers: event.target.checked })}
        />
        Accept offers
      </Label>
    </FormSection>
  );
}
