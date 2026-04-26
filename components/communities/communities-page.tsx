"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Plus, Search, Sparkles, TrendingUp, Users } from "lucide-react";
import { ListingCard } from "@/components/listing/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  MockCommunity,
  MockCommunityMembership,
  MockListing,
} from "@/data/mock/types";
import { cn } from "@/lib/utils";

type CommunityTab = "mine" | "discover" | "directory";

type CommunitiesPageProps = {
  communities: MockCommunity[];
  listings: MockListing[];
  memberships: MockCommunityMembership[];
  profileId: string;
};

const tabs: Array<{ label: string; value: CommunityTab }> = [
  { label: "My Communities", value: "mine" },
  { label: "Discover", value: "discover" },
  { label: "Directory", value: "directory" },
];

export function CommunitiesPage({
  communities,
  listings,
  memberships,
  profileId,
}: CommunitiesPageProps) {
  const [activeTab, setActiveTab] = useState<CommunityTab>("mine");
  const [query, setQuery] = useState("");
  const memberCommunityIds = memberships
    .filter((membership) => membership.profileId === profileId)
    .map((membership) => membership.communityId);

  const myCommunities = communities.filter((community) =>
    memberCommunityIds.includes(community.id),
  );
  const discoverCommunities = communities.filter(
    (community) => !memberCommunityIds.includes(community.id),
  );
  const directoryCommunities = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return communities;
    }

    return communities.filter((community) =>
      [community.name, community.description, community.visibility]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [communities, query]);

  const activeListings = listings.filter((listing) =>
    listing.publishingContexts.some(
      (context) =>
        context.type === "community_market" &&
        memberCommunityIds.includes(context.communityId ?? ""),
    ),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Communities
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Community markets add context around listings, trades, trust, and
            niche-specific knowledge.
          </p>
        </div>
        <Button variant="secondary">
          <Plus className="size-4" aria-hidden="true" />
          Create Community
        </Button>
      </header>

      <nav className="flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={cn(
              "border-b-2 px-1 pb-3 text-lg font-semibold transition",
              activeTab === tab.value
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "mine" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <SectionTitle icon={Users} title="My Communities" />
            <div className="grid gap-4 md:grid-cols-2">
              {myCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  joined
                  listings={listings}
                />
              ))}
            </div>
            <SectionTitle icon={TrendingUp} title="Recent Community Listings" />
            <div className="grid gap-4 md:grid-cols-2">
              {activeListings.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </div>
          <aside className="space-y-4">
            <SectionTitle icon={Sparkles} title="Suggested Communities" />
            {discoverCommunities.slice(0, 2).map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                listings={listings}
              />
            ))}
          </aside>
        </section>
      ) : null}

      {activeTab === "discover" ? (
        <section className="space-y-5">
          <SectionTitle icon={Sparkles} title="Discover Communities" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="size-4" aria-hidden="true" />
            Music gear communities with active market context
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {discoverCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                listings={listings}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "directory" ? (
        <section className="space-y-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <SectionTitle icon={Users} title="Directory" />
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                aria-label="Search communities"
                className="pl-9 md:w-80"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search communities..."
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {directoryCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                joined={memberCommunityIds.includes(community.id)}
                listings={listings}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof Users;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <Icon className="size-5 text-accent" aria-hidden="true" />
      {title}
    </h2>
  );
}

function CommunityCard({
  community,
  joined = false,
  listings,
}: {
  community: MockCommunity;
  joined?: boolean;
  listings: MockListing[];
}) {
  const communityListings = listings.filter((listing) =>
    listing.publishingContexts.some(
      (context) => context.communityId === community.id,
    ),
  );

  return (
    <Link href={`/communities/${community.slug}`} className="block">
      <Card variant="interactive" className="rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {community.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {community.description}
          </p>
        </div>
        {joined ? <Badge variant="success">Joined</Badge> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{community.visibility}</Badge>
        <Badge variant="secondary">{community.memberCount}</Badge>
        <Badge variant="secondary">{community.listingCount} listings</Badge>
      </div>
      <div className="mt-4 flex -space-x-2">
        {communityListings.slice(0, 3).map((listing) => (
          <div
            key={listing.id}
            className="grid size-9 place-items-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground"
            title={listing.title}
          >
            {listing.brand.slice(0, 1)}
          </div>
        ))}
      </div>
      </Card>
    </Link>
  );
}
