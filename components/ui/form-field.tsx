import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  helpText?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  helpText,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs leading-5 text-destructive">{error}</p>
      ) : helpText ? (
        <p className="text-xs leading-5 text-muted-foreground">{helpText}</p>
      ) : null}
    </div>
  );
}
