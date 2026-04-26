import { FavoritesPage } from "@/components/favorites/favorites-page";
import {
  mockCollections,
  mockListings,
  mockProfiles,
} from "@/data/mock";

export default function Page() {
  return (
    <FavoritesPage
      collections={mockCollections}
      listings={mockListings}
      profiles={mockProfiles}
    />
  );
}
