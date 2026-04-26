"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"

const savedSearches = [
  { id: "1", query: "Telecaster under $1,200", newCount: 4 },
  { id: "2", query: "Boss delay pedals", newCount: 2 },
  { id: "3", query: "Fender tube amps", newCount: 7 },
]

export function SavedSearchesModule() {
  const [searches] = useState(savedSearches)
  const isEmpty = searches.length === 0

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Saved search updates</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {searches.map((search) => (
              <div key={search.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{search.query}</span>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {search.newCount} new
                  </Badge>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 text-xs bg-transparent">
                  View results
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-4">
      <h4 className="text-sm font-medium text-foreground mb-1">Get alerts you actually want</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Save a search and we'll surface only high-signal updates here.
      </p>
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Create a saved search
      </Button>
    </div>
  )
}
