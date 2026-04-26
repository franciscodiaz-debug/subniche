"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function SearchBar({
  placeholder = "Search listings, brands, models...",
  value,
  onChange,
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        className="h-11 bg-card pl-11 text-base"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}
