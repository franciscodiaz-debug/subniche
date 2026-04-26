import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ListingNotFound() {
  return (
    <PageShell>
      <EmptyState
        title="Listing not found."
        body="This item may have been removed or is not visible in this context."
        primaryAction={
          <Link href="/market" className={buttonVariants({ variant: "primary" })}>
            Back to Market
          </Link>
        }
      />
    </PageShell>
  );
}
