import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";

export default function ProfilePage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Profile"
        title="Profile placeholder"
        description="Profiles will become the identity and trust surface for niche-specific activity, collections, listings, and verification context."
      />
    </PageShell>
  );
}
