"use client"

import { useState } from "react"
import { Heart, UserPlus, UserMinus, FolderPlus, FolderMinus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type FollowType = "user" | "collection" | "item"

interface FollowButtonProps {
  type: FollowType
  targetId: string
  targetName: string
  initialFollowing?: boolean
  variant?: "default" | "icon" | "outline"
  size?: "sm" | "default" | "lg"
  className?: string
}

const icons = {
  user: { follow: UserPlus, unfollow: UserMinus },
  collection: { follow: FolderPlus, unfollow: FolderMinus },
  item: { follow: Heart, unfollow: Heart },
}

const labels = {
  user: { follow: "Follow", unfollow: "Unfollow", following: "Following" },
  collection: { follow: "Follow", unfollow: "Unfollow", following: "Following" },
  item: { follow: "Follow", unfollow: "Unfollow", following: "Following" },
}

export function FollowButton({
  type,
  targetId,
  targetName,
  initialFollowing = false,
  variant = "default",
  size = "default",
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleToggleFollow = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const newState = !isFollowing
    setIsFollowing(newState)
    setIsLoading(false)
    
    if (newState) {
      toast.success(`Now following ${targetName}`)
    } else {
      toast.success(`Unfollowed ${targetName}`)
    }
  }

  const Icon = isFollowing ? icons[type].unfollow : icons[type].follow
  const label = isFollowing
    ? isHovered
      ? labels[type].unfollow
      : labels[type].following
    : labels[type].follow

  // Icon-only variant (for item cards, etc.)
  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={cn(
          "h-8 w-8 rounded-full transition-all",
          isFollowing && type === "item" && "text-chart-5",
          className
        )}
        title={label}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : type === "item" ? (
          <Heart className={cn("h-4 w-4", isFollowing && "fill-current")} />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </Button>
    )
  }

  // Outline variant (for profile headers, etc.)
  if (variant === "outline") {
    return (
      <Button
        variant={isFollowing ? "outline" : "default"}
        size={size}
        onClick={handleToggleFollow}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoading}
        className={cn(
          "min-w-[100px] transition-all",
          isFollowing && isHovered && "border-destructive text-destructive hover:bg-destructive/10",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Icon className={cn("h-4 w-4 mr-2", type === "item" && isFollowing && "fill-current")} />
        )}
        {label}
      </Button>
    )
  }

  // Default variant
  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      size={size}
      onClick={handleToggleFollow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={cn(
        "min-w-[100px] transition-all",
        isFollowing && isHovered && "bg-destructive/10 text-destructive hover:bg-destructive/20",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Icon className={cn("h-4 w-4 mr-2", type === "item" && isFollowing && "fill-current")} />
      )}
      {label}
    </Button>
  )
}
