"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
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
  MessageCircle,
  Send,
  Flag,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { demoCommunities, demoCommunityPosts } from "@/lib/demo-data"
import type { CommunityPostComment } from "@/lib/types"

// Demo comments with nested replies
const demoComments: CommunityPostComment[] = [
  {
    id: "comment-1",
    post_id: "post-1",
    author_id: "demo-buyer-1",
    parent_id: null,
    content:
      "Circle C is great for beginners! Short holes and relatively flat terrain. The course is well-maintained and has good signage throughout. I took my kids there last weekend and they had a blast. Pro tip: go early on weekends to avoid the crowds.",
    like_count: 12,
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
    replies: [
      {
        id: "comment-1-reply-1",
        post_id: "post-1",
        author_id: "demo-user-4",
        parent_id: "comment-1",
        content:
          "Totally agree! Circle C is where I learned to play. The community there is super welcoming to newbies.",
        like_count: 4,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        author: {
          id: "demo-user-4",
          username: "AustinDiscGolfer",
          avatar_url: "/outdoor-enthusiast-avatar.jpg",
          location: "Austin, TX",
          phone: null,
          created_at: "",
        },
      },
      {
        id: "comment-1-reply-2",
        post_id: "post-1",
        author_id: "demo-user-5",
        parent_id: "comment-1",
        content: "What time do you usually go? I've been meaning to check it out.",
        like_count: 1,
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        author: {
          id: "demo-user-5",
          username: "NewToDiscs",
          avatar_url: null,
          location: "Austin, TX",
          phone: null,
          created_at: "",
        },
      },
    ],
  },
  {
    id: "comment-2",
    post_id: "post-1",
    author_id: "demo-user-3",
    parent_id: null,
    content:
      "I'd also recommend Cat Hollow for beginners. The first 9 holes are very beginner-friendly with wide fairways and not too many obstacles. The back 9 gets more challenging, so it's great for progression. They also have a practice basket area near the parking lot where you can work on your putting.",
    like_count: 8,
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
  {
    id: "comment-3",
    post_id: "post-1",
    author_id: "demo-user-6",
    parent_id: null,
    content:
      "Mary Moore Searight is another solid choice. It's a bit more wooded which helps you learn to throw controlled shots. Just watch out for the water on holes 4 and 12!",
    like_count: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    author: {
      id: "demo-user-6",
      username: "TreeLover_DG",
      avatar_url: null,
      location: "Austin, TX",
      phone: null,
      created_at: "",
    },
    replies: [
      {
        id: "comment-3-reply-1",
        post_id: "post-1",
        author_id: "demo-buyer-1",
        parent_id: "comment-3",
        content: "Lost my favorite disc in that water on hole 12 last month. Still hurts. 😅",
        like_count: 3,
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        author: {
          id: "demo-buyer-1",
          username: "DiscGolfFan42",
          avatar_url: "/casual-gamer-avatar.png",
          location: "Dallas, TX",
          phone: null,
          created_at: "",
        },
      },
    ],
  },
]

interface ThreadDetailContentProps {
  communitySlug: string
  threadId: string
}

export function ThreadDetailContent({ communitySlug, threadId }: ThreadDetailContentProps) {
  const router = useRouter()
  const community = demoCommunities.find((c) => c.slug === communitySlug)
  const post = demoCommunityPosts.find((p) => p.id === threadId) || demoCommunityPosts[0]

  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [score, setScore] = useState(post.like_count)
  const [replyContent, setReplyContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    )
  }

  const handleVote = (direction: "up" | "down") => {
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

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return
    // In production, this would call a server action
    setReplyContent("")
    setReplyingTo(null)
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <Link
              href={`/communities/${communitySlug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {community.name}
            </Link>
            <h1 className="font-medium truncate">{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Main post */}
        <article className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="flex">
            {/* Vote column */}
            <div className="flex flex-col items-center gap-1 p-4 bg-muted/30">
              <button
                onClick={() => handleVote("up")}
                className={cn(
                  "p-1 rounded hover:bg-muted transition-colors",
                  vote === "up" ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ArrowBigUp className={cn("h-6 w-6", vote === "up" && "fill-current")} />
              </button>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  vote === "up" && "text-primary",
                  vote === "down" && "text-destructive",
                  !vote && "text-foreground",
                )}
              >
                {score}
              </span>
              <button
                onClick={() => handleVote("down")}
                className={cn(
                  "p-1 rounded hover:bg-muted transition-colors",
                  vote === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ArrowBigDown className={cn("h-6 w-6", vote === "down" && "fill-current")} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {post.is_pinned && (
                  <>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Pin className="h-3.5 w-3.5" />
                      Pinned
                    </span>
                    <span>·</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  {getPostTypeIcon()}
                  {getPostTypeLabel()}
                </span>
                <span>·</span>
                <span>Posted by</span>
                <Link
                  href={`/profile/${post.author?.username}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {post.author?.username || "Unknown"}
                </Link>
                <span>·</span>
                <span>{timeAgo}</span>
                {post.is_locked && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Lock className="h-3.5 w-3.5" />
                      Locked
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold mt-3">{post.title}</h2>

              {/* Content */}
              <div className="mt-4 text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="mt-4">
                  <div className={cn("grid gap-3", post.images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                    {post.images.map((image, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity",
                          post.images.length === 1 ? "aspect-video max-h-96" : "aspect-square",
                        )}
                      >
                        <Image src={image || "/placeholder.svg"} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border -ml-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comment_count} comments</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Bookmark className="h-4 w-4" />
                  <span>Save</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </article>

        {/* Reply composer */}
        {!post.is_locked && (
          <div className="mt-6 bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-medium mb-3">Add a comment</h3>
            <Textarea
              placeholder="What are your thoughts?"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end mt-3">
              <Button onClick={handleSubmitReply} disabled={!replyContent.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        )}

        {post.is_locked && (
          <div className="mt-6 bg-muted/50 rounded-lg border border-border p-4 text-center">
            <Lock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">This thread has been locked by a moderator.</p>
          </div>
        )}

        {/* Comments section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {post.comment_count} {post.comment_count === 1 ? "Comment" : "Comments"}
          </h3>

          <div className="space-y-0">
            {demoComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                replyingTo={replyingTo}
                onReply={setReplyingTo}
                depth={0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CommentThreadProps {
  comment: CommunityPostComment
  replyingTo: string | null
  onReply: (id: string | null) => void
  depth: number
}

function CommentThread({ comment, replyingTo, onReply, depth }: CommentThreadProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [score, setScore] = useState(comment.like_count)
  const [collapsed, setCollapsed] = useState(false)
  const [replyContent, setReplyContent] = useState("")

  const handleVote = (direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation()
    if (vote === direction) {
      setVote(null)
      setScore(comment.like_count)
    } else {
      if (vote === "up") setScore((s) => s - 1)
      if (vote === "down") setScore((s) => s + 1)
      setVote(direction)
      if (direction === "up") setScore((s) => s + 1)
      if (direction === "down") setScore((s) => s - 1)
    }
  }

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return
    setReplyContent("")
    onReply(null)
  }

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: false })
  const isReplying = replyingTo === comment.id
  const maxDepth = 4

  return (
    <div className={cn("relative", depth > 0 && "ml-4 sm:ml-6")}>
      {/* Thread line */}
      {depth > 0 && <div className="absolute left-0 top-0 bottom-0 w-px bg-border -ml-3 sm:-ml-4" />}

      <div className={cn("py-3", depth === 0 && "border-b border-border")}>
        <div className="flex gap-2">
          {/* Collapse button + avatar */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 hover:ring-2 hover:ring-primary/50 transition-all"
            >
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
            </button>
            {!collapsed && (comment.replies?.length ?? 0) > 0 && <div className="flex-1 w-px bg-border" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta line */}
            <div className="flex items-center gap-1.5 text-xs">
              <Link
                href={`/profile/${comment.author?.username}`}
                className="font-medium text-foreground hover:underline"
              >
                {comment.author?.username}
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{timeAgo}</span>
              {collapsed && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <button
                    onClick={() => setCollapsed(false)}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <ChevronDown className="h-3 w-3" />
                    Expand
                  </button>
                </>
              )}
            </div>

            {!collapsed && (
              <>
                {/* Comment content */}
                <p className="text-sm text-foreground mt-1 leading-relaxed">{comment.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 -ml-2">
                  <button
                    onClick={(e) => handleVote("up", e)}
                    className={cn(
                      "p-1 rounded hover:bg-muted transition-colors",
                      vote === "up" ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <ArrowBigUp className={cn("h-4 w-4", vote === "up" && "fill-current")} />
                  </button>
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums min-w-[1.5rem] text-center",
                      vote === "up" && "text-primary",
                      vote === "down" && "text-destructive",
                      !vote && "text-muted-foreground",
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
                    <ArrowBigDown className={cn("h-4 w-4", vote === "down" && "fill-current")} />
                  </button>

                  {depth < maxDepth && (
                    <button
                      onClick={() => onReply(isReplying ? null : comment.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-2"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Reply
                    </button>
                  )}

                  <button
                    onClick={() => setCollapsed(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Collapse
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Reply composer */}
                {isReplying && (
                  <div className="mt-3 bg-muted/30 rounded-lg p-3">
                    <Textarea
                      placeholder={`Reply to ${comment.author?.username}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => onReply(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSubmitReply} disabled={!replyContent.trim()}>
                        Reply
                      </Button>
                    </div>
                  </div>
                )}

                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-0">
                    {comment.replies.map((reply) => (
                      <CommentThread
                        key={reply.id}
                        comment={reply}
                        replyingTo={replyingTo}
                        onReply={onReply}
                        depth={depth + 1}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
