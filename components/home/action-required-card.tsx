import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type ActionRequiredCardProps = {
  actionLabel?: string;
  actor?: string;
  avatarUrl?: string;
  body: string;
  href?: string;
  icon: LucideIcon;
  meta?: string;
  timestamp?: string;
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
  actionLabel = "Open",
  actor,
  avatarUrl,
  body,
  href,
  icon: Icon,
  meta,
  timestamp,
  title,
  tone = "accent",
}: ActionRequiredCardProps) {
  const content = (
    <Card
      variant="interactive"
      className="flex min-h-[200px] flex-col rounded-xl p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={actor ?? title}
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {actor ?? meta}
            </p>
            {timestamp ? (
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            ) : null}
          </div>
        </div>
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-full bg-secondary ${toneClassNames[tone]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-base font-bold text-foreground">{meta ?? title}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">
        {body}
      </p>
      {href ? (
        <div className="mt-4 pt-2 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {actionLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      ) : null}
      <span className="sr-only">{title}</span>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="group/card block">
      {content}
    </Link>
  );
}
