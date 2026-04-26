import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
  className?: string;
};

export function FormSection({
  children,
  className,
  description,
  eyebrow,
  title,
}: FormSectionProps) {
  return (
    <Card className={cn("overflow-hidden rounded-lg bg-card", className)}>
      <CardHeader className="border-b border-border/70 p-4">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase text-accent">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-5 p-4">{children}</CardContent>
    </Card>
  );
}
