import { Suspense } from "react"
import type { Metadata } from "next"
import { InboxContent } from "@/components/inbox/inbox-content"

export const metadata: Metadata = {
  title: "Inbox",
  description: "Messages, offers, and trade conversations.",
}

export const dynamic = "force-dynamic"

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-65px)] items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  )
}
