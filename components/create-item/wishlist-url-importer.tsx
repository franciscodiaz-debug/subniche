"use client"

import { useState } from "react"
import { ChevronDown, Link2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WishlistUrlImporterProps {
  /**
   * Tracks how the user is filling the wishlist item:
   * - `null` → no decision yet; show the full URL importer + "fill manually" CTA
   * - `"url"` or `"manual"` → the user has committed to a path; importer collapses
   */
  entryMethod: "url" | "manual" | null
  onFillManually: () => void
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
 * Progressive disclosure for wishlist creation. Before the user picks a
 * method, this is the only thing visible under the status hint. Once they
 * either process a URL or choose to fill manually, it collapses to a small
 * "try with a URL instead" affordance so they can re-expand if they change
 * their mind.
 */
export function WishlistUrlImporter({
  entryMethod,
  onFillManually,
  onUrlProcessed,
}: WishlistUrlImporterProps) {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Allows the user to re-expand the importer after collapsing it (e.g. they
  // chose "fill manually" but later realized they had a link).
  const [forceExpanded, setForceExpanded] = useState(false)

  const isCollapsed = entryMethod !== null && !forceExpanded

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
      setForceExpanded(false)
    } catch (err) {
      console.error("[wishlist] URL processing error:", err)
      setError("Unable to process this URL. Try entering the information manually below.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setForceExpanded(true)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Link2 className="h-3.5 w-3.5" />
        <span>Try with a URL instead</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-5 space-y-4">
      <div>
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

      {/* Manual escape hatch — for users who don't have a link or prefer to
          fill the form themselves. */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex-1 h-px bg-border" />
        <span>or</span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setForceExpanded(false)
          onFillManually()
        }}
        className="w-full"
      >
        Fill in manually
      </Button>
    </div>
  )
}
