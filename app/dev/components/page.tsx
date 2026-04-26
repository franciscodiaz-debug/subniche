import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { CollectionCard } from "@/components/collection/collection-card";
import { CommunityCard } from "@/components/community/community-card";
import { CommunityContextBadge } from "@/components/community/community-context-badge";
import { ListingCard } from "@/components/listing/listing-card";
import { ListingStatusBadges } from "@/components/listing/listing-status-badges";
import { FilterPanel } from "@/components/marketplace/filter-panel";
import { SearchBar } from "@/components/marketplace/search-bar";
import { SortControl } from "@/components/marketplace/sort-control";
import { ProfileHeader } from "@/components/profile/profile-header";
import { TradeMatchBadge } from "@/components/trade/trade-match-badge";
import { TradeMatchCard } from "@/components/trade/trade-match-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import {
  featuredListingCards,
  mockCollections,
  mockCommunities,
  mockProfiles,
  mockTradeOpportunities,
} from "@/data/mock";

export default function ComponentLabPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Component Lab"
        title="Core Component System"
        description="Internal QA route for the reusable SubNiche primitives and product components. This page is not a marketplace page."
      />

      <div className="mt-8 space-y-10">
        <LabSection title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Filter">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            </Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </LabSection>

        <LabSection title="Badges And Statuses">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ListingStatusBadges statuses={{ forSale: true }} />
              <ListingStatusBadges statuses={{ forTrade: true }} />
              <ListingStatusBadges statuses={{ inCollection: true }} />
              <ListingStatusBadges statuses={{ wishlist: true }} />
              <ListingStatusBadges statuses={{ inCollection: true, forSale: true }} />
              <ListingStatusBadges statuses={{ forSale: true, forTrade: true }} />
            </div>
            <div className="flex flex-wrap gap-2">
              <TradeMatchBadge matchType="trueMatch" />
              <TradeMatchBadge matchType="inboundInterest" />
              <TradeMatchBadge matchType="suggested" />
              <CommunityContextBadge label="Public Market" publicMarket />
              <CommunityContextBadge label="Pedal Builders Guild" />
            </div>
          </div>
        </LabSection>

        <LabSection title="Marketplace Controls">
          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
                <SearchBar />
                <SortControl />
              </div>
              <Tabs defaultValue="market">
                <TabsList>
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="trade">Trade</TabsTrigger>
                  <TabsTrigger value="collections">Collections</TabsTrigger>
                </TabsList>
                <TabsContent value="market">
                  <Card>
                    <CardContent className="pt-5 text-sm text-muted-foreground">
                      Market controls should stay generic enough for future niche
                      attributes.
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="trade">
                  <Card>
                    <CardContent className="pt-5 text-sm text-muted-foreground">
                      Trade mode can reuse the market shell while making trade
                      semantics visible.
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="collections">
                  <Card>
                    <CardContent className="pt-5 text-sm text-muted-foreground">
                      Collections remain identity surfaces, not plain folders.
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <FilterPanel />
          </div>
        </LabSection>

        <LabSection title="Listing Cards">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredListingCards.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </LabSection>

        <LabSection title="Profile, Collections, Trade, Community">
          <div className="space-y-4">
            <ProfileHeader {...mockProfiles[0]} />
            <div className="grid gap-4 lg:grid-cols-3">
              <CollectionCard
                title={mockCollections[0].title}
                ownerName={mockProfiles[0].displayName}
                itemCount={mockCollections[0].itemCount}
                description={mockCollections[0].description}
                images={mockCollections[0].images}
                visibility={mockCollections[0].visibility}
                href={mockCollections[0].href}
              />
              <TradeMatchCard {...mockTradeOpportunities[0]} />
              <CommunityCard
                name={mockCommunities[1].name}
                niche="Music Gear"
                description={mockCommunities[1].description}
                memberCount={mockCommunities[1].memberCount}
                listingCount={mockCommunities[1].listingCount}
                visibility={mockCommunities[1].visibility}
                href={`/communities/${mockCommunities[1].slug}`}
              />
            </div>
          </div>
        </LabSection>

        <LabSection title="Forms And Overlays">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>Reusable label/help/error wrapper.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  id="listing-title"
                  label="Listing title"
                  helpText="Keep the important make/model detail visible."
                >
                  <Input id="listing-title" placeholder="Fender Deluxe Reverb" />
                </FormField>
                <FormField
                  id="listing-notes"
                  label="Condition notes"
                  error="Condition notes will be required before publishing."
                >
                  <Textarea id="listing-notes" invalid placeholder="Describe wear, mods, or service history." />
                </FormField>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Overlays</CardTitle>
                <CardDescription>Dialog, sheet, dropdown, and tooltip.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    Open Dialog
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Offer preview</DialogTitle>
                      <DialogDescription>
                        Modal primitive for focused tasks without creating page
                        specific styling.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground">
                    Open Sheet
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Mobile filters</SheetTitle>
                      <SheetDescription>
                        Sheet primitive for filter drawers and mobile secondary
                        tasks.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground">
                    Actions
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Save listing</DropdownMenuItem>
                    <DropdownMenuItem>Share profile</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip label="Tooltip labels unfamiliar icon controls.">
                  <Button variant="secondary" size="icon" aria-label="Tooltip example">
                    ?
                  </Button>
                </Tooltip>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skeletons</CardTitle>
                <CardDescription>Loading placeholders for dense surfaces.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </LabSection>
      </div>
    </PageShell>
  );
}

function LabSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
