"use client";

import { Suspense, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { SavedTradeInterestsProvider } from "@/lib/saved-trade-interests-context";
import { useIsNavCollapseRequested } from "@/hooks/use-nav-collapse-request";

interface ClientLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export function ClientLayout({ children, isAuthenticated }: ClientLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const collapseRequested = useIsNavCollapseRequested();

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/welcome';
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAuthPage || isAdminPage) return <>{children}</>;

  const isInboxPage = pathname === "/inbox" || pathname.startsWith("/inbox/");
  const isCreatePage = pathname === "/create-listing" || pathname.startsWith("/create-listing/");
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
            isAuthenticated={isAuthenticated}
          />
        </Suspense>

        <main
          suppressHydrationWarning
          className={`w-full min-w-0 flex-1 ${isCreatePage || isInboxPage ? "overflow-hidden" : "pb-[72px]"} lg:pb-0 ${
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[220px]"
          }`}
        >
          <Header isAuthenticated={isAuthenticated} onMobileMenuOpen={() => setMobileMenuOpen(true)} />
          {children}
        </main>

        {!isCreatePage && <BottomNav isAuthenticated={isAuthenticated} />}
      </div>
    </SavedTradeInterestsProvider>
  );
}
