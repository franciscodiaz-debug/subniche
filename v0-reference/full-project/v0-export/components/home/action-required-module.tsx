"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const actionItems = [
  {
    id: "1",
    type: "offer",
    avatar: "/person-avatar-1.png",
    label: "New offer on 'MIJ Fender Jazzmaster'",
    timestamp: "12m ago",
  },
  {
    id: "2",
    type: "counter",
    avatar: "/diverse-person-avatar-2.png",
    label: "Counter offer from @traderguy",
    timestamp: "1h ago",
  },
  {
    id: "3",
    type: "trade",
    avatar: "/person-avatar-3.png",
    label: "Trade proposal on your 'Boss DD-500'",
    timestamp: "3h ago",
  },
]

export function ActionRequiredModule() {
  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Action required</CardTitle>
        <Link href="/messages" className="text-sm text-primary hover:underline">
          View inbox
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {actionItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Image
              src={item.avatar || "/placeholder.svg"}
              alt=""
              width={40}
              height={40}
              className="rounded-full object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.timestamp}</p>
            </div>
            <Button size="sm" className="shrink-0">
              Respond
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
