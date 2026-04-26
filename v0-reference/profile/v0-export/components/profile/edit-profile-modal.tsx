"use client"

import { useState } from "react"
import { Camera } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ProfileSummaryReference } from "@/lib/profile-page-types"

interface EditProfileModalProps {
  open: boolean
  profile: ProfileSummaryReference
  onOpenChange: (open: boolean) => void
  onSave: (next: ProfileSummaryReference) => void
}

export function EditProfileModal({ open, profile, onOpenChange, onSave }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username)
  const [location, setLocation] = useState(profile.location)
  const [bio, setBio] = useState(profile.bio)

  const avatarLabel = (username.slice(0, 2) || profile.avatarLabel).toUpperCase()

  const handleSave = () => {
    onSave({
      ...profile,
      username,
      location,
      bio,
      avatarLabel,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-card">
              {profile.avatarUrl ? (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={`${profile.username} avatar`}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-secondary text-2xl font-semibold text-foreground">
                {avatarLabel}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
              aria-label="Change avatar"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="bg-card"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="bg-card"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={5}
              className="bg-card"
            />
          </div>
        </div>

        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
