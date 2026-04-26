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
    specifications?: Record<string, string>
    imageUrl?: string
  }) => void
}

export function WishlistEntrySelector({ onMethodSelected, onUrlProcessed }: WishlistEntrySelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<"url" | "manual" | null>(null)
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlProcessed, setUrlProcessed] = useState(false)
  const [showHint, setShowHint] = useState(true)

  const handleUrlSubmit = async () => {
    if (!url) return

    setIsProcessing(true)
    setError(null)

    try {
      // Call API to process the URL with AI
      const response = await fetch("/api/process-wishlist-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Failed to process URL")
      }

      const data = await response.json()

      // Pass the processed data back to parent
      onUrlProcessed?.(data)
      onMethodSelected("url")
      setUrlProcessed(true)
    } catch (err) {
      console.error("[v0] URL processing error:", err)
      setError("Unable to process this URL. Please try entering the information manually.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-4 min-h-[240px] flex flex-col">
      

      {showHint && !selectedMethod && (
        <div className="flex items-start gap-2 bg-muted/50 rounded-md px-3 py-2.5 mb-3 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <Lightbulb className="h-4 w-4 text-primary/70" />
            
          </div>
          <div className="flex-1 space-y-2">
            <p>
              <span className="font-medium text-foreground">Wishlist items</span> are things you want but don't own yet.
            </p>
            <p>
              Use this feature to organize, complete collections, and let other users know what you&apos;re after.
            </p>
          </div>
          <button
            onClick={() => setShowHint(false)}
            className="flex-shrink-0 hover:text-foreground transition-colors"
            aria-label="Dismiss hint"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center">
        <div className="w-full">
          {!selectedMethod && (
            <p className="text-xs text-muted-foreground mb-4">Choose how you'd like to add this item</p>
          )}

          {!selectedMethod ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Add via URL Option */}
              <button
                onClick={() => setSelectedMethod("url")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  "border-border hover:border-primary hover:bg-accent",
                  "text-center group",
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-0.5">Add via URL</h4>
                  <p className="text-xs text-muted-foreground">Let AI fill in the details</p>
                </div>
              </button>

              {/* Manual Entry Option */}
              <button
                onClick={() => {
                  setSelectedMethod("manual")
                  onMethodSelected("manual")
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  "border-border hover:border-primary hover:bg-accent",
                  "text-center group",
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
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
                <div className="my-4">
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Paste a link to your wishlist item{" "}
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
                        className="pl-10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUrlSubmit()
                          }
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
                  {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                </div>
              </div>
            )
          )}

          {selectedMethod && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMethod(null)}
              className="-ml-2 text-muted-foreground hover:text-foreground"
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
