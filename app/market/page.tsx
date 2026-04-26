import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";

export default function MarketPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Market"
        title="Marketplace placeholder"
        description="This route is reserved for the canonical browse, search, filter, and listing grid experience. The full marketplace page is intentionally deferred."
      />
    </PageShell>
  );
}
