"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Link2, Edit3, Loader2, ArrowLeft, X, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WishlistEntrySelectorProps {
  onMethodSelected: (method: "url" | "manual") => void
  onUrlProcessed?: (data: {
    title: string
    description?: string
    subtitle?: string
    sourceUrl?: string
    specifications?: Record<string, string>
    imageUrl?: string
  }) => void
}

export function WishlistEntrySelector({ onMethodSelected, onUrlProcessed }: WishlistEntrySelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<"url" | "manual" | null>(null)
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(true)

  // Frontend-only mock: simulate AI extraction from a URL.
  const handleUrlSubmit = async () => {
    if (!url) return
    setIsProcessing(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 900))

      // Simple heuristics so the mock feels real.
      let title = "Item from linked page"
      const hostname = (() => {
        try {
          return new URL(url).hostname.replace("www.", "")
        } catch {
          return ""
        }
      })()
      if (hostname) title = `Item from ${hostname}`

      onUrlProcessed?.({
        title,
        subtitle: hostname || "",
        description:
          "Details imported from the linked page. Review and adjust anything that needs tweaking.",
        sourceUrl: url,
        specifications: {},
      })
      onMethodSelected("url")
    } catch (err) {
      console.error("[v0] URL processing error:", err)
      setError("Unable to process this URL. Please try entering the information manually.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 min-h-[240px] flex flex-col">
      {showHint && !selectedMethod && (
        <div className="flex items-start gap-2 bg-muted/50 rounded-lg px-3 py-2.5 mb-3 text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <p>
              <span className="font-medium text-foreground">Wishlist items</span> are things you want but don&apos;t own yet.
            </p>
            <p className="text-xs">
              Organize what you&apos;re after, complete collections, and let other collectors know.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHint(false)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss hint"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center">
        <div className="w-full">
          {!selectedMethod && (
            <p className="text-xs text-muted-foreground mb-3">Choose how you&apos;d like to add this item</p>
          )}

          {!selectedMethod ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod("url")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border bg-secondary/40 transition-all text-center",
                  "border-border hover:border-primary/50 hover:bg-secondary",
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-0.5">Add via URL</h4>
                  <p className="text-xs text-muted-foreground">Let AI fill in the details</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedMethod("manual")
                  onMethodSelected("manual")
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border bg-secondary/40 transition-all text-center",
                  "border-border hover:border-primary/50 hover:bg-secondary",
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Edit3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-0.5">Enter Manually</h4>
                  <p className="text-xs text-muted-foreground">Fill in the info yourself</p>
                </div>
              </button>
            </div>
          ) : (
            selectedMethod === "url" && (
              <div className="space-y-3">
                <label className="text-xs text-muted-foreground block">
                  Paste a link to your wishlist item
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/product"
                      disabled={isProcessing}
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUrlSubmit()
                      }}
                    />
                  </div>
                  <Button onClick={handleUrlSubmit} disabled={!url || isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Process"
                    )}
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            )
          )}

          {selectedMethod && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMethod(null)}
              className="-ml-2 mt-3 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
