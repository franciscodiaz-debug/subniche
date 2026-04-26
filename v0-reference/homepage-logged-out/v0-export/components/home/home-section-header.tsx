import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface HomeSectionHeaderProps {
  icon: ReactNode;
  title: string;
  href?: string;
  ctaLabel?: string;
  ctaTone?: "primary" | "neutral";
}

export function HomeSectionHeader({
  icon,
  title,
  href,
  ctaLabel,
  ctaTone = "primary",
}: HomeSectionHeaderProps) {
  const ctaClassName =
    ctaTone === "neutral"
      ? "text-sm text-muted-foreground transition-colors hover:text-foreground"
      : "text-sm text-muted-foreground transition-colors hover:text-primary";

  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        {icon}
        <span>{title}</span>
      </h2>

      {href && ctaLabel ? (
        <Link href={href} className={`flex items-center gap-1 ${ctaClassName}`}>
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
