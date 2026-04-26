import Link from "next/link";
import { Globe2, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CollectionPreviewStrip } from "@/components/collection/collection-preview-strip";
import { cn } from "@/lib/utils";

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
  const visibilityClass = privateCollection ? "text-muted-foreground" : "text-success";

  const content = (
    <Card variant="interactive" className="overflow-hidden rounded-lg">
      <CollectionPreviewStrip images={images} className="gap-0.5" />
      <div className="space-y-5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-semibold text-foreground">
              {title}
            </h3>
            {description ? (
              <p className="mt-2 line-clamp-1 text-lg text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <VisibilityIcon
            className={cn("mt-1 size-5 shrink-0", visibilityClass)}
            aria-label={visibility}
          />
        </div>
        <div className="text-base text-muted-foreground">
          {itemCount} items
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">Your Estimate</div>
            <div className="mt-2 text-2xl font-medium text-foreground">
              {estimatedValue ?? "$0"}
            </div>
          </div>
          {aiEstimate ? (
            <div className="min-w-0 text-right">
              <div className="text-sm text-muted-foreground">AI Estimate</div>
              <div className="mt-2 text-2xl font-medium text-success">
                {aiEstimate}
              </div>
            </div>
          ) : null}
        </div>
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
