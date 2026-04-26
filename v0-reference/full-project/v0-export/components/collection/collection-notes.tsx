"use client"

import { useState, useEffect, useRef } from "react"
import { StickyNote, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Collection } from "@/lib/types"

interface CollectionNotesProps {
  collection: Collection
  onUpdate: (collection: Collection) => void
  isDemo?: boolean
}

export function CollectionNotes({ collection, onUpdate, isDemo }: CollectionNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(collection.notes || "")
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setNotes(collection.notes || "")
  }, [collection.notes])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditing])

  const handleSave = async () => {
    if (isDemo) {
      onUpdate({ ...collection, notes })
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    const { error } = await supabase
      .from("collections")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", collection.id)

    if (!error) {
      onUpdate({ ...collection, notes })
      setIsEditing(false)
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setNotes(collection.notes || "")
    setIsEditing(false)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-foreground">Collection Notes</h3>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={notes ? "Edit notes" : "Add notes"}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this collection... (e.g., acquisition history, special items, goals)"
            className="min-h-[120px] bg-background border-border resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
              <Check className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ) : notes ? (
        <p className="text-muted-foreground whitespace-pre-wrap">{notes}</p>
      ) : (
        <p className="text-muted-foreground/60 italic">
          No notes yet. Add notes to record important details about this collection.
        </p>
      )}
    </div>
  )
}
