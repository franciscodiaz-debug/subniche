import { redirect } from "next/navigation";

type CollectionAliasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: CollectionAliasPageProps) {
  const { id } = await params;
  redirect(`/collections/${id}`);
}
