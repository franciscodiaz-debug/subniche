"use client"

import { useState } from "react"
import { ArrowRightLeft, Pencil, Plus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { AdminAllowedValue, AdminAttribute, AdminSubcategory } from "@/lib/admin/mock-taxonomy"
import { ValueFormDialog } from "./value-form-dialog"
import { MergeDialog } from "./merge-dialog"

interface ValueListProps {
  attribute: AdminAttribute
  subcategory?: AdminSubcategory
  subcategories?: AdminSubcategory[]
  onUpdate: (updated: AdminAttribute) => void
}

export function ValueList({ attribute, subcategory, subcategories, onUpdate }: ValueListProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminAllowedValue | null>(null)
  const [mergeTarget, setMergeTarget] = useState<AdminAllowedValue | null>(null)

  // Subcategory context: show universal + values scoped to this subcategory.
  // Category context: show everything.
  const activeValues = attribute.allowedValues.filter(v =>
    v.status === "active" &&
    (!subcategory || !v.subcategoryIds || v.subcategoryIds.includes(subcategory.id))
  )

  const subLookup: Record<string, string> = subcategories
    ? Object.fromEntries(subcategories.map(s => [s.id, s.name]))
    : {}

  function handleAdd(label: string, subcategoryIds?: string[]) {
    const newVal: AdminAllowedValue = {
      id: `val-${Date.now()}`,
      attributeId: attribute.id,
      label,
      usageCount: 0,
      status: "active",
      ...(subcategoryIds && subcategoryIds.length > 0 ? { subcategoryIds } : {}),
    }
    onUpdate({ ...attribute, allowedValues: [...attribute.allowedValues, newVal] })
  }

  function handleEditValue(id: string, label: string, subcategoryIds?: string[]) {
    onUpdate({
      ...attribute,
      allowedValues: attribute.allowedValues.map(v =>
        v.id === id
          ? { ...v, label, subcategoryIds: subcategoryIds && subcategoryIds.length > 0 ? subcategoryIds : undefined }
          : v
      ),
    })
  }

  function handleArchive(id: string) {
    onUpdate({
      ...attribute,
      allowedValues: attribute.allowedValues.map(v =>
        v.id === id ? { ...v, status: "archived" as const } : v
      ),
    })
  }

  function handleMerge(sourceId: string) {
    onUpdate({
      ...attribute,
      allowedValues: attribute.allowedValues.map(v =>
        v.id === sourceId ? { ...v, status: "archived" as const } : v
      ),
    })
  }

  const mergeOptions = activeValues
    .filter(v => v.id !== mergeTarget?.id)
    .map(v => ({ id: v.id, label: v.label }))

  const showScopeColumn = !subcategory && activeValues.some(v => v.subcategoryIds && v.subcategoryIds.length > 0)

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Allowed Values
        </p>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-primary transition-colors hover:bg-primary/10"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {activeValues.length === 0 ? (
        <p className="text-xs text-muted-foreground/60">
          {["number", "range", "boolean", "string"].includes(attribute.inputType)
            ? "No preset values — free input"
            : "No values yet. Add some above."}
        </p>
      ) : (
        <div className="w-full overflow-hidden rounded border border-border/60">
          {/* Header */}
          <div
            className="grid border-b border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60"
            style={{ gridTemplateColumns: showScopeColumn ? "1fr 130px 48px 52px" : "1fr 48px 52px" }}
          >
            <span>Value</span>
            {showScopeColumn && <span>Scope</span>}
            <span className="text-right">Used</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/40">
            {activeValues.map(val => {
              const scopeNames = !subcategory && val.subcategoryIds && val.subcategoryIds.length > 0
                ? val.subcategoryIds.map(id => subLookup[id]).filter(Boolean)
                : []

              return (
                <div
                  key={val.id}
                  className="group grid items-center px-3 py-1.5 hover:bg-card/50"
                  style={{ gridTemplateColumns: showScopeColumn ? "1fr 130px 48px 52px" : "1fr 48px 52px" }}
                >
                  <span className="truncate text-xs text-foreground">{val.label}</span>

                  {showScopeColumn && (
                    <div className="flex min-w-0 items-center gap-1 pr-2">
                      {scopeNames.length === 0 ? null : scopeNames.length === 1 ? (
                        <Badge variant="outline" className="max-w-full truncate text-[10px] font-normal text-muted-foreground/60 border-muted-foreground/20">
                          {scopeNames[0]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground/60 border-muted-foreground/20">
                          {scopeNames[0]} +{scopeNames.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}

                  <span className="text-right text-[11px] tabular-nums text-muted-foreground/50">
                    {val.usageCount > 0 ? val.usageCount : "—"}
                  </span>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditTarget(val)}
                      className="rounded p-0.5 text-muted-foreground/30 transition-colors hover:text-primary"
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    {val.usageCount > 0 && (
                      <button
                        onClick={() => setMergeTarget(val)}
                        className="rounded p-0.5 text-muted-foreground/30 transition-colors hover:text-amber-400"
                        title="Merge into another value"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(val.id)}
                      className="rounded p-0.5 text-muted-foreground/30 transition-colors hover:text-destructive"
                      title={val.usageCount > 0 ? `Remove (${val.usageCount} existing listings use this value)` : "Remove"}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add row */}
          <button
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center gap-1.5 border-t border-border/40 bg-muted/10 px-3 py-1.5 text-xs text-muted-foreground/50 transition-colors hover:bg-card/50 hover:text-muted-foreground"
          >
            <Plus className="h-3 w-3" />
            Add value
          </button>
        </div>
      )}

      <ValueFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        title="Add Allowed Value"
        attributeName={attribute.name}
        subcategories={subcategories?.map(s => ({ id: s.id, name: s.name }))}
        defaultSubcategoryIds={subcategory ? [subcategory.id] : []}
      />

      {editTarget ? (
        <ValueFormDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(label, subcategoryIds) => {
            handleEditValue(editTarget.id, label, subcategoryIds)
            setEditTarget(null)
          }}
          initial={editTarget.label}
          defaultSubcategoryIds={editTarget.subcategoryIds ?? []}
          title="Edit Value"
          attributeName={attribute.name}
          subcategories={subcategories?.map(s => ({ id: s.id, name: s.name }))}
        />
      ) : null}

      {mergeTarget ? (
        <MergeDialog
          open={!!mergeTarget}
          onClose={() => setMergeTarget(null)}
          onConfirm={() => { handleMerge(mergeTarget.id); setMergeTarget(null) }}
          sourceLabel={mergeTarget.label}
          sourceUsageCount={mergeTarget.usageCount}
          options={mergeOptions}
          entityType="value"
        />
      ) : null}
    </div>
  )
}
