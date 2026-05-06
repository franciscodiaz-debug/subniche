"use client"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface ListingCardProps {
  image: string
  title: string
  subtitle?: string
  price?: number | null
  badge?: string
  badgeVariant?: "primary" | "success" | "info"
  href?: string
  className?: string
}

const badgeStyles: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-status-success/10 text-status-success border border-status-success/30",
  info: "bg-status-info/10 text-status-info border border-status-info/30",
}

export function ListingCard({
  image,
  title,
  subtitle,
  price,
  badge,
  badgeVariant = "primary",
  href,
  className,
}: ListingCardProps) {
  const inner = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {badge ? (
          <span
            className={cn(
              "absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              badgeStyles[badgeVariant],
            )}
          >
            {badge}
          </span>
        ) : null}
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{subtitle}</p>
        ) : null}
        {price != null ? (
          <p className="mt-1.5 text-sm font-bold text-primary">${price.toLocaleString('en-US')}</p>
        ) : null}
      </div>
    </>
  )

  const cardClassName = cn(
    "group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40",
    className,
  )

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {inner}
      </Link>
    )
  }

  return <div className={cardClassName}>{inner}</div>
}
