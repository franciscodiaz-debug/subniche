import { Badge } from "@/components/ui/badge";

type TrustIndicatorsProps = {
  indicators: string[];
};

export function TrustIndicators({ indicators }: TrustIndicatorsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {indicators.map((indicator) => (
        <Badge key={indicator} variant="outline">
          {indicator}
        </Badge>
      ))}
    </div>
  );
}
