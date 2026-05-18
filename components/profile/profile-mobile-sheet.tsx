"use client"

import type { MouseEvent } from "react"
import { useEffect, useRef, useState } from "react"
import {
  Check,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  ProfileLinkedAccountReference,
  ProfileSummaryReference,
} from "@/lib/profile-page-types"
import { userNiches } from "./profile-niche-switcher"

interface ProfileMobileSheetProps {
  open: boolean
  onClose: () => void
  profile: ProfileSummaryReference
  isOwnProfile: boolean
}

const DRAG_CLOSE_THRESHOLD = 80

export function ProfileMobileSheet({
  open,
  onClose,
  profile,
  isOwnProfile,
}: ProfileMobileSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartY = useRef<number | null>(null)

  useEffect(() => {
    let id: number

    if (open) {
      id = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(id)
    }
    id = requestAnimationFrame(() => {
      setMounted(false)
      setDragOffset(0)
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    dragStartY.current = event.touches[0]?.clientY ?? null
  }
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartY.current == null) return
    const delta = (event.touches[0]?.clientY ?? 0) - dragStartY.current
    if (delta > 0) setDragOffset(delta)
  }
  const handleTouchEnd = () => {
    if (dragOffset > DRAG_CLOSE_THRESHOLD) {
      onClose()
    } else {
      setDragOffset(0)
    }
    dragStartY.current = null
  }

  const verifiedItems = [
    { key: "email", icon: Mail, label: "Email verified", active: profile.verification.email },
    { key: "phone", icon: Phone, label: "Phone verified", active: profile.verification.phone },
    { key: "id", icon: ShieldCheck, label: "ID verified", active: profile.verification.id },
  ].filter((item) => item.active)

  const handleShare = () => {
    if (typeof window === "undefined") return
    const url = `${window.location.origin}/profile/${profile.username}`
    if (navigator?.share) {
      navigator.share({ title: `${profile.username}'s profile`, url }).catch(() => {})
    } else if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Profile details" className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        style={{ transform: `translateY(${mounted ? dragOffset : 600}px)` }}
        className={cn(
          "relative max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-border bg-card shadow-2xl",
          dragOffset === 0 && "transition-transform duration-200 ease-out",
        )}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex justify-center pb-1 pt-3 touch-none"
        >
          <div aria-hidden className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{profile.username}</p>
            <p className="truncate text-xs text-muted-foreground">@{profile.ownerHandle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-3.5rem)] overflow-y-auto pb-6">
          {profile.bio ? (
            <SheetSection>
              <p className="text-sm leading-relaxed text-foreground">{profile.bio}</p>
            </SheetSection>
          ) : null}
          {verifiedItems.length > 0 ? (
            <SheetSection title="Verified">
              <ul className="space-y-2">
                {verifiedItems.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-3 rounded-md border border-success/30 bg-success/10 px-3 py-2"
                  >
                    <item.icon className="h-4 w-4 text-success" aria-hidden />
                    <span className="flex-1 text-sm text-foreground">{item.label}</span>
                    <Check className="h-4 w-4 text-success" aria-hidden />
                  </li>
                ))}
              </ul>
            </SheetSection>
          ) : null}
          {profile.linkedAccounts.length > 0 ? (
            <SheetSection title="Linked accounts">
              <ul className="overflow-hidden rounded-md border border-border">
                {profile.linkedAccounts.map((account) => (
                  <li
                    key={`${account.platform}-${account.username}`}
                    className="border-border [&:not(:first-child)]:border-t"
                  >
                    <a
                      href="#"
                      onClick={(event) => handleLinkedAccountClick(event, account)}
                      className="flex w-full items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/30"
                    >
                      <span className="flex-1 text-sm capitalize text-foreground">
                        {account.platform}
                      </span>
                      {account.verified ? <Check className="h-4 w-4 text-primary" aria-hidden /> : null}
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </SheetSection>
          ) : null}
          <SheetSection title={isOwnProfile ? "Your niches" : `${profile.username}'s niches`}>
            <ul className="overflow-hidden rounded-md border border-border">
              {userNiches.map((niche, index) => {
                const isActive = niche.name === profile.username
                return (
                  <li key={niche.id} className={cn("border-border", index !== 0 && "border-t")}>
                    <button
                      type="button"
                      onClick={onClose}
                      className={cn(
                        "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-muted/30",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted/60",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {niche.icon}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-sm font-medium text-foreground">
                          {niche.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          @{profile.ownerHandle}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </SheetSection>
          <SheetSection title="Actions">
            <ul className="overflow-hidden rounded-md border border-border">
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <span className="flex-1 text-sm text-foreground">View niches</span>
                </button>
              </li>
              <li className="border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    handleShare()
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30"
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <span className="flex-1 text-sm text-foreground">Share profile</span>
                </button>
              </li>
            </ul>
          </SheetSection>
        </div>
      </div>
    </div>
  )
}

function handleLinkedAccountClick(
  event: MouseEvent<HTMLAnchorElement>,
  account: ProfileLinkedAccountReference,
) {
  if (account.verified) return

  event.preventDefault()
  window.alert("This account has not been verified by the user.")
}

function SheetSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border px-4 py-4 first:border-t-0">
      {title ? (
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  )
}
