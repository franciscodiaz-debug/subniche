import {
  CircleUserRound,
  Heart,
  Home,
  Inbox,
  Landmark,
  Package,
  Plus,
  Repeat2,
  Shapes,
  Store,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const desktopNavItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    description: "Activity and orientation",
  },
  {
    href: "/market",
    label: "Market",
    icon: Store,
    description: "Browse niche inventory",
  },
  {
    href: "/trade",
    label: "Trade",
    icon: Repeat2,
    description: "Trade-aware marketplace mode",
  },
  {
    href: "/communities",
    label: "Communities",
    icon: UsersRound,
    description: "Publishing contexts and groups",
  },
  {
    href: "/favorites",
    label: "Following",
    icon: Heart,
    description: "Favorites, follows, and saved searches",
  },
  {
    href: "/collections",
    label: "My Stuff",
    icon: Package,
    description: "Curated ownership and taste",
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: Inbox,
    description: "Messages, offers, and trades",
  },
];

export const primaryAction: NavItem = {
  href: "/add-item",
  label: "Add Item",
  icon: Plus,
};

export const profileNavItem: NavItem = {
  href: "/profile",
  label: "Profile",
  icon: CircleUserRound,
  description: "Identity and trust surface",
};

export const mobileNavItems: NavItem[] = [
  desktopNavItems[0],
  desktopNavItems[1],
  {
    href: primaryAction.href,
    label: "Add",
    icon: primaryAction.icon,
  },
  desktopNavItems[5],
  profileNavItem,
];

export const shellHighlights = [
  {
    label: "Niche-first",
    value: "Music gear context",
    icon: Shapes,
  },
  {
    label: "Native trade",
    value: "True Match stays distinct",
    icon: Repeat2,
  },
  {
    label: "Community market",
    value: "Publishing context",
    icon: Landmark,
  },
];
