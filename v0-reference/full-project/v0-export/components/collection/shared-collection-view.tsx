"use client"

import type React from "react"

import { useState } from "react"
import { Heart, MessageCircle, Share2, Lock, Globe, Users, Send, Grid3X3, List, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionItem, CollectionComment, Profile } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SharedCollectionViewProps {
  collection: Collection & { owner?: Profile }
  items: CollectionItem[]
  comments: (CollectionComment & { profiles?: Profile })[]
}

export function SharedCollectionView({ collection, items, comments: initialComments }: SharedCollectionViewProps) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const supabase = createClient()

  // Calculate totals
  const totalItems = items.filter((i) => i.is_owned).length
  const totalUserValue = items
    .filter((i) => i.is_owned)
    .reduce((sum, item) => sum + (item.user_estimated_value || 0), 0)
  const totalAiValue = items.filter((i) => i.is_owned).reduce((sum, item) => sum + (item.ai_suggested_value || 0), 0)

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Please sign in to comment")
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from("collection_comments")
      .insert({
        collection_id: collection.id,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select(
        `
        *,
        profiles!collection_comments_user_id_fkey (
          username,
          avatar_url
        )
      `,
      )
      .single()

    if (!error && data) {
      setComments((prev) => [data, ...prev])
      setNewComment("")
    }

    setIsSubmitting(false)
  }

  const PrivacyIcon = collection.privacy === "public" ? Globe : collection.privacy === "shared" ? Users : Lock

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Owner info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={collection.owner?.avatar_url || undefined} />
              <AvatarFallback>{collection.owner?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Collection by</p>
              <p className="font-medium text-foreground">{collection.owner?.username || "Unknown"}</p>
            </div>
          </div>

          {/* Collection info */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {collection.is_wishlist && <Heart className="h-6 w-6 text-chart-5 fill-chart-5" />}
                <h1 className="text-3xl font-bold text-foreground">{collection.name}</h1>
                <PrivacyIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              {collection.description && (
                <p className="text-muted-foreground mt-2 max-w-2xl">{collection.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                {comments.length}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Stats */}
          {!collection.is_wishlist && (
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-xl font-bold text-foreground">{totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="text-xl font-bold text-foreground">${totalUserValue.toLocaleString()}</p>
              </div>
              {totalAiValue > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Estimate
                  </p>
                  <p className="text-xl font-bold text-chart-2">${totalAiValue.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className={cn("grid gap-8", showComments ? "lg:grid-cols-[1fr_320px]" : "")}>
          {/* Items */}
          <div>
            {/* View toggle */}
            <div className="flex justify-end mb-4">
              <div className="flex bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No items in this collection yet</p>
              </div>
            ) : (
              <div
                className={cn(
                  view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3",
                )}
              >
                {items.map((item) => (
                  <SharedItemCard key={item.id} item={item} view={view} />
                ))}
              </div>
            )}
          </div>

          {/* Comments sidebar */}
          {showComments && (
            <div className="bg-card border border-border rounded-lg p-4 h-fit sticky top-4">
              <h3 className="font-medium text-foreground mb-4">Comments ({comments.length})</h3>

              {/* Comment form */}
              <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-secondary border-border"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-primary text-primary-foreground flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {/* Comments list */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {comment.profiles?.username || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SharedItemCard({ item, view }: { item: CollectionItem; view: "grid" | "list" }) {
  const primaryImage = item.images?.[0] || "/generic-item.png"

  if (view === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex-shrink-0 w-16 h-16 bg-secondary rounded-lg overflow-hidden">
          <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{item.title}</h3>
          {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {item.condition} {item.category && `• ${item.category}`}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          {item.user_estimated_value && (
            <p className="font-medium text-foreground">${item.user_estimated_value.toLocaleString()}</p>
          )}
          {item.ai_suggested_value && (
            <div className="flex items-center gap-1 text-xs text-chart-2">
              <Sparkles className="h-3 w-3" />${item.ai_suggested_value.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="aspect-square bg-secondary overflow-hidden">
        <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{item.title}</h3>
        {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <div>
            {item.user_estimated_value ? (
              <p className="font-medium text-foreground">${item.user_estimated_value.toLocaleString()}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No value set</p>
            )}
          </div>
          {item.ai_suggested_value && (
            <div className="flex items-center gap-1 text-xs text-chart-2">
              <Sparkles className="h-3 w-3" />${item.ai_suggested_value.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
