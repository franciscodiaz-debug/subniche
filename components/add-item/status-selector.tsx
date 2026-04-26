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
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {ownedOptions.map((option) => {
          const Icon = option.icon;
          const active = !isWanted && statuses[option.key];

          return (
            <button
              key={option.key}
              type="button"
              className={cn(
                "min-h-28 rounded-xl border border-border bg-background p-4 text-left transition hover:border-accent/45 hover:bg-muted/40",
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
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="size-4" aria-hidden="true" />
                {option.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {option.description}
              </p>
            </button>
          );
        })}
        <button
          type="button"
          className={cn(
            "min-h-28 rounded-xl border border-border bg-background p-4 text-left transition hover:border-warning/45 hover:bg-warning/10",
            isWanted && "border-warning/50 bg-warning/12 text-warning",
          )}
          aria-pressed={isWanted}
          onClick={() => onModeChange(isWanted ? "owned" : "wanted")}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Heart className="size-4" aria-hidden="true" />
            Wanted
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Add something you are looking for, separate from owned inventory.
          </p>
        </button>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Owned items can be in your collection and also open to sale or trade.
        Wanted mode is separate so it is not confused with gear you own.
      </p>
    </div>
  );
}
