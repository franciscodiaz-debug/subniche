"use client"

import { useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Globe, Heart, Link2, Lock, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Collection, CollectionVisibility } from "@/lib/types"
import { useCollections } from "@/lib/collections-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CollectionCard } from "@/components/collection-card"

const NAME_MAX = 60
const DESCRIPTION_MAX = 280
const TAGS_MAX = 8

export const NEW_COLLECTION_DRAFT_KEY = "fran:my-stuff:new-collection-draft"

type VisibilityOption = {
  value: CollectionVisibility
  label: string
  helper: string
  icon: typeof Lock
  iconClassName: string
}

const visibilityOptions: VisibilityOption[] = [
  {
    value: "private",
    label: "Private",
    helper: "Only you can see this collection.",
    icon: Lock,
    iconClassName: "text-muted-foreground",
  },
  {
    value: "unlisted",
    label: "Unlisted",
    helper: "Hidden from search, accessible by direct link.",
    icon: Link2,
    iconClassName: "text-primary",
  },
  {
    value: "public",
    label: "Public",
    helper: "Anyone can discover and view this collection.",
    icon: Globe,
    iconClassName: "text-chart-2",
  },
]

interface FormState {
  name: string
  description: string
  tags: string[]
  visibility: CollectionVisibility
  is_wishlist: boolean
}

const initialState: FormState = {
  name: "",
  description: "",
  tags: [],
  visibility: "private",
  is_wishlist: false,
}

interface NewCollectionFormProps {
  initialData?: Collection
}

export function NewCollectionForm({ initialData }: NewCollectionFormProps = {}) {
  const isEditing = !!initialData
  const router = useRouter()
  const { createCollection, updateCollection } = useCollections()
  const nameId = useId()
  const descriptionId = useId()
  const tagsId = useId()
  const wishlistId = useId()

  const [form, setForm] = useState<FormState>(
    initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? "",
          tags: initialData.tags ?? [],
          visibility: initialData.visibility ?? "private",
          is_wishlist: initialData.is_wishlist ?? false,
        }
      : initialState,
  )
  const [tagDraft, setTagDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const trimmedName = form.name.trim()
  const isValid = trimmedName.length > 0 && trimmedName.length <= NAME_MAX
  const activeVisibility = useMemo(
    () => visibilityOptions.find((o) => o.value === form.visibility)!,
    [form.visibility],
  )

  function commitTag(raw: string) {
    const next = raw.trim().replace(/^#/, "")
    if (!next) return
    if (form.tags.length >= TAGS_MAX) return
    if (form.tags.some((t) => t.toLowerCase() === next.toLowerCase())) {
      setTagDraft("")
      return
    }
    setForm((f) => ({ ...f, tags: [...f.tags, next] }))
    setTagDraft("")
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitTag(tagDraft)
    } else if (e.key === "Backspace" && !tagDraft && form.tags.length) {
      e.preventDefault()
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  const backHref = isEditing
    ? `/collection/${initialData!.id}`
    : "/my-stuff?tab=collections"

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!trimmedName) {
      setError("Give your collection a name.")
      return
    }
    if (trimmedName.length > NAME_MAX) {
      setError(`Name must be ${NAME_MAX} characters or fewer.`)
      return
    }

    const pendingTag = tagDraft.trim().replace(/^#/, "")
    const finalTags =
      pendingTag &&
      form.tags.length < TAGS_MAX &&
      !form.tags.some((t) => t.toLowerCase() === pendingTag.toLowerCase())
        ? [...form.tags, pendingTag]
        : form.tags

    if (isEditing) {
      updateCollection(initialData!.id, {
        name: trimmedName,
        description: form.description.trim() || null,
        visibility: form.visibility,
        is_wishlist: form.is_wishlist,
        tags: finalTags,
      })
      router.push(`/collection/${initialData!.id}`)
      return
    }

    createCollection({
      name: trimmedName,
      description: form.description.trim() || null,
      visibility: form.visibility,
      is_wishlist: form.is_wishlist,
      tags: finalTags,
    })

    router.push("/my-stuff?tab=collections")
  }

  const previewCollection: Collection = {
    id: "preview",
    name: trimmedName || "Your collection",
    description: form.description.trim() || null,
    visibility: form.visibility,
    is_wishlist: form.is_wishlist,
    tags: form.tags,
    item_count: 0,
    total_user_value: 0,
    total_ai_value: 0,
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
          <Button asChild variant="ghost" size="sm" className="h-9 -ml-2 rounded-md px-2 text-muted-foreground hover:text-foreground">
            <Link href={backHref} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              My Stuff / Collections
            </p>
            <h1 className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">
              {isEditing ? `Edit — ${initialData!.name}` : "Create new collection"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild type="button" variant="ghost" size="sm" className="hidden h-9 rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex">
              <Link href={backHref}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={!isValid} className="h-9 rounded-md px-4 text-sm font-medium">
              {isEditing ? "Save" : <><Plus className="mr-1 h-4 w-4" />Create</>}
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Form column */}
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Details</h2>
              <p className="text-sm text-muted-foreground">Group items together &mdash; for sale, for trade, or just to show off.</p>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={nameId} className="text-sm font-medium">Collection name</Label>
                <span className="text-xs text-muted-foreground tabular-nums">{form.name.length}/{NAME_MAX}</span>
              </div>
              <Input
                id={nameId}
                autoFocus
                value={form.name}
                maxLength={NAME_MAX}
                placeholder="e.g. Vintage Strats"
                onChange={(e) => { setError(null); setForm((f) => ({ ...f, name: e.target.value })) }}
                className="h-11 rounded-md border-border bg-background text-base"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${nameId}-error` : undefined}
              />
              {error ? <p id={`${nameId}-error`} className="text-xs text-destructive" role="alert">{error}</p> : null}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={descriptionId} className="text-sm font-medium">
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <span className="text-xs text-muted-foreground tabular-nums">{form.description.length}/{DESCRIPTION_MAX}</span>
              </div>
              <Textarea
                id={descriptionId}
                value={form.description}
                maxLength={DESCRIPTION_MAX}
                placeholder="What's this collection about?"
                rows={4}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="resize-none rounded-md border-border bg-background"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={tagsId} className="text-sm font-medium">
                  Tags <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <span className="text-xs text-muted-foreground tabular-nums">{form.tags.length}/{TAGS_MAX}</span>
              </div>
              <div
                role="group"
                aria-label="Collection tags"
                onClick={() => tagInputRef.current?.focus()}
                className={cn(
                  "flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-sm transition-colors",
                  "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
                )}
              >
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`} className="rounded-full text-muted-foreground transition-colors hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  id={tagsId}
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => commitTag(tagDraft)}
                  placeholder={form.tags.length === 0 ? "vintage, fender, sunburst" : ""}
                  disabled={form.tags.length >= TAGS_MAX}
                  className="min-w-[8ch] flex-1 bg-transparent px-1 py-0.5 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">Press Enter or comma to add. Tags help others discover your collection.</p>
            </div>
          </section>

          <div className="h-px w-full bg-border" />

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Privacy</h2>
              <p className="text-sm text-muted-foreground">Choose who can see this collection.</p>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Visibility</legend>
              <div role="radiogroup" aria-label="Collection visibility" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {visibilityOptions.map((opt) => {
                  const Icon = opt.icon
                  const selected = form.visibility === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setForm((f) => ({ ...f, visibility: opt.value }))}
                      className={cn(
                        "group flex flex-col items-start gap-1.5 rounded-md border bg-background px-3 py-3 text-left transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon className={cn("h-4 w-4", selected ? "text-primary" : opt.iconClassName)} />
                        <span className={cn("text-sm font-medium", selected ? "text-primary" : "text-foreground")}>{opt.label}</span>
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground">{opt.helper}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {/* Wishlist toggle */}
            <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-background px-3 py-3">
              <div className="flex items-start gap-2.5">
                <Heart className={cn("mt-0.5 h-4 w-4 transition-colors", form.is_wishlist ? "fill-current text-chart-5" : "text-muted-foreground")} />
                <div className="flex flex-col">
                  <Label htmlFor={wishlistId} className="cursor-pointer text-sm font-medium">Mark as wishlist</Label>
                  <p className="text-xs text-muted-foreground">Track items you&apos;re hunting for instead of items you own.</p>
                </div>
              </div>
              <Switch id={wishlistId} checked={form.is_wishlist} onCheckedChange={(v) => setForm((f) => ({ ...f, is_wishlist: v }))} />
            </div>
          </section>

          {/* Mobile footer */}
          <div className="flex items-center gap-2 border-t border-border pt-4 lg:hidden">
            <Button asChild type="button" variant="ghost" size="sm" className="h-10 flex-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground">
              <Link href={backHref}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={!isValid} className="h-10 flex-1 rounded-md text-sm font-medium">
              {isEditing ? "Save changes" : <><Plus className="mr-1 h-4 w-4" />Create collection</>}
            </Button>
          </div>
        </div>

        {/* Preview column — desktop only */}
        <aside className="hidden flex-col gap-3 lg:flex">
          <div className="sticky top-24 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Preview</h2>
              <span className="text-xs text-muted-foreground">{activeVisibility.label}</span>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
              <CollectionCard collection={previewCollection} view="grid" href="#" />
            </div>
            {form.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-card px-3 py-2.5">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-xs leading-relaxed text-muted-foreground">{activeVisibility.helper}</p>
          </div>
        </aside>
      </div>
    </form>
  )
}
