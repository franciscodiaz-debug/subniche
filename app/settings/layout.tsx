import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Bell, Shield, Store, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsNavGroup = {
  section: string;
  items: Array<{
    label: string;
    href: string;
    icon: LucideIcon;
    active?: boolean;
    disabled?: boolean;
  }>;
};

const settingsNav: SettingsNavGroup[] = [
  {
    section: "Selling",
    items: [
      {
        label: "Seller defaults",
        href: "/settings/seller-defaults",
        icon: Store,
        active: true,
      },
    ],
  },
  {
    section: "Preferences",
    items: [
      {
        label: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
        disabled: true,
      },
      {
        label: "Privacy & security",
        href: "/settings/privacy",
        icon: Shield,
        disabled: true,
      },
    ],
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-10 lg:py-10">
      <aside className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Profile
          </Link>
          <h1 className="mt-4 text-lg font-semibold text-foreground">
            Settings
          </h1>
        </div>
        <nav className="space-y-4 p-3" aria-label="Settings">
          {settingsNav.map((group) => (
            <div key={group.section}>
              <div className="px-2 py-2 text-xs font-semibold uppercase text-muted-foreground">
                {group.section}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.href}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-muted-foreground/45"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {item.label}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition",
                        item.active
                          ? "bg-accent/12 text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
