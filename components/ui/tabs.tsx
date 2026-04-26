"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used inside <Tabs>.");
  }

  return context;
}

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const context = useMemo(() => ({ value, setValue }), [value]);

  return (
    <TabsContext.Provider value={context}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-background p-1",
        className,
      )}
      role="tablist"
      {...props}
    />
  );
}

type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const context = useTabsContext();
  const active = context.value === value;

  return (
    <button
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground",
        active && "bg-card text-foreground shadow-card",
        className,
      )}
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      type="button"
      onClick={() => context.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({
  value,
  className,
  ...props
}: TabsContentProps) {
  const context = useTabsContext();

  if (context.value !== value) {
    return null;
  }

  return (
    <div
      className={cn("mt-4", className)}
      role="tabpanel"
      tabIndex={0}
      {...props}
    />
  );
}
