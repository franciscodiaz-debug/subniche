"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type AdminNiche } from "@/lib/admin/mock-taxonomy"
import { useAdminSettings } from "@/lib/admin-settings-context"
import { NicheFormDialog } from "@/components/admin/taxonomy/niche-form-dialog"
import { NicheConfigCard } from "./niche-config-card"

export function NicheConfigPage() {
  const { niches, setNiches } = useAdminSettings()
  const [selectedId, setSelectedId] = useState<string>(niches[0]?.id ?? "")
  const [addOpen, setAddOpen] = useState(false)

  const selected = niches.find((n) => n.id === selectedId) ?? null

  function handleUpdate(updated: AdminNiche) {
    setNiches((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
  }

  function handleAdd(data: Pick<AdminNiche, "name" | "tagline" | "description">) {
    const newNiche: AdminNiche = {
      ...data,
      id: `niche-${Date.now()}`,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      status: "inactive",
      itemCount: 0,
      categoryCount: 0,
      heroImageUrl: null,
      iconUrl: null,
    }
    setNiches((prev) => [...prev, newNiche])
    setSelectedId(newNiche.id)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Niche Config</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage per-niche copy, imagery, and status.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Niche selector */}
        <div className="w-[200px] flex-shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Niches
            </p>
            <Button size="sm" variant="ghost" onClick={() => setAddOpen(true)} className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
              <Plus className="h-3 w-3" />
              New
            </Button>
          </div>
          <ul className="overflow-hidden rounded-xl border border-border">
            {niches.map((niche) => (
              <li
                key={niche.id}
                onClick={() => setSelectedId(niche.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 border-b border-border px-4 py-3 last:border-b-0 transition-colors",
                  selectedId === niche.id
                    ? "bg-card text-foreground"
                    : "text-foreground hover:bg-card/50",
                )}
              >
                <span className="flex-1 text-sm font-medium">{niche.name}</span>
                {niche.status === "inactive" ? (
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground/60">
                    off
                  </Badge>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Config form */}
        <div className="flex-1">
          {selected ? (
            <NicheConfigCard
              key={selected.id}
              niche={selected}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Select a niche
            </div>
          )}
        </div>
      </div>

      <NicheFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        title="New Niche"
        nameOnly
      />
    </div>
  )
}
