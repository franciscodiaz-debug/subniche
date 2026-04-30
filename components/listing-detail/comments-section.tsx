"use client"

/**
 * Buyer questions / comments thread.
 *
 * Replaces the old "Recent reviews" sidebar block. Rules:
 *   - Non-owner viewers see a textarea composer at the top.
 *   - Owner sees a coaching note ("respond promptly…") instead of a composer,
 *     but can reply inline to any comment.
 *   - Owner replies are distinguished with a subtle gold left border and
 *     a "Seller" badge so buyers can scan the thread quickly.
 *   - Only one level of reply nesting — we deliberately keep the thread flat
 *     to avoid a reddit-style depth explosion on a product page.
 *
 * This is a prototype component: posted comments persist in React state
 * only. No network, no optimistic reconciliation.
 */

import { useMemo, useState } from "react"
import Image from "next/image"
import { MessageCircle, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/current-user"
import type { MockComment } from "@/lib/mock-listing-detail"

interface CommentsSectionProps {
  comments: MockComment[]
  viewerIsOwner: boolean
  sellerDisplayName: string
  sellerAvatarUrl: string
}

export function CommentsSection({
  comments: initialComments,
  viewerIsOwner,
  sellerDisplayName,
  sellerAvatarUrl,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<MockComment[]>(initialComments)
  const [draft, setDraft] = useState("")
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  const totalCount = useMemo(
    () =>
      comments.reduce(
        (sum, c) => sum + 1 + (c.replies?.length ?? 0),
        0,
      ),
    [comments],
  )

  const handlePost = () => {
    const body = draft.trim()
    if (!body) return
    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        authorName: currentUser.displayName,
        authorAvatarUrl: currentUser.avatarUrl,
        timestamp: "just now",
        body,
      },
      ...prev,
    ])
    setDraft("")
  }

  const handleReply = (parentId: string, body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [
                ...(c.replies ?? []),
                {
                  id: `${parentId}-r-${Date.now()}`,
                  authorName: sellerDisplayName,
                  authorAvatarUrl: sellerAvatarUrl,
                  isOwner: true,
                  timestamp: "just now",
                  body: trimmed,
                },
              ],
            }
          : c,
      ),
    )
    setActiveReplyId(null)
  }

  return (
    <section aria-label="Comments on this listing" className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">
          Comments
          <span className="ml-1.5 text-muted-foreground">({totalCount})</span>
        </h2>
      </div>

      {viewerIsOwner ? (
        <p className="rounded-card border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
          Buyers can ask questions here — respond promptly to build trust.
        </p>
      ) : (
        <Composer
          value={draft}
          onChange={setDraft}
          onPost={handlePost}
          placeholder="Ask a question about this listing…"
        />
      )}

      {comments.length === 0 ? (
        <p className="rounded-card border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No questions yet. Be the first to ask.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-card border border-border bg-card p-4">
              <CommentBody comment={comment} />

              {comment.replies && comment.replies.length > 0 ? (
                <ul className="mt-3 space-y-3 border-t border-border pt-3">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentBody comment={reply} compact />
                    </li>
                  ))}
                </ul>
              ) : null}

              {viewerIsOwner ? (
                activeReplyId === comment.id ? (
                  <div className="mt-3">
                    <ReplyComposer
                      onPost={(body) => handleReply(comment.id, body)}
                      onCancel={() => setActiveReplyId(null)}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveReplyId(comment.id)}
                    className="mt-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Reply as seller
                  </button>
                )
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Comment row                                                                */
/* -------------------------------------------------------------------------- */

function CommentBody({
  comment,
  compact = false,
}: {
  comment: MockComment
  compact?: boolean
}) {
  const size = compact ? "h-8 w-8" : "h-9 w-9"
  return (
    <div
      className={cn(
        "flex gap-3",
        comment.isOwner && "border-l-2 border-primary pl-3",
      )}
    >
      <div className={cn("relative flex-shrink-0 overflow-hidden rounded-full bg-muted", size)}>
        <Image
          src={comment.authorAvatarUrl || "/placeholder.svg"}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">
            {comment.authorName}
          </span>
          {comment.isOwner ? (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Seller
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {comment.body}
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Composers                                                                  */
/* -------------------------------------------------------------------------- */

function Composer({
  value,
  onChange,
  onPost,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onPost: () => void
  placeholder?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-border bg-card p-3">
      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={currentUser.avatarUrl || "/placeholder.svg"}
          alt=""
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="min-h-[72px] resize-none text-sm"
        />
        <div className="flex items-center justify-end">
          <Button
            type="button"
            onClick={onPost}
            disabled={value.trim().length === 0}
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-3.5 w-3.5" />
            Post
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReplyComposer({
  onPost,
  onCancel,
}: {
  onPost: (body: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState("")
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background/40 p-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Reply as seller…"
        rows={2}
        className="min-h-[60px] resize-none text-sm"
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onPost(value)}
          disabled={value.trim().length === 0}
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-3.5 w-3.5" />
          Reply
        </Button>
      </div>
    </div>
  )
}
