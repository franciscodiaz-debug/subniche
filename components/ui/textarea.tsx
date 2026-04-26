import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent/55 focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-55",
        invalid && "border-destructive/65 focus:border-destructive/75",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
