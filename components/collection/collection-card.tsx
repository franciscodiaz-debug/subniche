import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CollectionPreviewStrip } from "@/components/collection/collection-preview-strip";

type CollectionCardProps = {
  title: string;
  ownerName: string;
  itemCount: number;
  description?: string;
  images: string[];
  visibility?: string;
  href?: string;
};

export function CollectionCard({
  title,
  ownerName,
  itemCount,
  description,
  images,
  visibility = "Public collection",
  href,
}: CollectionCardProps) {
  const content = (
    <Card variant="interactive" className="overflow-hidden">
      <CollectionPreviewStrip images={images} />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Curated by {ownerName}</p>
          </div>
          <Badge variant="secondary">{itemCount} items</Badge>
        </div>
        {description ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <Badge variant="outline">{visibility}</Badge>
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
