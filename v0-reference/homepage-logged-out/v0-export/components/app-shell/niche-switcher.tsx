"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bike,
  Check,
  ChevronDown,
  Disc3,
  Globe,
  Guitar,
  Plus,
  Search,
  Wine,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Niche {
  id: string;
  name: string;
  icon: ReactNode;
}

const platformNiches: Niche[] = [
  { id: "guitars", name: "Guitars", icon: <Guitar className="h-4 w-4" /> },
  { id: "motorcycles", name: "Motorcycles", icon: <Bike className="h-4 w-4" /> },
  { id: "disc-golf", name: "Disc Golf", icon: <Disc3 className="h-4 w-4" /> },
  { id: "wines", name: "Wines", icon: <Wine className="h-4 w-4" /> },
];

type NicheSwitcherVariant = "rail" | "chip";

interface NicheSwitcherProps {
  /** "rail" = lower-left sidebar trigger (default). "chip" = header profile chip. */
  variant?: NicheSwitcherVariant;
  /** rail only: collapsed sidebar shows icon-only trigger */
  collapsed?: boolean;
  /** chip only: user context shown inside the trigger */
  user?: {
    avatarUrl: string;
    username: string;
    displayName: string;
  };
}

export function NicheSwitcher({
  variant = "rail",
  collapsed = false,
  user,
}: NicheSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentNiche, setCurrentNiche] = useState<Niche>(platformNiches[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredNiches = platformNiches.filter((niche) =>
    niche.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleNicheSelect = (niche: Niche) => {
    setCurrentNiche(niche);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isChip = variant === "chip";

  const initials = user
    ? user.displayName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <div ref={dropdownRef} className="relative">
      {isChip && user ? (
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className={cn(
            "flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-card",
            isOpen && "bg-card",
          )}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title={`Switch niche — currently ${currentNiche.name}`}
        >
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback className="bg-card text-xs text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-sm font-semibold text-foreground">
              {user.displayName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              u/{user.username}
            </span>
          </div>

          <ChevronDown
            className={cn(
              "hidden h-4 w-4 text-muted-foreground transition-transform sm:block",
              isOpen && "rotate-180",
            )}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted/50",
            collapsed && "justify-center",
            isOpen && "bg-muted/50",
          )}
          title={collapsed ? currentNiche.name : undefined}
        >
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
        </button>
      )}

      {isOpen ? (
        <div
          className={cn(
            "absolute z-50 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-lg",
            isChip
              ? "right-0 top-full mt-2"
              : "bottom-0 left-full ml-2",
          )}
          role="menu"
        >
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Find niche..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded border-0 bg-muted/30 py-1.5 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-transparent focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {filteredNiches.map((niche) => {
              const isSelected = niche.id === currentNiche.id;

              return (
                <button
                  key={niche.id}
                  type="button"
                  onClick={() => handleNicheSelect(niche)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex-shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {niche.icon}
                  </span>
                  <span className="flex-1 truncate text-xs font-medium">
                    {niche.name}
                  </span>
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })}

            {filteredNiches.length === 0 ? (
              <p className="px-3 py-2 text-center text-xs text-muted-foreground">
                No niches found
              </p>
            ) : null}
          </div>

          <div className="border-t border-border">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Suggest a Niche
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
