import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";

type ListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Listing detail"
        title={`Listing ${id}`}
        description="This placeholder confirms the dynamic listing route. Image gallery, seller trust context, action panel, and related listings are deferred."
      />
    </PageShell>
  );
}
