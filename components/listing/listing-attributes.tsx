import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  MockCategory,
  MockListing,
  MockNiche,
} from "@/data/mock/types";

type ListingAttributesProps = {
  listing: MockListing;
  category?: MockCategory;
  niche?: MockNiche;
};

export function ListingAttributes({
  listing,
  category,
  niche,
}: ListingAttributesProps) {
  const details = [
    { label: "Condition", value: listing.condition },
    { label: "Category", value: category?.name },
    { label: "Niche", value: niche?.name },
    { label: "Brand", value: listing.brand },
    { label: "Location", value: listing.location },
    ...listing.attributes,
  ].filter((detail) => detail.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={`${detail.label}-${detail.value}`}
              className="rounded-lg border border-border bg-muted/45 p-3"
            >
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                {detail.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
