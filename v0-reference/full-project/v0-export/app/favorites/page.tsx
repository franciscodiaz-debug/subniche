import { Suspense } from "react"
import { FavoritesContent } from "@/components/favorites/favorites-content"

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8">Loading...</div>}>
      <FavoritesContent />
    </Suspense>
  )
}
