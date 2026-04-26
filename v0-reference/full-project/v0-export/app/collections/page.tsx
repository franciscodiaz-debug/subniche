import { Suspense } from "react"
import { CollectionsDiscovery } from "@/components/collections/collections-discovery"

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-6 lg:p-8">Loading...</div>}>
        <CollectionsDiscovery />
      </Suspense>
    </div>
  )
}
