"use client"

import type React from "react"

import { useState } from "react"
import { Globe, Lock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CreateCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Privacy = "public" | "private" | "invite_only"
type Category = "geographic" | "interest" | "brand" | "organization"

const privacyOptions: { value: Privacy; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can view and join",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: "private",
    label: "Private",
    description: "Visible but requires approval to join",
    icon: <Lock className="h-4 w-4" />,
  },
  {
    value: "invite_only",
    label: "Invite Only",
    description: "Only visible to invited members",
    icon: <Users className="h-4 w-4" />,
  },
]

const categoryOptions: { value: Category; label: string }[] = [
  { value: "geographic", label: "Local / Geographic" },
  { value: "interest", label: "Interest / Hobby" },
  { value: "brand", label: "Brand" },
  { value: "organization", label: "Organization" },
]

const iconOptions = ["🏆", "🌳", "⛳", "💿", "🥇", "🔴", "🌱", "🎯", "🌟", "🔥", "💎", "🎸"]

export function CreateCommunityDialog({ open, onOpenChange }: CreateCommunityDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("🌟")
  const [category, setCategory] = useState<Category>("interest")
  const [privacy, setPrivacy] = useState<Privacy>("public")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)

    // In production, this would call an API to create the community
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Reset form and close
    setName("")
    setDescription("")
    setIcon("🌟")
    setCategory("interest")
    setPrivacy("public")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Community</DialogTitle>
          <DialogDescription>Start a new community around a shared interest or location</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Icon Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Icon</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center text-3xl">
                {icon}
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {iconOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors",
                      icon === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-muted/80",
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="community-name">Name</Label>
            <Input
              id="community-name"
              placeholder="e.g., Austin Disc Golf"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
            {slug && (
              <p className="text-xs text-muted-foreground mt-1">
                URL: /communities/<span className="text-primary">{slug}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="community-description">Description</Label>
            <Textarea
              id="community-description"
              placeholder="What is this community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCategory(option.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm text-left transition-colors border",
                    category === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Privacy</Label>
            <div className="space-y-2">
              {privacyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPrivacy(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors border",
                    privacy === option.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      privacy === option.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", privacy === option.value && "text-primary")}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
