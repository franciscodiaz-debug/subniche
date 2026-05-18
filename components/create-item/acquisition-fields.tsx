"use client"

import type React from "react"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import { Receipt, Upload, X } from "lucide-react"
import type { ItemCollectionStatus } from "@/lib/types/item-status"

interface AcquisitionFieldsProps {
  data: ItemCollectionStatus
  onChange: (data: ItemCollectionStatus) => void
}

/**
 * Optional acquisition history for an owned item: when it was acquired, for
 * how much, and a receipt photo. Shown for any owned item (For Sale, For
 * Trade, Keeping) — never for Wishlist, since wishlist items aren't owned.
 *
 * All fields are optional; the section exists purely so collectors can keep
 * provenance alongside the listing.
 */
export function AcquisitionFields({ data, onChange }: AcquisitionFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onChange({ ...data, receiptUrl: url })
    }
  }

  return (
    <div
      data-section
      className="bg-card rounded-lg border border-border p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-foreground">Acquisition</h2>
        <Receipt className="h-4 w-4 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Optional — track when and how you got this item.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Date Acquired
            </label>
            <input
              type="date"
              value={data.dateAcquired || ""}
              onChange={(e) =>
                onChange({ ...data, dateAcquired: e.target.value || null })
              }
              className={cn(
                "w-full bg-card rounded-lg border border-border px-3 py-2 text-sm text-foreground",
                "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
              )}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Acquisition Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.acquisitionPrice || ""}
                onChange={(e) =>
                  onChange({ ...data, acquisitionPrice: e.target.value || null })
                }
                className={cn(
                  "w-full bg-card rounded-lg border border-border pl-7 pr-3 py-2 text-sm",
                  "text-foreground placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Receipt / Proof of Purchase
          </label>
          {data.receiptUrl ? (
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
              <img
                src={data.receiptUrl || "/placeholder.svg"}
                alt="Receipt"
                className="w-14 h-14 object-cover rounded-md"
              />
              <div className="flex-1">
                <p className="text-sm text-foreground">Receipt uploaded</p>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, receiptUrl: null })}
                  className="text-xs text-destructive hover:underline flex items-center gap-1 mt-1"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed transition-colors",
                "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
              )}
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">Upload receipt</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
