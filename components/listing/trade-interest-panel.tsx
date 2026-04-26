import { TradeMatchBadge } from "@/components/trade/trade-match-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  MockListing,
  MockTradeInterest,
  MockTradeOpportunity,
} from "@/data/mock/types";

type TradeInterestPanelProps = {
  listing: MockListing;
  interests: MockTradeInterest[];
  opportunities: MockTradeOpportunity[];
};

export function TradeInterestPanel({
  listing,
  interests,
  opportunities,
}: TradeInterestPanelProps) {
  if (!listing.statuses.forTrade && interests.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Trade interests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {interests.length > 0 ? (
          <div className="space-y-3">
            {interests.map((interest) => (
              <div
                key={interest.id}
                className="rounded-lg border border-border bg-secondary/60 p-4"
              >
                <h3 className="font-semibold text-foreground">
                  {interest.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {interest.description}
                </p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {interest.criteria.map((criterion) => (
                    <div key={`${interest.id}-${criterion.label}`}>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">
                        {criterion.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-foreground">
                        {criterion.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This item is open to trade, but detailed criteria have not been
            added yet.
          </p>
        )}

        {opportunities.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Related trade context
            </h3>
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TradeMatchBadge matchType={opportunity.matchType} />
                  {opportunity.cashAdjustment ? (
                    <span className="text-xs font-semibold text-warning">
                      {opportunity.cashAdjustment}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {opportunity.reason}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
