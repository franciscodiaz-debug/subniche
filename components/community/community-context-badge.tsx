import { Globe2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CommunityContextBadgeProps = {
  className?: string;
  label: string;
  publicMarket?: boolean;
};

export function CommunityContextBadge({
  className,
  label,
  publicMarket,
}: CommunityContextBadgeProps) {
  const Icon = publicMarket ? Globe2 : Users;

  return (
    <Badge
      className={cn("max-w-full", className)}
      variant={publicMarket ? "outline" : "secondary"}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {publicMarket ? "Public Market" : label}
    </Badge>
  );
}
