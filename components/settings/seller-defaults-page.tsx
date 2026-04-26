import { Check, Info, Pencil, RotateCcw, Save, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";

const paymentMethods = [
  { id: "paypal", label: "PayPal", checked: true },
  { id: "venmo", label: "Venmo", checked: true },
  { id: "zelle", label: "Zelle", checked: false },
  { id: "cash", label: "Cash", checked: true },
  { id: "cashapp", label: "Cash App", checked: false },
  { id: "crypto", label: "Crypto", checked: false },
];

const logistics = [
  { id: "shipping", label: "Shipping available", checked: true },
  { id: "local-pickup", label: "Local pickup", checked: true },
  { id: "meetup", label: "Meetup by arrangement", checked: false },
];

export function SellerDefaultsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase text-accent">
            <Truck className="size-3.5" aria-hidden="true" />
            Selling
          </div>
          <div className="mt-4 flex items-center gap-3">
            <h2 className="text-3xl font-semibold text-foreground">
              Seller defaults
            </h2>
            <Tooltip label="Defaults prefill new item forms and can still be changed per listing.">
              <Info className="size-5 text-muted-foreground" aria-hidden="true" />
            </Tooltip>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Keep common payment, logistics, and return policy details ready so
            new listings can stay focused on condition, provenance, and trade
            fit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset changes
          </button>
          <button
            type="button"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <Save className="size-4" aria-hidden="true" />
            Save defaults
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <SettingsSection
            title="Payment methods"
            description="These are selected automatically when you mark a new item For Sale."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                >
                  <Checkbox defaultChecked={method.checked} />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Logistics"
            description="Use defaults for shipping and handoff details, then override unusual listings individually."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {logistics.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                >
                  <Checkbox defaultChecked={option.checked} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Return policy"
            description="Short, consistent policy language keeps buyer expectations clear."
            action={
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </button>
            }
          >
            <Textarea
              defaultValue="Returns accepted within 3 days of delivery if the item arrives materially different than described. Buyer covers return shipping unless the listing was inaccurate."
              rows={5}
            />
          </SettingsSection>
        </div>

        <aside className="space-y-4">
          <Card className="rounded-lg p-5">
            <h3 className="text-base font-semibold text-foreground">
              Listing form preview
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              New sale listings will start with these default choices already
              selected.
            </p>
            <div className="mt-5 space-y-3">
              <PreviewRow label="Payment" value="PayPal, Venmo, Cash" />
              <PreviewRow label="Logistics" value="Shipping, local pickup" />
              <PreviewRow label="Policy" value="3 day return window" />
            </div>
          </Card>

          <Card className="rounded-lg p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Check className="size-4 text-success" aria-hidden="true" />
              Applies to default-backed items
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              In the production version, changes here should update listings
              that are still using default values while leaving custom overrides
              alone.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="success">12 listings using defaults</Badge>
              <Badge variant="outline">3 custom overrides</Badge>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SettingsSection({
  action,
  children,
  description,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="rounded-lg p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
