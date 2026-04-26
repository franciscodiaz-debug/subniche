import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TradeMatchBadge,
  type MatchType,
} from "@/components/trade/trade-match-badge";

type TradeMatchCardProps = {
  matchType: MatchType;
  userItem: string;
  otherItem: string;
  cashAdjustment?: string;
  reason: string;
  ctaLabel?: string;
};

export function TradeMatchCard({
  matchType,
  userItem,
  otherItem,
  cashAdjustment,
  reason,
  ctaLabel = "Review trade",
}: TradeMatchCardProps) {
  return (
    <Card variant="interactive">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>Trade opportunity</CardTitle>
          <TradeMatchBadge matchType={matchType} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="rounded-lg border border-border bg-muted/45 p-3">
            <div className="text-xs uppercase text-muted-foreground">You offer</div>
            <div className="mt-1 font-semibold text-foreground">{userItem}</div>
          </div>
          <ArrowRightLeft className="mx-auto size-5 text-accent" aria-hidden="true" />
          <div className="rounded-lg border border-border bg-muted/45 p-3">
            <div className="text-xs uppercase text-muted-foreground">They offer</div>
            <div className="mt-1 font-semibold text-foreground">{otherItem}</div>
          </div>
        </div>
        {cashAdjustment ? (
          <p className="rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 text-sm text-warning">
            Cash adjustment: {cashAdjustment}
          </p>
        ) : null}
        <p className="text-sm leading-6 text-muted-foreground">{reason}</p>
      </CardContent>
      <CardFooter>
        <Button variant={matchType === "trueMatch" ? "primary" : "secondary"} size="sm">
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
