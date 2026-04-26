import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type CommunityCardProps = {
  name: string;
  niche: string;
  description: string;
  memberCount: string;
  listingCount: string;
  visibility?: string;
  href?: string;
};

export function CommunityCard({
  name,
  niche,
  description,
  memberCount,
  listingCount,
  visibility = "Request-only",
  href,
}: CommunityCardProps) {
  const content = (
    <Card variant="interactive" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{niche}</p>
        </div>
        <Badge variant="outline">{visibility}</Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/45 px-2 py-1">
          <Users className="size-3" aria-hidden="true" />
          {memberCount}
        </span>
        <span className="rounded-md border border-border bg-muted/45 px-2 py-1">
          {listingCount} listings
        </span>
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block" aria-label={`View ${name}`}>
      {content}
    </Link>
  ) : (
    content
  );
}
