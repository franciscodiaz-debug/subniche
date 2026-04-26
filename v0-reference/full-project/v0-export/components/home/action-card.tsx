"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeftRight, MessageSquare, Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionCardProps {
  avatar: string
  username: string
  actionType: "offer" | "counter" | "trade" | "message" | "approved"
  itemTitle: string
  description?: string
  amount?: string
  timestamp: string
  onAction?: () => void
}

export function ActionCard({ avatar, username, actionType, itemTitle, description, timestamp }: ActionCardProps) {
  const actionConfig = {
    offer: {
      title: "New Trade Offer",
      icon: ArrowLeftRight,
      iconColor: "text-amber-500",
    },
    counter: {
      title: "New Counter Offer",
      icon: ArrowLeftRight,
      iconColor: "text-amber-500",
    },
    trade: {
      title: "New Trade Offer",
      icon: ArrowLeftRight,
      iconColor: "text-amber-500",
    },
    message: {
      title: "New Message",
      icon: MessageSquare,
      iconColor: "text-sky-500",
    },
    approved: {
      title: "Accepted Offer ",
      icon: Check,
      iconColor: "text-emerald-500",
    },
  }

  const config = actionConfig[actionType]
  const Icon = config.icon

  const isOfferRelated =
    actionType === "offer" || actionType === "counter" || actionType === "trade" || actionType === "approved"
  const linkText = isOfferRelated ? "Go to offer" : "Go to conversation"

  return (
    <Link href="/messages" className="block group/card">
      <div className="flex flex-col bg-card border border-border rounded-xl p-5 min-h-[200px] hover:border-amber-500/70 transition-all duration-200">
        {/* Header with avatar and icon */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Image
              src={avatar || "/placeholder.svg"}
              alt={username}
              width={44}
              height={44}
              className="rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{username}</p>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-secondary">
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-foreground mb-2">{config.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {description || `${username} is interested in your ${itemTitle}.`}
        </p>

        {/* Go to conversation/offer link */}
        <div className="mt-4 pt-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500 group-hover/card:text-amber-400 transition-colors">
            {linkText}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
