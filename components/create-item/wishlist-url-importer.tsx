"use client"

import { useState } from "react"
import { Heart, Link2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WishlistUrlImporterProps {
  onUrlProcessed: (data: {
    title: string
    description?: string
    subtitle?: string
    sourceUrl?: string
    specifications?: Record<string, string>
    imageUrl?: string
  }) => void
}

/**
 * Header banner shown when the user is creating a wishlist item. Frames the
 * task ("you're adding something you want") and offers an optional URL
 * importer that fills the form via AI. The form below is always editable —
 * URL import is a shortcut, not a gate.
 */
export function WishlistUrlImporter({ onUrlProcessed }: WishlistUrlImporterProps) {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Frontend-only mock: simulate AI extraction from a URL.
  const handleSubmit = async () => {
    if (!url) return
    setIsProcessing(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 900))

      let title = "Item from linked page"
      const hostname = (() => {
        try {
          return new URL(url).hostname.replace("www.", "")
        } catch {
          return ""
        }
      })()
      if (hostname) title = `Item from ${hostname}`

      onUrlProcessed({
        title,
        subtitle: hostname || "",
        description:
          "Details imported from the linked page. Review and adjust anything that needs tweaking.",
        sourceUrl: url,
        specifications: {},
      })
      setUrl("")
    } catch (err) {
      console.error("[wishlist] URL processing error:", err)
      setError("Unable to process this URL. Try entering the information manually below.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Context header — always visible while authoring a wishlist item. */}
      <div className="flex items-start gap-3 bg-card border border-border rounded-lg p-4 md:p-5">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground leading-tight">
            Add to your wishlist
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Wishlist items are things you want but don&apos;t own yet — track
            what you&apos;re after and let other collectors know.
          </p>
        </div>
      </div>

      {/* Optional URL importer — shortcut for users who already have a link.
          The form below is always available regardless of whether this is
          used. */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-5">
        <label className="text-xs text-muted-foreground mb-2 block">
          Have a link? Paste it and AI will fill in the details
          <span className="text-muted-foreground/70"> — optional</span>
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
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>
          <Button onClick={handleSubmit} disabled={!url || isProcessing}>
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
}
