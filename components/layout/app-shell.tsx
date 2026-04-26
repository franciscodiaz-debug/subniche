import type { ReactNode } from "react";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopSidebar />
      <main className="min-h-screen pb-24 lg:pl-[220px] lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
