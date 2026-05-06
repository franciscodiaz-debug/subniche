"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportsTable } from "./reports-table"
import { UsersTable } from "./users-table"
import { mockReports } from "@/lib/admin/mock-reports"

const openReports = mockReports.filter((r) => r.status === "open").length

export function ModerationPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reports queue and user management.
        </p>
      </div>

      <Tabs defaultValue="reports">
        <div className="border-b border-border">
          <TabsList className="h-auto w-fit justify-start gap-0 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="reports"
              className="h-auto rounded-none border-b-2 border-transparent px-3 pb-3 pt-1 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Reports Queue
              {openReports > 0 ? (
                <span className="ml-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-400/20 px-1 text-[10px] font-semibold text-red-400">
                  {openReports}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="h-auto rounded-none border-b-2 border-transparent px-3 pb-3 pt-1 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Users
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="reports" className="mt-6">
          <ReportsTable />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UsersTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
