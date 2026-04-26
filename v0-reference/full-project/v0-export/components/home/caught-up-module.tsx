"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export function CaughtUpModule() {
  return (
    <Card className="bg-card border-primary/20">
      <CardContent className="py-8 text-center">
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">You're caught up</h3>
        <p className="text-sm text-muted-foreground mb-4">No new matches or updates right now.</p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/discover">Browse listings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/create-listing">Add an item</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
