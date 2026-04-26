"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, User, Camera } from "lucide-react"

// Simulated: randomly pick one suggestion
const suggestions = [
  {
    id: "trade-prefs",
    icon: Settings,
    title: "Set trade preferences for faster matches",
    cta: "Set preferences",
  },
  {
    id: "profile",
    icon: User,
    title: "Complete your profile to increase trust",
    cta: "Complete profile",
  },
  {
    id: "photos",
    icon: Camera,
    title: "Add better photos to boost responses",
    cta: "Improve photos",
  },
]

export function SuggestedNextStepModule() {
  // Pick first suggestion for demo
  const suggestion = suggestions[0]
  const Icon = suggestion.icon

  return (
    <Card className="bg-card border-dashed">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{suggestion.title}</p>
            <Button size="sm" variant="link" className="px-0 h-auto text-primary mt-1">
              {suggestion.cta}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
