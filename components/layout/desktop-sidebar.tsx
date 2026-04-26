"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";
import {
  desktopNavItems,
  primaryAction,
  profileNavItem,
  shellHighlights,
} from "@/lib/navigation";
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-sidebar px-5 py-6 shadow-soft lg:flex lg:flex-col">
      <Link href="/" className="group block" aria-label="SubNiche home">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-accent/35 bg-accent/10 text-accent">
            <span className="text-sm font-semibold">SN</span>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-normal text-foreground">
              SubNiche
            </div>
            <div className="text-xs leading-5 text-muted-foreground">
              Marketplaces for people who know the details.
            </div>
          </div>
        </div>
      </Link>

      <nav className="mt-8 space-y-1" aria-label="Primary navigation">
        {desktopNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                active
                  ? "border border-accent/30 bg-accent/12 text-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
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
        href={primaryAction.href}
        className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90"
      >
        <PrimaryActionIcon className="size-4" aria-hidden="true" />
        <span>{primaryAction.label}</span>
      </Link>

      <div className="mt-6 space-y-3 border-t border-border pt-5">
        {shellHighlights.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-surface/60 px-3 py-3"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Icon className="size-3.5" aria-hidden="true" />
                {item.label}
              </div>
              <div className="mt-1 text-sm text-foreground">{item.value}</div>
            </div>
          );
        })}
      </div>

      <Link
        href="/dev/components"
        className={cn(
          "mt-auto flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground",
          isActive(pathname, "/dev/components") && "bg-surface text-foreground",
        )}
      >
        <FlaskConical className="size-3.5" aria-hidden="true" />
        Component Lab
      </Link>

      <Link
        href={profileNavItem.href}
        className={cn(
          "mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 transition hover:border-accent/35",
          isActive(pathname, profileNavItem.href) && "border-accent/45",
        )}
      >
        <div className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
          <ProfileIcon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">
            Profile
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Trust and identity
          </div>
        </div>
      </Link>
    </aside>
  );
}
