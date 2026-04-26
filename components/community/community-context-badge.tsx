import { Badge } from "@/components/ui/badge";

type CommunityContextBadgeProps = {
  label: string;
  publicMarket?: boolean;
};

export function CommunityContextBadge({
  label,
  publicMarket,
}: CommunityContextBadgeProps) {
  return (
    <Badge variant={publicMarket ? "outline" : "secondary"}>
      {publicMarket ? "Public Market" : label}
    </Badge>
  );
}
