"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { SavedTradeInterestsProvider } from "@/lib/saved-trade-interests-context";
import { CollectionsProvider } from "@/lib/collections-context";
import { useIsNavCollapseRequested } from "@/hooks/use-nav-collapse-request";

interface ClientLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export function ClientLayout({ children, isAuthenticated }: ClientLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileChromeHidden, setMobileChromeHidden] = useState(false);
  const pathname = usePathname();
  const collapseRequested = useIsNavCollapseRequested();

  const lastScrollYRef = useRef(0);
  const movementStartYRef = useRef(0);
  const movementStartTimeRef = useRef(0);
  const movementDirectionRef = useRef<"up" | "down" | null>(null);

  useEffect(() => {
    let animationFrame = 0;
    let updateQueued = false;

    const getScrollY = () =>
      Math.max(
        window.scrollY,
        document.scrollingElement?.scrollTop ?? 0,
        document.documentElement.scrollTop,
        document.body.scrollTop,
        0,
      );

    const evaluateScroll = () => {
      const now = performance.now();
      const currentY = getScrollY();
      const previousY = lastScrollYRef.current;
      const deltaY = currentY - previousY;

      if (currentY < 24) {
        setMobileChromeHidden(false);
        movementDirectionRef.current = null;
        movementStartYRef.current = currentY;
        movementStartTimeRef.current = now;
        lastScrollYRef.current = currentY;
        return;
      }

      if (Math.abs(deltaY) < 1) return;

      const direction = deltaY > 0 ? "down" : "up";
      if (movementDirectionRef.current !== direction) {
        movementDirectionRef.current = direction;
        movementStartYRef.current = previousY;
        movementStartTimeRef.current = now;
      }

      const movementDistance = Math.abs(currentY - movementStartYRef.current);
      const movementTime = now - movementStartTimeRef.current;

      if (direction === "down" && currentY > 80 && movementDistance > 18) {
        setMobileChromeHidden(true);
      } else if (
        direction === "up" &&
        (-deltaY > 36 || (movementDistance > 54 && movementTime < 360))
      ) {
        setMobileChromeHidden(false);
      }

      if (movementTime > 520) {
        movementStartYRef.current = currentY;
        movementStartTimeRef.current = now;
      }

      lastScrollYRef.current = currentY;
    };

    const requestScrollEvaluation = () => {
      if (updateQueued) return;
      updateQueued = true;
      window.requestAnimationFrame(() => {
        updateQueued = false;
        evaluateScroll();
      });
    };

    const watchScrollPosition = () => {
      evaluateScroll();
      animationFrame = window.requestAnimationFrame(watchScrollPosition);
    };

    const initialScrollY = getScrollY();
    lastScrollYRef.current = initialScrollY;
    movementStartYRef.current = initialScrollY;
    movementStartTimeRef.current = performance.now();

    animationFrame = window.requestAnimationFrame(watchScrollPosition);
    window.addEventListener("scroll", requestScrollEvaluation, { passive: true });
    document.addEventListener("scroll", requestScrollEvaluation, { passive: true, capture: true });
    window.addEventListener("touchmove", requestScrollEvaluation, { passive: true });
    window.addEventListener("wheel", requestScrollEvaluation, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestScrollEvaluation);
      document.removeEventListener("scroll", requestScrollEvaluation, { capture: true });
      window.removeEventListener("touchmove", requestScrollEvaluation);
      window.removeEventListener("wheel", requestScrollEvaluation);
    };
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/welcome' || pathname === '/forgot-password';
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAuthPage || isAdminPage) return <>{children}</>;

  const isInboxPage = pathname === "/inbox" || pathname.startsWith("/inbox/");
  const isCreatePage = pathname === "/create-listing" || pathname.startsWith("/create-listing/");
  const sidebarCollapsed = isInboxPage || collapseRequested;

  return (
    <SavedTradeInterestsProvider>
      <CollectionsProvider>
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
          className={`w-full min-w-0 flex-1 pt-16 lg:pt-0 ${isCreatePage || isInboxPage ? "overflow-hidden" : "pb-[72px]"} lg:pb-0 ${
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[220px]"
          }`}
        >
          <Header
            isAuthenticated={isAuthenticated}
            mobileChromeHidden={mobileChromeHidden}
            onMobileMenuOpen={() => setMobileMenuOpen(true)}
          />
          {children}
        </main>

        {!isCreatePage && (
          <BottomNav
            isAuthenticated={isAuthenticated}
            mobileChromeHidden={mobileChromeHidden}
          />
        )}
      </div>
      </CollectionsProvider>
    </SavedTradeInterestsProvider>
  );
}
