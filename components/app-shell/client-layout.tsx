"use client";

import { Suspense, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Header } from "./header";
import { MobileMenuButton } from "./mobile-menu-button";
import { Sidebar } from "./sidebar";
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

        <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />

        <main
          className={`w-full min-w-0 flex-1 ${
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[220px]"
          }`}
        >
          <Header isAuthenticated={isAuthenticated} />
          {children}
        </main>
      </div>
    </SavedTradeInterestsProvider>
  );
}
