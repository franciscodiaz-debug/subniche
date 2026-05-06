"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { GlobalTopBar } from "@/components/layout/global-top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const compactSidebar =
    pathname.startsWith("/inbox") || pathname.startsWith("/listings/");
  const pageOwnsTopSearch =
    pathname.startsWith("/market") ||
    pathname.startsWith("/trade") ||
    pathname.startsWith("/welcome");
  const pageOwnsMobileBottomActions =
    pathname.startsWith("/add-item") || pathname.startsWith("/create-listing");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopSidebar collapsed={compactSidebar} />
      <main
        className={`min-h-screen pb-24 lg:pb-0 ${
          compactSidebar ? "lg:pl-[72px]" : "lg:pl-[220px]"
        }`}
      >
        <MobileTopBar />
        {pageOwnsTopSearch ? null : <GlobalTopBar />}
        {children}
      </main>
      {pageOwnsMobileBottomActions ? null : <MobileNav />}
    </div>
  );
}
