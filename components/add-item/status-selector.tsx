"use client";

import { DollarSign, FolderOpen, Heart, Repeat2 } from "lucide-react";
import type { ItemMode, OwnedStatusState } from "@/components/add-item/types";
import { cn } from "@/lib/utils";

type StatusSelectorProps = {
  mode: ItemMode;
  statuses: OwnedStatusState;
  onModeChange: (mode: ItemMode) => void;
  onStatusesChange: (statuses: OwnedStatusState) => void;
};

const ownedOptions = [
  {
    key: "forSale",
    label: "For Sale",
    description: "Set a price and let people make an offer.",
    icon: DollarSign,
    activeClass: "border-accent/55 bg-accent/12 text-accent",
  },
  {
    key: "forTrade",
    label: "For Trade",
    description: "Tell people what you would take in exchange.",
    icon: Repeat2,
    activeClass: "border-info/50 bg-info/12 text-info",
  },
  {
    key: "inCollection",
    label: "In Collection",
    description: "Show it as part of what you own.",
    icon: FolderOpen,
    activeClass: "border-border bg-muted text-foreground",
  },
] as const;

export function StatusSelector({
  mode,
  onModeChange,
  onStatusesChange,
  statuses,
}: StatusSelectorProps) {
  const isWanted = mode === "wanted";

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        Item status
        <span
          className="grid size-5 place-items-center rounded-full border border-border text-xs"
          aria-label="Owned items can be listed, traded, and collected at the same time."
        >
          i
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {ownedOptions.map((option) => {
          const Icon = option.icon;
          const active = !isWanted && statuses[option.key];

          return (
            <button
              key={option.key}
              type="button"
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-muted-foreground transition hover:border-accent/45 hover:text-foreground",
                active && option.activeClass,
                isWanted && "opacity-55",
              )}
              aria-pressed={active}
              onClick={() => {
                const nextStatuses = {
                  ...statuses,
                  [option.key]: !statuses[option.key],
                };
                onModeChange("owned");
                onStatusesChange(nextStatuses);
              }}
            >
              <Icon className="size-4" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
        <span
          className="hidden h-8 w-px bg-border sm:block"
          aria-hidden="true"
        />
        <button
          type="button"
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-muted-foreground transition hover:border-warning/45 hover:text-foreground",
            isWanted && "border-warning/50 bg-warning/12 text-warning",
          )}
          aria-pressed={isWanted}
          onClick={() => onModeChange(isWanted ? "owned" : "wanted")}
        >
          <Heart className="size-4" aria-hidden="true" />
          Wanted
        </button>
      </div>
    </section>
  );
}
