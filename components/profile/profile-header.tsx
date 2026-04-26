import { MapPin, Share2, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrustIndicators } from "@/components/profile/trust-indicators";

type ProfileHeaderProps = {
  displayName: string;
  handle: string;
  avatarUrl?: string;
  location?: string;
  memberSince?: string;
  bio: string;
  stats: Array<{ label: string; value: string }>;
  indicators: string[];
  ownProfile?: boolean;
};

export function ProfileHeader({
  displayName,
  handle,
  avatarUrl,
  location,
  memberSince,
  bio,
  stats,
  indicators,
  ownProfile,
}: ProfileHeaderProps) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <Avatar className="size-16">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {displayName}
            </h2>
            <p className="text-sm text-muted-foreground">{handle}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" />
                  {location}
                </span>
              ) : null}
              {memberSince ? <span>{memberSince}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Share2 className="size-4" />}>
            Share
          </Button>
          {ownProfile ? (
            <Button variant="outline" size="sm" leftIcon={<Settings className="size-4" />}>
              Edit
            </Button>
          ) : null}
        </div>
      </div>
      <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">
        {bio}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-muted/45 p-3">
            <div className="text-lg font-semibold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <TrustIndicators indicators={indicators} />
      </div>
    </Card>
  );
}
