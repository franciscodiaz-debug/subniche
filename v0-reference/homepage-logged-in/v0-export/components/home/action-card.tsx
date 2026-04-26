"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  MessageSquare,
} from "lucide-react";

import { cn } from "../../lib/utils";

export interface ActionCardProps {
  avatar: string;
  username: string;
  actionType: "offer" | "counter" | "trade" | "message" | "approved";
  itemTitle: string;
  description?: string;
  amount?: string;
  timestamp: string;
  href?: string;
}

export function ActionCard({
  avatar,
  username,
  actionType,
  itemTitle,
  description,
  timestamp,
  href = "/messages",
}: ActionCardProps) {
  const actionConfig = {
    offer: {
      title: "New Trade Offer",
      icon: ArrowLeftRight,
      iconColor: "text-primary",
    },
    counter: {
      title: "New Counter Offer",
      icon: ArrowLeftRight,
      iconColor: "text-primary",
    },
    trade: {
      title: "New Trade Offer",
      icon: ArrowLeftRight,
      iconColor: "text-primary",
    },
    message: {
      title: "New Message",
      icon: MessageSquare,
      iconColor: "text-sky-500",
    },
    approved: {
      title: "Accepted Offer",
      icon: Check,
      iconColor: "text-emerald-500",
    },
  } as const;

  const config = actionConfig[actionType];
  const Icon = config.icon;
  const isOfferRelated =
    actionType === "offer" ||
    actionType === "counter" ||
    actionType === "trade" ||
    actionType === "approved";
  const linkText = isOfferRelated ? "Go to offer" : "Go to conversation";

  return (
    <Link href={href} className="block group/card">
      <div className="flex min-h-[200px] flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/70">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src={avatar || "/placeholder.svg"}
              alt={username}
              width={44}
              height={44}
              className="shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{username}</p>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
          </div>

          <div className="rounded-full bg-secondary p-2.5">
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>
        </div>

        <h3 className="mb-2 text-base font-bold text-foreground">
          {config.title}
        </h3>

        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {description || `${username} is interested in your ${itemTitle}.`}
        </p>

        <div className="mt-4 pt-2 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover/card:text-primary/80">
            {linkText}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
