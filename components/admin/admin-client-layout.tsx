"use client"

import type { ReactNode } from "react"

import { AdminNav } from "./admin-nav"
import { AdminTopbar } from "./admin-topbar"

export function AdminClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AdminNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
