"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FlaskConical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockNiches } from "@/data/mock/niches";
import { desktopNavItems, primaryAction, profileNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const PrimaryActionIcon = primaryAction.icon;
  const activeProfile = isActive(pathname, profileNavItem.href);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-background py-5 transition-[width] lg:flex lg:flex-col",
        collapsed ? "w-[72px] px-2" : "w-[220px] px-3",
      )}
    >
      <Link
        href="/"
        className={cn(
          "flex items-center",
          collapsed ? "justify-center px-0" : "px-3",
        )}
        aria-label="SubNiche home"
      >
        <Image
          src="/images/subniche-logo.svg"
          alt="SubNiche"
          width={collapsed ? 56 : 117}
          height={collapsed ? 17 : 36}
          priority
          className="h-auto w-auto select-none"
        />
      </Link>

      <Link
        href={primaryAction.href}
        aria-label="Create listing from sidebar"
        title={collapsed ? primaryAction.label : undefined}
        className={cn(
          "mt-6 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/50 bg-card text-sm font-semibold text-foreground shadow-card transition hover:border-primary hover:bg-card/85",
          collapsed ? "px-0" : "px-4",
        )}
      >
        <PrimaryActionIcon className="size-4 text-primary" aria-hidden="true" />
        {!collapsed ? <span>{primaryAction.label}</span> : null}
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
                "group flex min-h-11 items-center gap-3 rounded-lg py-3 text-sm font-medium transition",
                collapsed ? "justify-center px-0" : "px-4",
                active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : item.description}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}

        <Link
          href={profileNavItem.href}
          className={cn(
            "group flex min-h-11 items-center gap-3 rounded-lg py-3 text-sm font-medium transition",
            collapsed ? "justify-center px-0" : "px-4",
            activeProfile
              ? "bg-card text-foreground"
              : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
          )}
          aria-current={activeProfile ? "page" : undefined}
          title={collapsed ? profileNavItem.label : profileNavItem.description}
        >
          <Avatar
            className={cn(
              "size-7 shrink-0 border transition",
              activeProfile
                ? "border-primary"
                : "border-transparent group-hover:border-primary/45",
            )}
          >
            <AvatarImage src="/avatar-jordan.jpg" alt="" />
            <AvatarFallback>J</AvatarFallback>
          </Avatar>
          {!collapsed ? <span>{profileNavItem.label}</span> : null}
        </Link>
      </nav>

      <Link
        href="/dev/components"
        className={cn(
          "mt-auto flex min-h-9 items-center gap-2 rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-card/50 hover:text-foreground",
          collapsed ? "justify-center px-0" : "px-4",
          isActive(pathname, "/dev/components") && "bg-card text-foreground",
        )}
        title={collapsed ? "Component Lab" : undefined}
      >
        <FlaskConical className="size-3.5" aria-hidden="true" />
        {!collapsed ? "Component Lab" : null}
      </Link>

      <NicheSwitcher collapsed={collapsed} />
    </aside>
  );
}

function NicheSwitcher({ collapsed }: { collapsed: boolean }) {
  const currentNiche = mockNiches[0];

  return (
    <button
      type="button"
      className={cn(
        "mt-3 flex min-h-12 items-center rounded-lg border border-border bg-card text-left text-foreground shadow-card transition hover:border-primary/45 hover:bg-card/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        collapsed ? "justify-center px-0" : "w-full gap-3 px-3 py-2",
      )}
      aria-label={`Current niche: ${currentNiche.name}`}
      title={collapsed ? currentNiche.name : undefined}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
        {currentNiche.name
          .split(" ")
          .map((part) => part[0])
          .join("")}
      </span>
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Current niche
            </span>
            <span className="block truncate text-sm font-semibold">
              {currentNiche.name}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </>
      ) : null}
    </button>
  );
}
