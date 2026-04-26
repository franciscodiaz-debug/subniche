import { Suspense } from "react"
import { InboxContent } from "@/components/inbox/inbox-content"

export const metadata = {
  title: "Inbox | MarKat",
  description: "Messages, offers, and conversations",
}

export const dynamic = "force-dynamic"

export default function InboxPage() {
  return (
    <Suspense
      fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>}
    >
      <InboxContent />
    </Suspense>
  )
}
