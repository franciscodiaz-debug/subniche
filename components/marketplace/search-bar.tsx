"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  iconPosition?: "left" | "right";
};

export function SearchBar({
  iconPosition = "left",
  placeholder = "Search listings, brands, models...",
  value,
  onChange,
  className,
}: SearchBarProps) {
  const iconOnRight = iconPosition === "right";

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2",
          iconOnRight
            ? "right-4 text-primary"
            : "left-4 text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <Input
        className={cn(
          "h-11 bg-card text-base",
          iconOnRight ? "pl-4 pr-12 text-sm" : "pl-11",
        )}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}
