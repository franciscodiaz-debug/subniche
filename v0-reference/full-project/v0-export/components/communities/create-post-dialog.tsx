"use client"

import type React from "react"

import { useState } from "react"
import { ImageIcon, HelpCircle, MessageCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CommunityPostType } from "@/lib/types"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  communityId: string
  communityName: string
}

const postTypes: { value: CommunityPostType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "discussion",
    label: "Discussion",
    icon: <MessageCircle className="h-5 w-5" />,
    description: "Start a conversation",
  },
  {
    value: "question",
    label: "Question",
    icon: <HelpCircle className="h-5 w-5" />,
    description: "Ask the community",
  },
  {
    value: "show_and_tell",
    label: "Show & Tell",
    icon: <Sparkles className="h-5 w-5" />,
    description: "Share something cool",
  },
]

export function CreatePostDialog({ open, onOpenChange, communityId, communityName }: CreatePostDialogProps) {
  const [postType, setPostType] = useState<CommunityPostType>("discussion")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)

    // In production, this would call an API to create the post
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Reset form and close
    setTitle("")
    setContent("")
    setPostType("discussion")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Post in {communityName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {postTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setPostType(type.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                  postType === type.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <Input
              placeholder={
                postType === "question"
                  ? "What's your question?"
                  : postType === "show_and_tell"
                    ? "What are you sharing?"
                    : "Post title"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          {/* Content */}
          <div>
            <Textarea
              placeholder={
                postType === "question"
                  ? "Add more details about your question..."
                  : postType === "show_and_tell"
                    ? "Tell us about what you're sharing..."
                    : "What's on your mind?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Image Upload (placeholder) */}
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ImageIcon className="h-5 w-5" />
            Add images
          </button>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
