"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ImageIcon } from "lucide-react"
import type { AdminNiche } from "@/lib/admin/mock-taxonomy"

interface NicheConfigCardProps {
  niche: AdminNiche
  onUpdate: (updated: AdminNiche) => void
}

export function NicheConfigCard({ niche, onUpdate }: NicheConfigCardProps) {
  const [name, setName] = useState(niche.name)
  const [tagline, setTagline] = useState(niche.tagline)
  const [description, setDescription] = useState(niche.description)
  const [status, setStatus] = useState<AdminNiche["status"]>(niche.status)
  const [heroImageUrl, setHeroImageUrl] = useState(niche.heroImageUrl ?? "")
  const [iconUrl, setIconUrl] = useState(niche.iconUrl ?? "")
  const [showDeactivateWarning, setShowDeactivateWarning] = useState(false)

  function handleStatusToggle(active: boolean) {
    if (!active && niche.status === "active") {
      setShowDeactivateWarning(true)
    } else {
      setShowDeactivateWarning(false)
    }
    setStatus(active ? "active" : "inactive")
  }

  function handleSave() {
    onUpdate({
      ...niche,
      name,
      tagline,
      description,
      status,
      heroImageUrl: heroImageUrl.trim() || null,
      iconUrl: iconUrl.trim() || null,
    })
    toast.success("Niche config saved.")
  }

  function handleDiscard() {
    setName(niche.name)
    setTagline(niche.tagline)
    setDescription(niche.description)
    setStatus(niche.status)
    setHeroImageUrl(niche.heroImageUrl ?? "")
    setIconUrl(niche.iconUrl ?? "")
    setShowDeactivateWarning(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Identity section */}
      <div className="px-6 py-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Identity
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nc-name">Name</Label>
              <Input
                id="nc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nc-slug">Slug</Label>
              <Input
                id="nc-slug"
                value={niche.slug}
                readOnly
                className="cursor-default text-muted-foreground"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-tagline">Tagline</Label>
            <Input
              id="nc-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short tagline shown on niche header"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-desc">Description</Label>
            <Textarea
              id="nc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Longer description of the niche"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Status section */}
      <div className="px-6 py-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {status === "active" ? "Active" : "Inactive"}
            </p>
            <p className="text-xs text-muted-foreground">
              {status === "active"
                ? "Niche is visible to all users."
                : "Niche is hidden from all users."}
            </p>
          </div>
          <Switch
            checked={status === "active"}
            onCheckedChange={handleStatusToggle}
          />
        </div>
        {showDeactivateWarning ? (
          <Alert className="mt-3 border-amber-400/30 bg-amber-400/10">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-sm text-amber-400">
              Deactivating will hide this niche from all users. Existing listings, items, and collections remain stored and can be restored by reactivating.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <Separator />

      {/* Imagery section */}
      <div className="px-6 py-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Imagery
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nc-hero">Hero image URL</Label>
            <Input
              id="nc-hero"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://…"
            />
            {heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="mt-2 h-24 w-full rounded-lg border border-border object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="mt-2 flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nc-icon">Icon URL</Label>
            <div className="flex items-center gap-3">
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconUrl}
                  alt="Icon preview"
                  className="h-10 w-10 rounded-lg border border-border object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                </div>
              )}
              <Input
                id="nc-icon"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground/60">
            Prototype: paste a direct image URL. Production will use file upload.
          </p>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4">
        <Button variant="ghost" onClick={handleDiscard}>
          Discard
        </Button>
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  )
}
