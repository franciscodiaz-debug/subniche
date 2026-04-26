"use client";

import { Suspense, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useIsNavCollapseRequested } from "../../hooks/use-nav-collapse-request";
import { Header } from "./header";
import { MobileMenuButton } from "./mobile-menu-button";
import { Sidebar } from "./sidebar";

export function ClientLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isInboxPage = pathname === "/inbox" || pathname.startsWith("/inbox/");
  const collapseRequested = useIsNavCollapseRequested();
  const sidebarCollapsed = isInboxPage || collapseRequested;

  return (
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
  );
}
