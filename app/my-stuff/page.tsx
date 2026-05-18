import { Package } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyItemsTab } from "@/components/my-stuff/my-items-tab"
import { CollectionsTab } from "@/components/my-stuff/collections-tab"
import { collectionPreviewImages, myItems } from "@/lib/mock/my-stuff"

export default async function MyStuffPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const defaultTab = tab === "collections" ? "collections" : "items"

  return (
    <div className="@container px-4 pb-8 pt-3 md:px-8 @3xl:pt-6">
      <div className="mb-2 flex items-center gap-2 @3xl:mb-6">
        <Package className="h-4 w-4 text-primary @3xl:h-5 @3xl:w-5" />
        <h1 className="text-lg font-semibold leading-none tracking-tight text-foreground text-balance @3xl:text-2xl @3xl:leading-tight">
          My Stuff
        </h1>
      </div>

      <Tabs defaultValue={defaultTab} className="gap-2 @3xl:gap-6">
        <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-border bg-transparent p-0">
          {["items", "collections"].map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className="relative h-auto flex-none rounded-none border-0 bg-transparent px-0 pb-3 pt-0 text-xl font-semibold tracking-tight text-muted-foreground shadow-none transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-primary after:opacity-0 hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:opacity-100"
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="items" className="mt-0">
          <MyItemsTab items={myItems} />
        </TabsContent>

        <TabsContent value="collections" className="mt-0">
          <CollectionsTab previewImages={collectionPreviewImages} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
