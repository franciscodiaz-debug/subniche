import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftRight, CheckCircle2, DollarSign, MessageCircle, Repeat2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ActionType =
  | 'message'
  | 'offer'
  | 'offer_accepted'
  | 'offer_declined'
  | 'counter'
  | 'cash_offer'

export interface ActionCardProps {
  avatar: string
  username: string
  actionType: ActionType
  itemTitle: string
  description: string
  timestamp: string
}

const actionConfig: Record<
  ActionType,
  { icon: React.ElementType; title: string; color: string }
> = {
  message:        { icon: MessageCircle,  title: 'New Message',       color: 'text-info bg-info/10 border-info/20' },
  offer:          { icon: Repeat2,        title: 'New Trade Offer',   color: 'text-primary bg-primary/10 border-primary/20' },
  offer_accepted: { icon: CheckCircle2,   title: 'Accepted Offer',    color: 'text-success bg-success/10 border-success/20' },
  offer_declined: { icon: XCircle,        title: 'Declined Offer',    color: 'text-destructive bg-destructive/10 border-destructive/20' },
  counter:        { icon: ArrowLeftRight, title: 'New Counter Offer', color: 'text-warning bg-warning/10 border-warning/20' },
  cash_offer:     { icon: DollarSign,     title: 'New Cash Offer',    color: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
}

export function ActionCard({ avatar, username, actionType, description, timestamp }: ActionCardProps) {
  const config = actionConfig[actionType]
  const Icon = config.icon

  return (
    <Link
      href="/inbox"
      className="flex min-w-[240px] flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
    >
      {/* Row 1 — avatar + name/timestamp + circular icon badge */}
      <div className="flex items-center gap-2.5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <Image src={avatar} alt={username} fill sizes="40px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{username}</p>
          <p className="text-[11px] text-muted-foreground">{timestamp}</p>
        </div>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border', config.color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Row 2 — bold action title */}
      <p className="text-sm font-bold text-foreground">{config.title}</p>

      {/* Row 3 — description */}
      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{description}</p>
    </Link>
  )
}
