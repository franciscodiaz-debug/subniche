import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Search, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  MockCommunity,
  MockCommunityMembership,
  MockProfile,
} from "@/data/mock/types";

type CommunityMembersPageProps = {
  community: MockCommunity;
  members: Array<{
    membership: MockCommunityMembership;
    profile?: MockProfile;
  }>;
};

export function CommunityMembersPage({
  community,
  members,
}: CommunityMembersPageProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link
        href={`/communities/${community.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to {community.name}
      </Link>

      <header className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase text-accent">
            <Users className="size-3.5" aria-hidden="true" />
            Members
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">
            {community.name} members
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Member context helps trades and marketplace conversations feel less
            anonymous.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-9"
            placeholder="Search members..."
            readOnly
            aria-label="Search members"
          />
        </div>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map(({ membership, profile }) => (
          <Card key={membership.id} className="rounded-lg p-4">
            <div className="flex gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold text-foreground">
                    {profile?.displayName ?? "Member"}
                  </h2>
                  <Badge
                    variant={
                      membership.role === "member" ? "secondary" : "default"
                    }
                  >
                    {membership.role !== "member" ? (
                      <Shield className="size-3" aria-hidden="true" />
                    ) : null}
                    {membership.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile?.location ?? "MusicGear"}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {profile?.bio ?? "Community member"}
                </p>
                <Link
                  href="/inbox"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "mt-4",
                  })}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Message
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
