"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Package, Truck } from "lucide-react"
import type { ItemSaleStatus } from "@/lib/types/item-status"

interface SaleFieldsProps {
  data: ItemSaleStatus
  onChange: (data: ItemSaleStatus) => void
  isActive: boolean
  onFieldsVisible?: () => void
}

const PAYMENT_OPTIONS = [
  { id: "cash", label: "Cash" },
  { id: "paypal-ff", label: "PayPal - Friends and Family" },
  { id: "paypal-gs", label: "PayPal - Goods and Services" },
  { id: "venmo", label: "Venmo" },
  { id: "crypto", label: "Cryptocurrency" },
  { id: "other", label: "Other" },
]

const PUBLISH_OPTIONS = [
  { id: "marketplace", label: "Public Marketplace" },
  { id: "followers", label: "Followers Only" },
  { id: "groups", label: "My Groups" },
]

export function SaleFields({ data, onChange, isActive, onFieldsVisible }: SaleFieldsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isActive && !hasAnimated) {
      setIsAnimating(true)
      setHasAnimated(true)
      onFieldsVisible?.()
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
    if (!isActive) {
      setHasAnimated(false)
    }
  }, [isActive, hasAnimated, onFieldsVisible])

  if (!isActive) {
    return null
  }

  const togglePaymentMethod = (method: string) => {
    const newMethods = data.paymentMethods.includes(method)
      ? data.paymentMethods.filter((m) => m !== method)
      : [...data.paymentMethods, method]
    onChange({ ...data, paymentMethods: newMethods })
  }

  const togglePublishTo = (option: string) => {
    const newPublishTo = data.publishTo.includes(option as any)
      ? data.publishTo.filter((p) => p !== option)
      : [...data.publishTo, option as any]
    onChange({ ...data, publishTo: newPublishTo })
  }

  return (
    <div
      ref={containerRef}
      data-section
      className={cn(
        "bg-card rounded-lg border border-border p-4 md:p-6 transition-all duration-300",
        isAnimating && "ring-2 ring-green-500/50 animate-in fade-in slide-in-from-top-2",
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <h2 className="text-xl font-semibold">For Sale</h2>
      </div>

      <div className="space-y-4">
        {/* Price */}
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Price *</label>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-green-500">$</span>
            <input
              type="text"
              value={data.price || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "")
                onChange({ ...data, price: val ? Number.parseFloat(val) : null })
              }}
              placeholder="0.00"
              className={cn(
                "bg-transparent text-2xl font-bold text-green-500 placeholder:text-green-500/40",
                "outline-none w-32 focus:bg-green-500/5 px-2 -mx-2 rounded transition-colors",
              )}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Payment Methods *</label>
          <div className="space-y-1.5">
            {PAYMENT_OPTIONS.map((option) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={data.paymentMethods.includes(option.id)}
                  onCheckedChange={() => togglePaymentMethod(option.id)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Logistics */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Logistics *</label>
          <div className="space-y-2">
            {/* Local Pickup */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={data.localPickup}
                  onCheckedChange={(checked) => onChange({ ...data, localPickup: checked as boolean })}
                />
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Local Pickup
                </span>
              </label>
              {data.localPickup && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Zip:</span>
                  <input
                    type="text"
                    value={data.pickupZip || ""}
                    onChange={(e) => onChange({ ...data, pickupZip: e.target.value })}
                    placeholder="00000"
                    maxLength={5}
                    className={cn(
                      "w-20 bg-card rounded border border-border px-2 py-1 text-sm",
                      "text-foreground placeholder:text-muted-foreground/40",
                      "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all",
                    )}
                  />
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={data.shippingAvailable}
                  onCheckedChange={(checked) => onChange({ ...data, shippingAvailable: checked as boolean })}
                />
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Shipping
                </span>
              </label>
              {data.shippingAvailable && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">$</span>
                  <input
                    type="text"
                    value={data.shippingCost || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "")
                      onChange({ ...data, shippingCost: val ? Number.parseFloat(val) : null })
                    }}
                    placeholder="0.00"
                    className={cn(
                      "w-16 bg-card rounded border border-border px-2 py-1 text-sm",
                      "text-foreground placeholder:text-muted-foreground/40",
                      "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all",
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Return Policy */}
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Return Policy</label>
          <textarea
            value={data.returnPolicy || ""}
            onChange={(e) => onChange({ ...data, returnPolicy: e.target.value })}
            placeholder="e.g., 7-day returns accepted, buyer pays return shipping..."
            className={cn(
              "w-full bg-card rounded-lg border border-border px-3 py-2 text-sm",
              "text-foreground placeholder:text-muted-foreground/40 resize-none",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all",
            )}
            rows={2}
          />
        </div>

        {/* Publish To */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Publish To *</label>
          <div className="flex flex-wrap gap-2">
            {PUBLISH_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => togglePublishTo(option.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all border",
                  data.publishTo.includes(option.id as any)
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
