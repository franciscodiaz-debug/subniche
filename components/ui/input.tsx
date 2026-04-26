import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent/55 focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-55",
        invalid && "border-destructive/65 focus:border-destructive/75",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
