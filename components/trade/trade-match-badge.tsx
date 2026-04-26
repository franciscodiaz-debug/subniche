import { Badge } from "@/components/ui/badge";

export type MatchType = "trueMatch" | "inboundInterest" | "suggested";

const matchConfig: Record<
  MatchType,
  { label: string; variant: "success" | "info" | "outline" }
> = {
  trueMatch: { label: "True Match", variant: "success" },
  inboundInterest: { label: "Inbound Interest", variant: "info" },
  suggested: { label: "Suggested", variant: "outline" },
};

type TradeMatchBadgeProps = {
  matchType: MatchType;
};

export function TradeMatchBadge({ matchType }: TradeMatchBadgeProps) {
  const config = matchConfig[matchType];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
