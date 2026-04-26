"use client"

import { useState } from "react"
import { X, Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EditProfileModalProps {
  profile: Profile
  isOpen: boolean
  onClose: () => void
  onSave: (profile: Profile) => void
  isDemo?: boolean
}

export function EditProfileModal({ profile, isOpen, onClose, onSave, isDemo }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [location, setLocation] = useState(profile.location || "")
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (isDemo) {
      onSave({
        ...profile,
        username,
        bio,
        location,
      })
      onClose()
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        bio,
        location,
      })
      .eq("id", profile.id)

    if (!error) {
      onSave({
        ...profile,
        username,
        bio,
        location,
      })
      onClose()
    }

    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-card">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself and your collection..."
              className="mt-1 min-h-[100px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
