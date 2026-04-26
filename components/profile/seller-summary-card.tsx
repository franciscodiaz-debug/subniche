import Link from "next/link";
import { MapPin } from "lucide-react";
import { TrustIndicators } from "@/components/profile/trust-indicators";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockProfile } from "@/data/mock/types";

type SellerSummaryCardProps = {
  profile: MockProfile;
  listingCount: number;
  tradeReadyCount: number;
  collectionCount: string;
};

export function SellerSummaryCard({
  profile,
  listingCount,
  tradeReadyCount,
  collectionCount,
}: SellerSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seller context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="size-12">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {profile.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-foreground">
              {profile.displayName}
            </div>
            <div className="text-sm text-muted-foreground">
              {profile.handle}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden="true" />
                {profile.location}
              </span>
              <span>{profile.memberSince}</span>
            </div>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{profile.bio}</p>
        <div className="grid grid-cols-3 gap-2">
          <SellerStat label="Listings" value={String(listingCount)} />
          <SellerStat label="Trade-ready" value={String(tradeReadyCount)} />
          <SellerStat label="Collection" value={collectionCount} />
        </div>
        <TrustIndicators indicators={profile.indicators} />
        <Link
          href="/profile"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          View profile
        </Link>
      </CardContent>
    </Card>
  );
}

function SellerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/45 p-3">
      <div className="text-base font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
