import { Suspense } from "react"
import { MyStuffContent } from "@/components/my-stuff/my-stuff-content"

export default function MyStuffPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-6 lg:p-8">Loading...</div>}>
        <MyStuffContent />
      </Suspense>
    </div>
  )
}
