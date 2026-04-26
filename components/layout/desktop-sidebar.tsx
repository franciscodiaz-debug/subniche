"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { desktopNavItems, primaryAction, profileNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const PrimaryActionIcon = primaryAction.icon;
  const ProfileIcon = profileNavItem.icon;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] border-r border-border bg-background px-3 py-5 lg:flex lg:flex-col">
      <Link
        href="/"
        className="block px-3 text-lg font-semibold tracking-normal text-foreground"
        aria-label="SubNiche home"
      >
        SubNiche
      </Link>

      <Link
        href={primaryAction.href}
        aria-label="Create listing from sidebar"
        className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/50 bg-card px-4 text-sm font-semibold text-foreground shadow-card transition hover:border-primary hover:bg-card/85"
      >
        <PrimaryActionIcon className="size-4 text-primary" aria-hidden="true" />
        <span>{primaryAction.label}</span>
      </Link>

      <nav className="mt-5 space-y-1" aria-label="Primary navigation">
        {desktopNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
              title={item.description}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dev/components"
        className={cn(
          "mt-auto flex min-h-9 items-center gap-2 rounded-lg px-4 text-xs font-medium text-muted-foreground transition hover:bg-card/50 hover:text-foreground",
          isActive(pathname, "/dev/components") && "bg-card text-foreground",
        )}
      >
        <FlaskConical className="size-3.5" aria-hidden="true" />
        Component Lab
      </Link>

      <Link
        href={profileNavItem.href}
        className={cn(
          "mt-3 flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-card/50 hover:text-foreground",
          isActive(pathname, profileNavItem.href) && "bg-card text-foreground",
        )}
      >
        <ProfileIcon className="size-4 shrink-0" aria-hidden="true" />
        <span>{profileNavItem.label}</span>
      </Link>
    </aside>
  );
}
