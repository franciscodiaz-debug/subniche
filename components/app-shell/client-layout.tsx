"use client";

import { Suspense, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Header } from "./header";
import { MobileMenuButton } from "./mobile-menu-button";
import { Sidebar } from "./sidebar";
// Trade Interests are user-scoped and shared between the /trade manager modal
// and the listing editor, so the provider lives at the shell level — anywhere
// either surface mounts, the store is already in scope.
import { SavedTradeInterestsProvider } from "@/lib/saved-trade-interests-context";
// Ambient collapse requests — any descendant can call `useRequestNavCollapse`
// to pull the sidebar into its 72px rail form while a focus-heavy surface
// (e.g. the Trade Interest Manager modal, an onboarding overlay, a
// full-bleed editor) is mounted. We read that request here and OR it with
// the route-based rule so both sources can coexist.
import { useIsNavCollapseRequested } from "@/hooks/use-nav-collapse-request";

export function ClientLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isInboxPage = pathname === "/inbox" || pathname.startsWith("/inbox/");
  const collapseRequested = useIsNavCollapseRequested();
  const sidebarCollapsed = isInboxPage || collapseRequested;

  return (
    <SavedTradeInterestsProvider>
    <div className="flex min-h-screen w-full">
      <Suspense
        fallback={<div className="hidden bg-sidebar lg:block lg:w-[220px]" />}
      >
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          collapsed={sidebarCollapsed}
        />
      </Suspense>

      <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />

      <main
        className={`w-full min-w-0 flex-1 ${
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[220px]"
        }`}
      >
        <Header />
        {children}
      </main>
    </div>
    </SavedTradeInterestsProvider>
  );
}
