"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { DollarSign, FolderOpen, Heart, Repeat2 } from "lucide-react";
import type { ItemMode, OwnedStatusState } from "@/components/add-item/types";
import { cn } from "@/lib/utils";

type StatusSelectorProps = {
  mode: ItemMode;
  statuses: OwnedStatusState;
  onModeChange: (mode: ItemMode) => void;
  onStatusesChange: (statuses: OwnedStatusState) => void;
};

type StatusNotice = {
  key: string;
  message: ReactNode;
  tone: "collection" | "sale" | "trade" | "wishlist";
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
  const hasPublishingStatus = statuses.forSale || statuses.forTrade;
  const [notice, setNotice] = useState<StatusNotice | null>(null);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  return (
    <section className="space-y-2">
      <div
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <span className="font-medium">Status</span>
        <span
          className="grid size-5 place-items-center rounded-full border border-border text-xs"
          aria-label="Owned items can be listed, traded, and collected at the same time. Wishlist is for items you do not own."
        >
          i
        </span>
        {notice ? (
          <StatusNote tone={notice.tone}>{notice.message}</StatusNote>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {ownedOptions.map((option) => {
          const Icon = option.icon;
          const active = !isWanted && statuses[option.key];
          const disabled = isWanted && option.key !== "inCollection";

          return (
            <button
              key={option.key}
              type="button"
              disabled={disabled}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-semibold text-muted-foreground transition hover:border-accent/45 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                active && `${option.activeClass} shadow-card`,
                disabled && "cursor-not-allowed opacity-55",
              )}
              aria-pressed={active}
              onClick={() => {
                const nextActive = !statuses[option.key];
                const nextStatuses =
                  isWanted && option.key === "inCollection"
                    ? { forSale: false, forTrade: false, inCollection: true }
                    : {
                        ...statuses,
                        [option.key]: nextActive,
                      };
                onModeChange("owned");
                onStatusesChange(nextStatuses);
                if (nextActive || isWanted) {
                  setNotice(getStatusNotice(option.key));
                } else {
                  setNotice(null);
                }
              }}
            >
              <Icon className="size-4" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
        <span
          className="hidden h-6 w-px bg-border sm:block"
          aria-hidden="true"
        />
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-semibold text-muted-foreground transition hover:border-warning/45 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/30",
            isWanted && "border-warning/50 bg-warning/12 text-warning shadow-card",
            hasPublishingStatus && !isWanted && "cursor-not-allowed opacity-55",
          )}
          aria-pressed={isWanted}
          disabled={hasPublishingStatus && !isWanted}
          onClick={() => {
            const nextMode = isWanted ? "owned" : "wanted";
            onModeChange(nextMode);
            setNotice(nextMode === "wanted" ? getWishlistNotice() : null);
          }}
        >
          <Heart className="size-4" aria-hidden="true" />
          Wishlist
        </button>
      </div>
    </section>
  );
}

function getStatusNotice(key: (typeof ownedOptions)[number]["key"]): StatusNotice {
  if (key === "forSale") {
    return {
      key: `sale-${Date.now()}`,
      message: "For Sale fields added",
      tone: "sale",
    };
  }

  if (key === "forTrade") {
    return {
      key: `trade-${Date.now()}`,
      message: "For Trade fields added - you'll set interests in the next step",
      tone: "trade",
    };
  }

  return {
    key: `collection-${Date.now()}`,
    message: "Collection fields added",
    tone: "collection",
  };
}

function getWishlistNotice(): StatusNotice {
  return {
    key: `wishlist-${Date.now()}`,
    message: "Wishlist fields added",
    tone: "wishlist",
  };
}

function StatusNote({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "collection" | "sale" | "trade" | "wishlist";
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "collection" && "bg-primary",
          tone === "sale" && "bg-accent",
          tone === "trade" && "bg-info",
          tone === "wishlist" && "bg-warning",
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
