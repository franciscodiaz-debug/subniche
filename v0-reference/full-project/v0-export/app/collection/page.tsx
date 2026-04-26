import { redirect } from "next/navigation"
import { CollectionManager } from "@/components/collection/collection-manager"

export default function CollectionPage() {
  redirect("/collections")

  return (
    <div className="min-h-screen bg-background">
      <CollectionManager />
    </div>
  )
}
