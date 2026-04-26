"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Copy, Check, Globe, Users, Lock, Mail, Link2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionShare, Profile } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ShareCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  collection: Collection
  onUpdate: (collection: Collection) => void
}

export function ShareCollectionModal({ isOpen, onClose, collection, onUpdate }: ShareCollectionModalProps) {
  const [privacy, setPrivacy] = useState(collection.visibility)
  const [shares, setShares] = useState<(CollectionShare & { shared_with_user?: Profile })[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  const supabase = createClient()
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/collection/shared/${collection.share_token}`

  // Fetch existing shares
  useEffect(() => {
    if (!isOpen) return

    async function fetchShares() {
      const { data } = await supabase
        .from("collection_shares")
        .select(
          `
          *,
          profiles!collection_shares_shared_with_user_id_fkey (
            username,
            avatar_url
          )
        `,
        )
        .eq("collection_id", collection.id)

      if (data) {
        setShares(data.map((share) => ({ ...share, shared_with_user: share.profiles })))
      }
    }

    fetchShares()
  }, [isOpen, collection.id, supabase])

  const handlePrivacyChange = async (newPrivacy: typeof privacy) => {
    setIsUpdating(true)

    const { error } = await supabase.from("collections").update({ privacy: newPrivacy }).eq("id", collection.id)

    if (!error) {
      setPrivacy(newPrivacy)
      onUpdate({ ...collection, privacy: newPrivacy })
    }

    setIsUpdating(false)
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleInviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)

    // Find user by email (in a real app, you'd search profiles or send an email invite)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", inviteEmail.trim())
      .single()

    if (profile) {
      // Add share
      const { data, error } = await supabase
        .from("collection_shares")
        .insert({
          collection_id: collection.id,
          shared_with_user_id: profile.id,
          can_comment: true,
        })
        .select()
        .single()

      if (!error && data) {
        setShares((prev) => [...prev, { ...data, shared_with_user: profile }])
        setInviteEmail("")
      }
    } else {
      alert("User not found. Try searching by username.")
    }

    setIsInviting(false)
  }

  const handleRemoveShare = async (shareId: string) => {
    const { error } = await supabase.from("collection_shares").delete().eq("id", shareId)

    if (!error) {
      setShares((prev) => prev.filter((s) => s.id !== shareId))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Share Collection</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Privacy Settings */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Visibility</Label>
            <div className="space-y-2">
              {[
                {
                  value: "private",
                  icon: Lock,
                  label: "Private",
                  description: "Only you can see this collection",
                },
                {
                  value: "shared",
                  icon: Users,
                  label: "Shared",
                  description: "Only people you invite can view",
                },
                {
                  value: "public",
                  icon: Globe,
                  label: "Public",
                  description: "Anyone with the link can view",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePrivacyChange(option.value as typeof privacy)}
                  disabled={isUpdating}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                    privacy === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <option.icon
                    className={cn("h-5 w-5", privacy === option.value ? "text-primary" : "text-muted-foreground")}
                  />
                  <div className="flex-1">
                    <p className={cn("font-medium text-sm", privacy === option.value ? "text-foreground" : "")}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Share Link */}
          {privacy !== "private" && (
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Share Link</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-lg">
                  <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{shareUrl}</span>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {isCopied ? <Check className="h-4 w-4 text-chart-2" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Invite People (for shared collections) */}
          {privacy === "shared" && (
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Invite People</Label>
              <form onSubmit={handleInviteByEmail} className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                <Button type="submit" disabled={!inviteEmail.trim() || isInviting}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </form>

              {/* Shared with list */}
              {shares.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Shared with</p>
                  {shares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={share.shared_with_user?.avatar_url || undefined} />
                          <AvatarFallback>{share.shared_with_user?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          {share.shared_with_user?.username || "Unknown"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
