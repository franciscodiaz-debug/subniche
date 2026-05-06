"use client"

/**
 * Collection of read-only content sections that share the same visual
 * vocabulary — a section heading and a panel body. Grouping them in one
 * file keeps the detail page's imports tidy, since the listing view uses
 * the full set.
 *
 * Sections exported:
 *   - DescriptionBlock   → long-form seller text
 *   - ConditionBlock     → labelled badge + explanation
 *   - SpecificationsBlock → key/value grid
 *   - PaymentMethodsBlock → chip list
 *   - ShippingBlock      → options + ships-from + handling time
 *   - ReturnPolicyBlock  → plain-text block
 *
 * All blocks render nothing when their data is null so the parent page can
 * wire them up unconditionally and let the mock data drive visibility.
 */

import {
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MockListing, MockSpec } from "@/lib/mock-listing-detail"

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

export function SectionHeading({
  icon: Icon,
  title,
  as = "h2",
  right,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  as?: "h2" | "h3"
  right?: React.ReactNode
}) {
  const Tag = as
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <Tag className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : null}
        <span>{title}</span>
      </Tag>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  )
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  // The `data-listing-panel` attribute is the selector the mobile
  // accordion uses to strip this chrome when the panel is rendered
  // inside a collapsible (avoids card-in-card). Without the attribute,
  // global `.rounded-card` targeting would also strip unrelated inner
  // elements (e.g. the spec grid's rounded dl).
  return (
    <div
      data-listing-panel
      className={cn(
        "rounded-card border border-border bg-card p-4 md:p-5",
        className,
      )}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Description                                                                */
/* -------------------------------------------------------------------------- */

export function DescriptionBlock({ description }: { description: string }) {
  if (!description) return null
  return (
    <section aria-label="Description">
      <SectionHeading title="Description" />
      <Panel>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 text-pretty">
          {description}
        </p>
      </Panel>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Condition                                                                  */
/* -------------------------------------------------------------------------- */

export function ConditionBlock({
  label,
  explanation,
}: {
  label: string | null
  explanation: string | null
}) {
  if (!label && !explanation) return null
  return (
    <section aria-label="Condition">
      <SectionHeading title="Condition" />
      <Panel>
        {label ? (
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {label}
          </span>
        ) : null}
        {explanation ? (
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            {explanation}
          </p>
        ) : null}
      </Panel>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Specifications                                                             */
/* -------------------------------------------------------------------------- */

export function SpecificationsBlock({ specs }: { specs: MockSpec[] }) {
  if (!specs || specs.length === 0) return null
  return (
    <section aria-label="Specifications">
      <SectionHeading title="Specifications" />
      <Panel className="p-0 md:p-0">
        {/* Single-column layout at every breakpoint — collectors tend to
            scan specs linearly (year → finish → case → serial), and a
            two-column grid forced the eye to zig-zag. Rows span the full
            panel width so long values (e.g. 12-digit serial numbers)
            never truncate. */}
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-card bg-border">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between gap-4 bg-card px-4 py-3"
            >
              <dt className="truncate text-xs uppercase tracking-wider text-muted-foreground">
                {spec.label}
              </dt>
              <dd className="truncate text-sm font-medium text-foreground">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Payment methods                                                            */
/* -------------------------------------------------------------------------- */

export function PaymentMethodsBlock({
  methods,
}: {
  methods: string[] | null
}) {
  if (!methods || methods.length === 0) return null
  return (
    <section aria-label="Payment methods accepted">
      <SectionHeading icon={CreditCard} title="Payment methods" />
      <Panel>
        <ul className="flex flex-wrap gap-2">
          {methods.map((method) => (
            <li
              key={method}
              className="inline-flex items-center rounded-md border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-secondary-foreground"
            >
              {method}
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Shipping & logistics                                                       */
/* -------------------------------------------------------------------------- */

export function ShippingBlock({
  shipping,
}: {
  shipping: MockListing["shipping"]
}) {
  if (!shipping) return null
  return (
    <section aria-label="Shipping and logistics">
      <SectionHeading icon={Truck} title="Shipping & logistics" />
      <Panel>
        <dl className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Ships from
            </dt>
            <dd className="text-right font-medium text-foreground">
              {shipping.shipsFrom}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Handling time
            </dt>
            <dd className="text-right font-medium text-foreground">
              {shipping.handlingDays}
            </dd>
          </div>
        </dl>

        {shipping.options.length > 0 ? (
          <ul className="mt-4 space-y-2 border-t border-border pt-4">
            {shipping.options.map((option) => (
              <li
                key={option.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground/90">{option.label}</span>
                <span className="font-medium text-foreground tabular-nums">
                  {option.price === null
                    ? "—"
                    : option.price === 0
                      ? "Free"
                      : `$${option.price.toLocaleString('en-US')}`}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Return policy                                                              */
/* -------------------------------------------------------------------------- */

export function ReturnPolicyBlock({ policy }: { policy: string | null }) {
  if (!policy) return null
  return (
    <section aria-label="Return policy">
      <SectionHeading icon={RotateCcw} title="Return policy" />
      <Panel>
        <p className="text-sm leading-relaxed text-foreground/90">{policy}</p>
      </Panel>
    </section>
  )
}
