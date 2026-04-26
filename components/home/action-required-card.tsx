import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ActionRequiredCardProps = {
  body: string;
  icon: LucideIcon;
  meta?: string;
  title: string;
  tone?: "accent" | "info" | "success" | "warning";
};

const toneClassNames = {
  accent: "bg-accent/12 text-accent",
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
};

export function ActionRequiredCard({
  body,
  icon: Icon,
  meta,
  title,
  tone = "accent",
}: ActionRequiredCardProps) {
  return (
    <Card variant="interactive" className="min-w-72 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {meta ? <Badge variant="secondary">{meta}</Badge> : null}
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {body}
          </p>
        </div>
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-lg ${toneClassNames[tone]}`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
