import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type ActiveFilterChipsProps = {
  chips: ActiveFilterChip[];
  onClearAll: () => void;
};

export function ActiveFilterChips({
  chips,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground transition hover:border-accent/45"
          onClick={chip.onRemove}
        >
          {chip.label}
          <X className="size-3 text-muted-foreground" aria-hidden="true" />
        </button>
      ))}
      <Button variant="ghost" size="xs" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
