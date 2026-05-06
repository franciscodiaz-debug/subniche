"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, Grid2X2, Grid3X3, Grip } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type GridDensity = "cozy" | "compact" | "dense";

export const gridDensityConfig: Record<
  GridDensity,
  { cols: string; icon: LucideIcon; label: string }
> = {
  cozy: {
    cols: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2",
    icon: Grid2X2,
    label: "2x Photo",
  },
  compact: {
    cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    icon: Grid3X3,
    label: "4x Normie",
  },
  dense: {
    cols: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
    icon: Grip,
    label: "6x Full Nerd",
  },
};

const gridDensityOrder: GridDensity[] = ["cozy", "compact", "dense"];
const STORAGE_KEY = "subniche-grid-density";
const STORAGE_CHANGE_EVENT = "subniche-grid-density-change";

function isGridDensity(value: string | null): value is GridDensity {
  return value === "cozy" || value === "compact" || value === "dense";
}

function getStoredGridDensity(): GridDensity {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  return isGridDensity(stored) ? stored : "compact";
}

function getServerGridDensity(): GridDensity {
  return "compact";
}

function subscribeToGridDensity(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  };
}

export function useGridDensity() {
  const gridDensity = useSyncExternalStore(
    subscribeToGridDensity,
    getStoredGridDensity,
    getServerGridDensity,
  );

  const setGridDensity = useCallback((density: GridDensity) => {
    window.localStorage.setItem(STORAGE_KEY, density);
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }, []);

  return {
    gridDensity,
    setGridDensity,
  };
}

type GridDensitySelectorProps = {
  value: GridDensity;
  onChange: (density: GridDensity) => void;
};

export function GridDensitySelector({
  value,
  onChange,
}: GridDensitySelectorProps) {
  const Icon = gridDensityConfig[value].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Grid density"
        className={buttonVariants({
          variant: "secondary",
          size: "icon",
          className: "rounded-lg",
        })}
        title={gridDensityConfig[value].label}
      >
        <Icon className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        {gridDensityOrder.map((density) => {
          const option = gridDensityConfig[density];
          const OptionIcon = option.icon;
          const active = value === density;

          return (
            <DropdownMenuItem
              key={density}
              onClick={() => onChange(density)}
              className={cn(
                "justify-between gap-3",
                active && "text-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                <OptionIcon className="size-4" aria-hidden="true" />
                {option.label}
              </span>
              {active ? (
                <Check className="size-4 text-primary" aria-hidden="true" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
