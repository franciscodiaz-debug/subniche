import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  body: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
};

export function EmptyState({
  title,
  body,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <Card className="grid min-h-72 place-items-center p-8 text-center">
      <div className="max-w-md space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {primaryAction}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
