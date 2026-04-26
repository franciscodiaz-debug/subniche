import { notFound } from "next/navigation";
import { CollectionDetailPage } from "@/components/collection/collection-detail-page";
import { mockCollections, mockListings, mockProfiles } from "@/data/mock";

type CollectionPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return mockCollections.map((collection) => ({ id: collection.id }));
}

export default async function Page({ params }: CollectionPageProps) {
  const { id } = await params;
  const collection = mockCollections.find((item) => item.id === id);

  if (!collection) {
    notFound();
  }

  const owner = mockProfiles.find((profile) => profile.id === collection.ownerId);

  return (
    <CollectionDetailPage
      collection={collection}
      listings={mockListings}
      owner={owner}
    />
  );
}
