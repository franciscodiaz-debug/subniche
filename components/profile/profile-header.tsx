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
  return (
    <section className="pt-4">
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <Avatar className="size-40 rounded-full border-8 border-card shadow-soft sm:size-48 lg:mx-auto">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-4xl font-semibold">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <h1 className="text-4xl font-semibold leading-none text-foreground md:text-5xl">
                  {displayName}
                </h1>
                {ownProfile ? (
                  <Badge variant="secondary" className="rounded-full">
                    Your profile
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-xl text-muted-foreground">{handle}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-base text-muted-foreground">
                {location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-5" aria-hidden="true" />
                    {location}
                  </span>
                ) : null}
                {memberSince ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-5" aria-hidden="true" />
                    {memberSince}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {ownProfile ? (
                <Link
                  href="/settings/seller-defaults"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "rounded-lg bg-transparent text-base font-semibold",
                  })}
                >
                  <Edit3 className="size-5" aria-hidden="true" />
                  Edit Profile
                </Link>
              ) : null}
              <Link
                href="/settings/seller-defaults"
                className={buttonVariants({
                  variant: "outline",
                  size: "icon",
                  className: "rounded-lg bg-transparent",
                })}
                aria-label="Profile settings"
              >
                <Settings className="size-5" aria-hidden="true" />
              </Link>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg bg-transparent"
                aria-label="Share profile"
              >
                <Share2 className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <p className="max-w-5xl text-lg leading-8 text-muted-foreground">
            {bio}
          </p>

          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Trust context
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-muted-foreground">
                Verified:
              </span>
              <TrustPill icon={Mail} label="Email verified" verified />
              <TrustPill icon={Link2} label="Linked account verified" verified />
              <TrustPill icon={ShieldCheck} label="Community history" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-muted-foreground">Linked:</span>
              {indicators.map((indicator) => (
                <Badge
                  key={indicator}
                  variant="outline"
                  className="rounded-full px-3 py-1 text-sm font-medium"
                >
                  {indicator}
                  <ExternalLink
                    className="size-3 opacity-60"
                    aria-hidden="true"
                  />
                </Badge>
              ))}
              <span className="text-sm text-muted-foreground">
                ({indicators.length} verified)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
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
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm text-foreground"
      aria-label={label}
    >
      <Icon className="size-4" aria-hidden="true" />
      {verified ? (
        <Check className="size-3.5 text-primary" aria-hidden="true" />
      ) : null}
    </span>
  );
}
