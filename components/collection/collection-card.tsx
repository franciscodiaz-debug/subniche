import Link from "next/link";
import { Lock, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CollectionPreviewStrip } from "@/components/collection/collection-preview-strip";

type CollectionCardProps = {
  title: string;
  ownerName: string;
  itemCount: number;
  description?: string;
  estimatedValue?: string;
  aiEstimate?: string;
  images: string[];
  visibility?: string;
  href?: string;
};

export function CollectionCard({
  title,
  ownerName,
  itemCount,
  description,
  estimatedValue,
  aiEstimate,
  images,
  visibility = "Public collection",
  href,
}: CollectionCardProps) {
  const privateCollection = visibility.toLowerCase().includes("unlisted");
  const VisibilityIcon = privateCollection ? Lock : Globe2;

  const content = (
    <Card variant="interactive" className="overflow-hidden">
      <CollectionPreviewStrip images={images} />
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Curated by {ownerName}
            </p>
          </div>
          <VisibilityIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-label={visibility}
          />
        </div>
        {description ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground">Items</div>
            <div className="text-sm font-semibold text-foreground">
              {itemCount}
            </div>
          </div>
          {estimatedValue ? (
            <div>
              <div className="text-xs text-muted-foreground">Your Estimate</div>
              <div className="text-sm font-semibold text-foreground">
                {estimatedValue}
              </div>
            </div>
          ) : null}
          {aiEstimate ? (
            <div>
              <div className="text-xs text-muted-foreground">AI Estimate</div>
              <div className="text-sm font-semibold text-success">
                {aiEstimate}
              </div>
            </div>
          ) : null}
        </div>
        <Badge variant={privateCollection ? "secondary" : "outline"}>
          {visibility}
        </Badge>
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block" aria-label={`View ${title}`}>
      {content}
    </Link>
  ) : (
    content
  );
}
