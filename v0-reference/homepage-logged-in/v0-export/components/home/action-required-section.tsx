"use client";

import { Bell } from "lucide-react";

import { ActionCard, type ActionCardProps } from "./action-card";
import { HomeSectionHeader } from "./home-section-header";

interface ActionRequiredSectionProps {
  items: ActionCardProps[];
  href?: string;
}

export function ActionRequiredSection({
  items,
  href = "/messages",
}: ActionRequiredSectionProps) {
  return (
    <section>
      <HomeSectionHeader
        icon={<Bell className="h-5 w-5 text-primary" />}
        title="Action Required"
        href={href}
        ctaLabel="View inbox"
      />

      <div className="group">
        <div
          className="-mx-4 overflow-x-auto px-4 pb-2 scrollbar-thin"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.scrollbarColor =
              "rgba(255,255,255,0.2) transparent";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.scrollbarColor =
              "transparent transparent";
          }}
        >
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {items.map((item) => (
              <div
                key={`${item.actionType}-${item.username}-${item.timestamp}`}
                className="w-[280px] flex-shrink-0"
              >
                <ActionCard {...item} href={href} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
