"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  Inbox,
  Package,
  Plus,
  Repeat2,
  Telescope,
  Users,
  X,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { currentUser } from "../../lib/current-user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { NicheSwitcher } from "./niche-switcher";
import { SubnicheLogo } from "./subniche-logo";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  brandName?: string;
  createHref?: string;
  profileImageSrc?: string;
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  brandName = "SubNiche",
  createHref = "/create-listing",
  profileImageSrc = "/avatar-jordan.jpg",
}: SidebarProps) {
  const pathname = usePathname();

  const isMyStuffArea =
    pathname === "/my-stuff" || pathname.startsWith("/my-stuff/");
  const isCommunitiesArea =
    pathname === "/communities" || pathname.startsWith("/communities/");
  const isMarketArea =
    pathname === "/" ||
    pathname === "/market" ||
    pathname.startsWith("/market/");
  const isTradeArea = pathname === "/trade" || pathname.startsWith("/trade/");
  const isFavoritesArea =
    pathname === "/favorites" || pathname.startsWith("/favorites/");
  const isProfileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");

  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [mobileOpen, onMobileClose, pathname]);

  const desktopNavItems = [
    { href: "/", icon: Telescope, label: "Market" },
    { href: "/trade", icon: Repeat2, label: "Trade" },
  ];

  const mobileNavItems = [
    { href: "/", icon: Telescope, label: "Market" },
    { href: "/trade", icon: Repeat2, label: "Trade" },
  ];

  const renderNavItems = (items: typeof desktopNavItems) => {
    return items.map((item) => {
      let isActive = false;

      if (item.label === "Market") {
        isActive = isMarketArea;
      } else if (item.label === "Trade") {
        isActive = isTradeArea;
      } else {
        isActive =
          pathname === item.href ||
          pathname.startsWith(item.href.split("?")[0] + "/");
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative mb-1 flex h-11 items-center gap-3 rounded-lg transition-colors",
            collapsed ? "justify-center px-0" : "px-4",
            isActive
              ? "bg-card text-foreground"
              : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
          )}
          title={collapsed ? item.label : undefined}
        >
          <span className="relative flex-shrink-0">
            <item.icon className="h-5 w-5" />
          </span>
          {!collapsed ? <span className="flex-1">{item.label}</span> : null}
        </Link>
      );
    });
  };

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-background transition-[width,transform] duration-300 ease-out motion-reduce:transition-none",
          collapsed ? "w-[72px]" : "w-[220px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex h-[68px] flex-shrink-0 items-center p-4",
            collapsed ? "justify-center" : "justify-between px-6",
          )}
        >
          {collapsed ? (
            <Link
              href="/"
              aria-label={brandName}
              className="flex h-9 items-center justify-center"
            >
              <span className="text-2xl font-bold tracking-tight text-foreground">
                SN
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/"
                aria-label={brandName}
                className="flex h-9 items-center"
              >
                <SubnicheLogo width={117} height={36} light priority />
              </Link>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-lg p-2 transition-colors hover:bg-card lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className={cn("mb-6", collapsed ? "px-2" : "px-4")}>
          <Link
            href={createHref}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary/50 bg-card text-foreground transition-colors hover:bg-card/80",
              collapsed ? "px-0" : "px-4",
            )}
            title={collapsed ? "Add Item" : undefined}
          >
            <Plus className="h-5 w-5 text-primary" />
            {!collapsed ? <span>Add Item</span> : null}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          {/* Visual-only Home placeholder — present in the nav stack for
              familiarity, but inert (doesn't navigate or carry content) in
              this hub-and-spoke module. */}
          <button
            type="button"
            aria-disabled="true"
            tabIndex={-1}
            className={cn(
              "relative mb-1 flex h-11 w-full items-center gap-3 rounded-lg text-muted-foreground/60 transition-colors",
              collapsed ? "justify-center px-0" : "px-4",
              "cursor-default",
            )}
            title={collapsed ? "Home" : undefined}
          >
            <span className="relative flex-shrink-0">
              <Home className="h-5 w-5" />
            </span>
            {!collapsed ? <span className="flex-1 text-left">Home</span> : null}
          </button>

          <div className="hidden lg:block">{renderNavItems(desktopNavItems)}</div>
          <div className="lg:hidden">{renderNavItems(mobileNavItems)}</div>

          <Link
            href="/communities"
            className={cn(
              "relative mb-1 flex h-11 items-center gap-3 rounded-lg transition-colors",
              collapsed ? "justify-center px-0" : "px-4",
              isCommunitiesArea
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
            )}
            title={collapsed ? "Communities" : undefined}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            {!collapsed ? <span className="flex-1 text-left">Communities</span> : null}
          </Link>

          <Link
            href="/favorites"
            className={cn(
              "relative mb-1 flex h-11 items-center gap-3 rounded-lg transition-colors",
              collapsed ? "justify-center px-0" : "px-4",
              isFavoritesArea
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
            )}
            title={collapsed ? "Following" : undefined}
          >
            <Heart className="h-5 w-5 flex-shrink-0" />
            {!collapsed ? <span className="flex-1 text-left">Following</span> : null}
          </Link>

          <Link
            href="/my-stuff"
            className={cn(
              "relative mb-1 flex h-11 items-center gap-3 rounded-lg transition-colors",
              collapsed ? "justify-center px-0" : "px-4",
              isMyStuffArea
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
            )}
            title={collapsed ? "My Stuff" : undefined}
          >
            <Package className="h-5 w-5 flex-shrink-0" />
            {!collapsed ? <span className="flex-1 text-left">My Stuff</span> : null}
          </Link>

          <Link
            href="/inbox"
            className={cn(
              "relative mb-1 flex h-11 items-center gap-3 rounded-lg transition-colors",
              collapsed ? "justify-center px-0" : "px-4",
              pathname === "/inbox" || pathname.startsWith("/inbox/")
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
            )}
            title={collapsed ? "Inbox" : undefined}
          >
            <Inbox className="h-5 w-5 flex-shrink-0" />
            {!collapsed ? <span className="flex-1 text-left">Inbox</span> : null}
          </Link>

          <Link
            href={currentUser.profileHref}
            className={cn(
              "mb-1 flex h-11 items-center gap-3 rounded-lg transition-colors",
              collapsed ? "justify-center px-0" : "px-4",
              isProfileActive
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
            )}
            title={collapsed ? "Profile" : undefined}
          >
            <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
              <Avatar
                className={cn(
                  "h-8 w-8 border",
                  isProfileActive ? "border-primary" : "border-transparent",
                )}
              >
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
                <AvatarFallback className="text-xs">
                  {currentUser.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </span>
            {!collapsed ? <span>Profile</span> : null}
          </Link>
        </nav>

        <div className="border-t border-border px-2 py-2">
          <NicheSwitcher collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
