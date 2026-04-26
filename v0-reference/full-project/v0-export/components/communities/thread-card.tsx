"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Pin,
  Lock,
  HelpCircle,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { CommunityPost } from "@/lib/types"

interface ThreadCardProps {
  post: CommunityPost
  communitySlug: string
  compact?: boolean
}

export function ThreadCard({ post, communitySlug, compact = false }: ThreadCardProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [score, setScore] = useState(post.like_count)

  const handleVote = (direction: "up" | "down", e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (vote === direction) {
      setVote(null)
      setScore(post.like_count)
    } else {
      if (vote === "up") setScore((s) => s - 1)
      if (vote === "down") setScore((s) => s + 1)
      setVote(direction)
      if (direction === "up") setScore((s) => s + 1)
      if (direction === "down") setScore((s) => s - 1)
    }
  }

  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case "question":
        return <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
      case "show_and_tell":
        return <Sparkles className="h-3.5 w-3.5 text-amber-400" />
      default:
        return null
    }
  }

  const getPostTypeLabel = () => {
    switch (post.post_type) {
      case "question":
        return "Question"
      case "show_and_tell":
        return "Show & Tell"
      default:
        return null
    }
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: false })
  const postTypeLabel = getPostTypeLabel()

  if (compact) {
    return (
      <Link
        href={`/communities/${communitySlug}/threads/${post.id}`}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors",
          post.is_pinned && "bg-primary/5",
        )}
      >
        {/* Compact vote display */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-12">
          <ArrowBigUp className={cn("h-4 w-4", vote === "up" && "text-primary fill-current")} />
          <span className={cn("font-medium", vote === "up" && "text-primary", vote === "down" && "text-destructive")}>
            {score}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {post.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
            {getPostTypeIcon()}
            <h3 className="font-medium text-sm text-foreground truncate">{post.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <span>{post.author?.username || "Unknown"}</span>
            <span>·</span>
            <span>{timeAgo}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {post.comment_count}
            </span>
          </div>
        </div>

        {/* Thumbnail if available */}
        {post.images && post.images.length > 0 && (
          <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
            <Image src={post.images[0] || "/placeholder.svg"} alt="" fill className="object-cover" />
          </div>
        )}
      </Link>
    )
  }

  // Full variant (original)
  return (
    <Link
      href={`/communities/${communitySlug}/threads/${post.id}`}
      className={cn("flex hover:bg-muted/30 cursor-pointer transition-colors", post.is_pinned && "bg-primary/5")}
    >
      <div className="flex flex-col items-center justify-start w-10 shrink-0 py-3 bg-muted/20 border-r border-border/50">
        <button
          onClick={(e) => handleVote("up", e)}
          className={cn(
            "p-1 rounded hover:bg-muted transition-colors",
            vote === "up" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowBigUp className={cn("h-5 w-5", vote === "up" && "fill-current")} />
        </button>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums py-0.5",
            vote === "up" && "text-primary",
            vote === "down" && "text-destructive",
            !vote && "text-foreground",
          )}
        >
          {score}
        </span>
        <button
          onClick={(e) => handleVote("down", e)}
          className={cn(
            "p-1 rounded hover:bg-muted transition-colors",
            vote === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowBigDown className={cn("h-5 w-5", vote === "down" && "fill-current")} />
        </button>
      </div>

      <div className="flex-1 min-w-0 px-4 py-3">
        {/* Meta line */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          {post.is_pinned && <span>·</span>}
          {postTypeLabel && (
            <>
              <span className="flex items-center gap-1">
                {getPostTypeIcon()}
                {postTypeLabel}
              </span>
              <span>·</span>
            </>
          )}
          <span onClick={(e) => e.stopPropagation()} className="font-medium text-foreground hover:underline">
            {post.author?.username || "Unknown"}
          </span>
          <span>·</span>
          <span>{timeAgo}</span>
          {post.is_locked && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-foreground mt-1.5 leading-snug">{post.title}</h3>

        {/* Preview content */}
        {post.content && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>}

        {/* Thumbnail images */}
        {post.images && post.images.length > 0 && (
          <div className="flex gap-2 mt-2.5">
            {post.images.slice(0, 3).map((image, index) => (
              <div key={index} className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                <Image src={image || "/placeholder.svg"} alt="" fill className="object-cover" />
                {index === 2 && post.images.length > 3 && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <span className="text-xs font-medium">+{post.images.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-1 mt-2.5">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              {post.comment_count} {post.comment_count === 1 ? "reply" : "replies"}
            </span>
          </span>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Save</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
              <DropdownMenuItem>Hide</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Link>
  )
}
