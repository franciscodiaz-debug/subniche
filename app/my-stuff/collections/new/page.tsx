import { NewCollectionForm } from "@/components/my-stuff/new-collection-form"

export const metadata = {
  title: "New collection · My Stuff",
}

export default function NewCollectionPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <NewCollectionForm />
    </div>
  )
}
