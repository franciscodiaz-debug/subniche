import { Suspense } from "react"
import { CommunitiesHubContent } from "@/components/communities/communities-hub-content"

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8">Loading...</div>}>
      <div className="min-h-screen bg-background">
        <CommunitiesHubContent />
      </div>
    </Suspense>
  )
}
