import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";

export default function TradePage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Trade"
        title="Trade mode placeholder"
        description="This route will eventually open the shared marketplace surface with trade mode enabled. True Match, Inbound Interest, and Suggested remain separate concepts."
      />
    </PageShell>
  );
}
