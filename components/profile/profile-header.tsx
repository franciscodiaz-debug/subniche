import {
  CalendarDays,
  Check,
  Edit3,
  ExternalLink,
  Link2,
  Mail,
  MapPin,
  Share2,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const profileStats = stats.slice(0, 3);

  return (
    <section className="pt-2">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar className="size-24 rounded-full border-4 border-card shadow-soft sm:size-32">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-2xl font-semibold">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold leading-tight text-foreground">
                {displayName}
              </h1>
              {ownProfile ? (
                <Link
                  href="/settings/seller-defaults"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "rounded-lg bg-transparent",
                  })}
                >
                  <Edit3 className="size-4" aria-hidden="true" />
                  Edit Profile
                </Link>
              ) : null}
              <Link
                href="/settings/seller-defaults"
                className={buttonVariants({
                  variant: "outline",
                  size: "icon",
                  className: "size-9 rounded-lg bg-transparent",
                })}
                aria-label="Profile settings"
              >
                <Settings className="size-4" aria-hidden="true" />
              </Link>
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-lg bg-transparent"
                aria-label="Share profile"
              >
                <Share2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{handle}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {location}
                </span>
              ) : null}
              {memberSince ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {memberSince}
                </span>
              ) : null}
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {bio}
          </p>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-muted-foreground">
                Verified:
              </span>
              <TrustPill icon={Mail} label="Email verified" verified />
              <TrustPill icon={Link2} label="Linked account verified" verified />
              <TrustPill icon={ShieldCheck} label="Community history" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-muted-foreground">Linked:</span>
              {indicators.map((indicator) => (
                <Badge
                  key={indicator}
                  variant="outline"
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                >
                  {indicator}
                  <ExternalLink
                    className="size-3 opacity-60"
                    aria-hidden="true"
                  />
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground">
                ({indicators.length} verified)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-9 gap-y-3">
            {profileStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustPill({
  icon: Icon,
  label,
  verified,
}: {
  icon: LucideIcon;
  label: string;
  verified?: boolean;
}) {
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-xs text-foreground"
      aria-label={label}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {verified ? (
        <Check className="size-3 text-primary" aria-hidden="true" />
      ) : null}
    </span>
  );
}
