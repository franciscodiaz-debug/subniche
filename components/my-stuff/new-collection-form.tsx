"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Globe,
  Link2,
  Lock,
  Plus,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Collection, CollectionVisibility } from "@/lib/types"
import { useCollections } from "@/lib/collections-context"
import { Button } from "@/components/ui/button"
import { InlineInput } from "@/components/ui/inline-input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const NAME_MAX = 60
const DESCRIPTION_MAX = 280
const TAGS_MAX = 8

export const NEW_COLLECTION_DRAFT_KEY = "fran:my-stuff:new-collection-draft"

type VisibilityOption = {
  value: CollectionVisibility
  label: string
  helper: string
  icon: typeof Lock
  className: string
}

const visibilityOptions: VisibilityOption[] = [
  {
    value: "private",
    label: "Private",
    helper: "Only you can see this collection.",
    icon: Lock,
    className: "border-border bg-secondary/50 text-muted-foreground",
  },
  {
    value: "unlisted",
    label: "Unlisted",
    helper: "Hidden from search, accessible by direct link.",
    icon: Link2,
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  {
    value: "public",
    label: "Public",
    helper: "Anyone can discover and view this collection.",
    icon: Globe,
    className:
      "border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400",
  },
]

interface FormState {
  name: string
  description: string
  tags: string[]
  visibility: CollectionVisibility
}

const initialState: FormState = {
  name: "",
  description: "",
  tags: [],
  visibility: "private",
}

interface NewCollectionFormProps {
  initialData?: Collection
}

export function NewCollectionForm({ initialData }: NewCollectionFormProps = {}) {
  const isEditing = !!initialData
  const router = useRouter()
  const { createCollection, updateCollection } = useCollections()

  const [form, setForm] = useState<FormState>(
    initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? "",
          tags: initialData.tags ?? [],
          visibility: initialData.visibility ?? "private",
        }
      : initialState,
  )
  const [tagDraft, setTagDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1)

  // Draft persistence (sessionStorage) — only when creating, not editing.
  // Restores on mount, saves on every change.
  const draftLoaded = useRef(false)
  useEffect(() => {
    if (isEditing) return
    if (draftLoaded.current) return
    draftLoaded.current = true
    try {
      const raw = sessionStorage.getItem(NEW_COLLECTION_DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<FormState>
      setForm((f) => ({
        ...f,
        name: parsed.name ?? f.name,
        description: parsed.description ?? f.description,
        tags: parsed.tags ?? f.tags,
        visibility: parsed.visibility ?? f.visibility,
      }))
    } catch {
      // ignore corrupt draft
    }
  }, [isEditing])

  useEffect(() => {
    if (isEditing) return
    if (!draftLoaded.current) return
    try {
      sessionStorage.setItem(NEW_COLLECTION_DRAFT_KEY, JSON.stringify(form))
    } catch {
      // ignore quota errors
    }
  }, [form, isEditing])

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

  function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault()
    if (!trimmedName) {
      setError("Give your collection a name.")
      setMobileStep(1)
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
        tags: finalTags,
      })
      router.push(`/collection/${initialData!.id}`)
      return
    }

    createCollection({
      name: trimmedName,
      description: form.description.trim() || null,
      visibility: form.visibility,
      tags: finalTags,
    })

    try {
      sessionStorage.removeItem(NEW_COLLECTION_DRAFT_KEY)
    } catch {
      // ignore
    }

    router.push("/my-stuff?tab=collections")
  }

  // Shared header — back + breadcrumb + primary action.
  const Header = (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 md:px-8">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-9 rounded-md px-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={backHref} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            My Stuff / Collections
          </p>
          <h2 className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">
            {isEditing ? `Edit — ${initialData!.name}` : "New collection"}
          </h2>
        </div>

        {/* Desktop primary action */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Link href={backHref}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!isValid}
            className="h-9 rounded-md px-4 text-sm font-medium"
            form="new-collection-form"
          >
            {isEditing ? (
              "Save"
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Create
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )

  // -- Canvas pieces (shared by desktop + mobile review step) ----------------

  const VisibilityChip = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all hover:opacity-90",
            activeVisibility.className,
          )}
        >
          <activeVisibility.icon className="h-3 w-3" />
          {activeVisibility.label}
          <ChevronRight className="h-3 w-3 -mr-1 rotate-90 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1.5">
        <div className="flex flex-col gap-0.5">
          {visibilityOptions.map((opt) => {
            const Icon = opt.icon
            const selected = form.visibility === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, visibility: opt.value }))
                }
                className={cn(
                  "flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  selected
                    ? "bg-primary/5 text-foreground"
                    : "hover:bg-secondary/60",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    selected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {opt.label}
                  </span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {opt.helper}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )

  const TagsRow = (
    <TagsInput
      tags={form.tags}
      tagDraft={tagDraft}
      onDraftChange={setTagDraft}
      onCommit={commitTag}
      onRemove={removeTag}
      onKeyDown={handleTagKeyDown}
    />
  )

  const Canvas = (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-6 md:px-8">
      {/* Visibility row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {VisibilityChip}
      </div>

      {/* Title — InlineInput at H1 size */}
      <div className="mb-2">
        <InlineInput
          value={form.name}
          onChange={(v) => {
            setError(null)
            setForm((f) => ({ ...f, name: v }))
          }}
          placeholder="Untitled collection"
          maxLength={NAME_MAX}
          autoFocus={!isEditing}
          ariaLabel="Collection name"
          inputClassName="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground"
        />
        {error ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {/* Inline stats placeholder — matches the look of a published collection */}
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>0 items</span>
      </div>

      {/* Description — InlineInput as textarea */}
      <div className="mb-5 max-w-3xl">
        <InlineInput
          as="textarea"
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          placeholder="What's this collection about? (optional)"
          maxLength={DESCRIPTION_MAX}
          ariaLabel="Collection description"
          inputClassName="text-sm sm:text-base leading-relaxed text-muted-foreground min-h-[60px]"
        />
      </div>

      {/* Tags row */}
      <div className="mb-8 max-w-3xl">{TagsRow}</div>

      {/* Item placeholders — show where items will live once the
          collection is created. Each tile mirrors the real ItemCard's
          morphology (aspect-4/3 image + two short bars below). */}
      <ItemPlaceholderGrid emphasized={isValid} />
    </div>
  )

  // -- Mobile wizard ---------------------------------------------------------

  const totalSteps = 3
  const canAdvanceFromStep1 = trimmedName.length > 0
  const progressPct = (mobileStep / totalSteps) * 100

  const MobileWizard = (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:hidden">
      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">
            Step {mobileStep} of {totalSteps}
          </span>
          <span>
            {mobileStep === 1
              ? "Basics"
              : mobileStep === 2
                ? "Privacy & tags"
                : "Review"}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        {mobileStep === 1 && (
          <section className="flex flex-col gap-6">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name your collection
              </h3>
              <InlineInput
                value={form.name}
                onChange={(v) => {
                  setError(null)
                  setForm((f) => ({ ...f, name: v }))
                }}
                placeholder="Untitled collection"
                maxLength={NAME_MAX}
                autoFocus={!isEditing}
                ariaLabel="Collection name"
                inputClassName="text-2xl font-semibold tracking-tight text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.name.length}/{NAME_MAX}
              </p>
              {error ? (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Add a description{" "}
                <span className="font-normal text-muted-foreground/70">
                  (optional)
                </span>
              </h3>
              <InlineInput
                as="textarea"
                value={form.description}
                onChange={(v) =>
                  setForm((f) => ({ ...f, description: v }))
                }
                placeholder="What's this collection about?"
                maxLength={DESCRIPTION_MAX}
                ariaLabel="Collection description"
                inputClassName="text-sm leading-relaxed text-muted-foreground min-h-[100px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.description.length}/{DESCRIPTION_MAX}
              </p>
            </div>
          </section>
        )}

        {mobileStep === 2 && (
          <section className="flex flex-col gap-6">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Who can see it?
              </h3>
              <div className="flex flex-col gap-2">
                {visibilityOptions.map((opt) => {
                  const Icon = opt.icon
                  const selected = form.visibility === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, visibility: opt.value }))
                      }
                      className={cn(
                        "flex items-start gap-3 rounded-md border bg-background px-3 py-3 text-left transition-all",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          selected ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {opt.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {opt.helper}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tags{" "}
                <span className="font-normal text-muted-foreground/70">
                  (optional)
                </span>
              </h3>
              <TagsInput
                tags={form.tags}
                tagDraft={tagDraft}
                onDraftChange={setTagDraft}
                onCommit={commitTag}
                onRemove={removeTag}
                onKeyDown={handleTagKeyDown}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Press Enter or comma to add. {form.tags.length}/{TAGS_MAX}
              </p>
            </div>
          </section>
        )}

        {mobileStep === 3 && (
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preview
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                    activeVisibility.className,
                  )}
                >
                  <activeVisibility.icon className="h-3 w-3" />
                  {activeVisibility.label}
                </span>
              </div>
              <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
                {trimmedName || "Untitled collection"}
              </h1>
              <p className="mb-3 text-xs text-muted-foreground">0 items</p>
              {form.description ? (
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  {form.description}
                </p>
              ) : null}
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              After creating, you&apos;ll be able to add items to bring this
              collection alive.
            </p>
          </section>
        )}
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        {mobileStep > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-11 flex-1 rounded-md text-sm font-medium"
            onClick={() =>
              setMobileStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : 1))
            }
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button
            asChild
            type="button"
            variant="ghost"
            size="sm"
            className="h-11 flex-1 rounded-md text-sm font-medium text-muted-foreground"
          >
            <Link href={backHref}>Cancel</Link>
          </Button>
        )}

        {mobileStep < totalSteps ? (
          <Button
            type="button"
            size="sm"
            className="h-11 flex-1 rounded-md text-sm font-medium"
            disabled={mobileStep === 1 && !canAdvanceFromStep1}
            onClick={() =>
              setMobileStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : 3))
            }
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            disabled={!isValid}
            className="h-11 flex-1 rounded-md text-sm font-medium"
            form="new-collection-form"
          >
            {isEditing ? "Save changes" : "Create"}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <form
      id="new-collection-form"
      onSubmit={handleSubmit}
      className="flex flex-col"
    >
      {Header}
      {/* Desktop canvas — hidden on mobile */}
      <div className="hidden md:block">{Canvas}</div>
      {/* Mobile wizard — hidden on desktop */}
      {MobileWizard}
    </form>
  )
}

// --------------------------------------------------------------------------
// TagsInput — small reusable bit shared by canvas + mobile step 2
// --------------------------------------------------------------------------
function TagsInput({
  tags,
  tagDraft,
  onDraftChange,
  onCommit,
  onRemove,
  onKeyDown,
}: {
  tags: string[]
  tagDraft: string
  onDraftChange: (v: string) => void
  onCommit: (v: string) => void
  onRemove: (tag: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  const tagsId = useId()
  const tagInputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      role="group"
      aria-label="Collection tags"
      onClick={() => tagInputRef.current?.focus()}
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-transparent bg-transparent px-0 py-1 text-sm transition-colors cursor-text",
        "hover:border-border focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 focus-within:bg-primary/5 focus-within:px-2 focus-within:-mx-2",
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(tag)
            }}
            aria-label={`Remove tag ${tag}`}
            className="rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={tagInputRef}
        id={tagsId}
        value={tagDraft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => onCommit(tagDraft)}
        placeholder={
          tags.length === 0
            ? "Add tags — vintage, fender, sunburst…"
            : ""
        }
        disabled={tags.length >= TAGS_MAX}
        className="min-w-[10ch] flex-1 bg-transparent px-1 py-0.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed"
      />
    </div>
  )
}

// --------------------------------------------------------------------------
// ItemPlaceholderGrid — 8 skeleton item tiles shown in the canvas to suggest
// where the user's items will appear once the collection is created. Mirrors
// the morphology of the real ItemCard (aspect-4/3 image + two text bars)
// without rendering any actual ItemCards (which would need real data).
// --------------------------------------------------------------------------
function ItemPlaceholderGrid({ emphasized }: { emphasized: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FolderOpen className="h-3.5 w-3.5" />
        <span>
          {emphasized
            ? "Your items will appear here once you create the collection."
            : "Give your collection a name to preview where items will appear."}
        </span>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 transition-opacity",
          emphasized ? "opacity-100" : "opacity-60",
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-lg border border-dashed bg-card transition-colors",
              emphasized ? "border-border" : "border-border/60",
            )}
          >
            <div className="aspect-[4/3] bg-secondary/40" />
            <div className="space-y-1.5 p-3">
              <div className="h-3 w-3/5 rounded bg-secondary/60" />
              <div className="h-2.5 w-2/5 rounded bg-secondary/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
