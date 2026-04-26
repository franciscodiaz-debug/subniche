import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";

export default function InboxPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Inbox"
        title="Inbox placeholder"
        description="Messages, offers, and trade conversations will live here later. This branch only confirms routing and shell behavior."
      />
    </PageShell>
  );
}
