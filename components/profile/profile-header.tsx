import {
  CalendarDays,
  Link2,
  Mail,
  MapPin,
  Share2,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="grid gap-6 lg:grid-cols-[168px_minmax(0,1fr)]">
        <Avatar className="size-32 rounded-full border-4 border-background shadow-soft">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback>
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-foreground">
                  {displayName}
                </h1>
                {ownProfile ? (
                  <Badge variant="secondary">Your profile</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-base text-muted-foreground">{handle}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden="true" />
                    {location}
                  </span>
                ) : null}
                {memberSince ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {memberSince}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Share2 className="size-4" />}
              >
                Share
              </Button>
              {ownProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Settings className="size-4" />}
                >
                  Edit Profile
                </Button>
              ) : null}
            </div>
          </div>

          <p className="max-w-4xl text-base leading-7 text-muted-foreground">
            {bio}
          </p>

          <div className="grid gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-background p-3"
              >
                <div className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
                Trust context
              </div>
              <TrustIndicators indicators={indicators} />
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Link2 className="size-4 text-accent" aria-hidden="true" />
                Linked accounts
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">
                  <Mail className="size-3" aria-hidden="true" />
                  Email
                </Badge>
                <Badge variant="outline">Reverb</Badge>
                <Badge variant="outline">Reddit</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
