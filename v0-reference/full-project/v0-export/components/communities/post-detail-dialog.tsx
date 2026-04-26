"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Heart, Send, MoreHorizontal, HelpCircle, Sparkles, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { CommunityPost, CommunityPostComment } from "@/lib/types"

interface PostDetailDialogProps {
  post: CommunityPost
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Demo comments for the detail view
const demoComments: CommunityPostComment[] = [
  {
    id: "comment-1",
    post_id: "post-1",
    author_id: "demo-buyer-1",
    parent_id: null,
    content:
      "Circle C is great for beginners! Short holes and relatively flat terrain. Mary Moore Searight is another good option.",
    like_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    author: {
      id: "demo-buyer-1",
      username: "DiscGolfFan42",
      avatar_url: "/casual-gamer-avatar.png",
      location: "Dallas, TX",
      phone: null,
      created_at: "",
    },
  },
  {
    id: "comment-2",
    post_id: "post-1",
    author_id: "demo-user-3",
    parent_id: null,
    content: "I'd also recommend Cat Hollow for beginners. The first 9 holes are very beginner-friendly!",
    like_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    author: {
      id: "demo-user-3",
      username: "ChainSeeker",
      avatar_url: "/outdoor-enthusiast-avatar.jpg",
      location: "Houston, TX",
      phone: null,
      created_at: "",
    },
  },
]

export function PostDetailDialog({ post, open, onOpenChange }: PostDetailDialogProps) {
  const [isLiked, setIsLiked] = useState(post.has_liked || false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [newComment, setNewComment] = useState("")
  const [comments] = useState<CommunityPostComment[]>(demoComments)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setIsLiked(!isLiked)
  }

  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    // In production, this would call the createComment server action
    setNewComment("")
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

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Post Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${post.author?.username}`} className="shrink-0">
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

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author?.username}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {post.author?.username}
                </Link>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{timeAgo}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {getPostTypeIcon()}
                <span className="text-xs text-muted-foreground capitalize">{post.post_type.replace("_", " & ")}</span>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4">
          <h2 className="text-xl font-semibold text-foreground">{post.title}</h2>
          <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{post.content}</p>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mt-4">
              <div className={cn("grid gap-2", post.images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                {post.images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative rounded-lg overflow-hidden bg-muted",
                      post.images.length === 1 ? "aspect-video" : "aspect-square",
                    )}
                  >
                    <Image src={image || "/placeholder.svg"} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              {likeCount} likes
            </button>
            <span className="text-sm text-muted-foreground">{post.comment_count} comments</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-border">
          <div className="p-4 space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          {/* New Comment */}
          <div className="p-4 border-t border-border bg-card/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                U
              </div>
              <div className="flex-1 flex items-end gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={1}
                  className="resize-none min-h-[40px]"
                />
                <Button size="icon" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CommentItem({ comment }: { comment: CommunityPostComment }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.like_count)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setIsLiked(!isLiked)
  }

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.author?.username}`} className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
          {comment.author?.avatar_url ? (
            <Image
              src={comment.author.avatar_url || "/placeholder.svg"}
              alt={comment.author.username}
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
              {comment.author?.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1">
        <div className="bg-muted/50 rounded-lg px-3 py-2">
          <Link
            href={`/profile/${comment.author?.username}`}
            className="font-medium text-sm text-foreground hover:underline"
          >
            {comment.author?.username}
          </Link>
          <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 mt-1 ml-1">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          <button
            onClick={handleLike}
            className={cn(
              "text-xs transition-colors",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {likeCount > 0 && `${likeCount} `}Like{likeCount !== 1 ? "s" : ""}
          </button>
          <button className="text-xs text-muted-foreground hover:text-foreground">Reply</button>
        </div>
      </div>
    </div>
  )
}
