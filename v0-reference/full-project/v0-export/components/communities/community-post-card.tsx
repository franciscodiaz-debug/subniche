"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Pin,
  Lock,
  HelpCircle,
  Sparkles,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PostDetailDialog } from "./post-detail-dialog"
import type { CommunityPost } from "@/lib/types"

interface CommunityPostCardProps {
  post: CommunityPost
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.has_liked || false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [showDetail, setShowDetail] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setIsLiked(!isLiked)
  }

  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-400" />
      case "show_and_tell":
        return <Sparkles className="h-4 w-4 text-amber-400" />
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPostTypeLabel = () => {
    switch (post.post_type) {
      case "question":
        return "Question"
      case "show_and_tell":
        return "Show & Tell"
      default:
        return "Discussion"
    }
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={cn(
          "bg-card border border-border rounded-xl p-4 transition-colors hover:border-primary/50 cursor-pointer",
          post.is_pinned && "border-primary/30 bg-primary/5",
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <Link href={`/profile/${post.author?.username}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
              {post.author?.avatar_url ? (
                <Image
                  src={post.author.avatar_url || "/placeholder.svg"}
                  alt={post.author.username}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-muted-foreground">
                  {post.author?.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${post.author?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-foreground hover:underline"
              >
                {post.author?.username || "Unknown"}
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{timeAgo}</span>
              {post.is_pinned && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Pin className="h-3 w-3" />
                  Pinned
                </span>
              )}
              {post.is_locked && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              )}
            </div>

            {/* Post type badge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {getPostTypeIcon()}
              <span className="text-xs text-muted-foreground">{getPostTypeLabel()}</span>
            </div>
          </div>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mt-3">
          <h3 className="font-semibold text-foreground text-lg leading-tight">{post.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.content}</p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-3">
            <div className={cn("grid gap-2", post.images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
              {post.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-lg overflow-hidden bg-muted",
                    post.images.length === 1 ? "aspect-video" : "aspect-square",
                  )}
                >
                  <Image src={image || "/placeholder.svg"} alt="" fill className="object-cover" />
                  {index === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="text-lg font-semibold">+{post.images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-4 -ml-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 text-muted-foreground hover:text-foreground",
              isLiked && "text-red-500 hover:text-red-600",
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span>{likeCount}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comment_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <PostDetailDialog post={post} open={showDetail} onOpenChange={setShowDetail} />
    </>
  )
}
