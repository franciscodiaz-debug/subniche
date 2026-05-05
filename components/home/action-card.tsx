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
  { icon: React.ElementType; label: string; color: string }
> = {
  message:       { icon: MessageCircle, label: 'Message',      color: 'text-info bg-info/10 border-info/20' },
  offer:         { icon: Repeat2,       label: 'Trade offer',  color: 'text-primary bg-primary/10 border-primary/20' },
  offer_accepted:{ icon: CheckCircle2,  label: 'Accepted',     color: 'text-success bg-success/10 border-success/20' },
  offer_declined:{ icon: XCircle,       label: 'Declined',     color: 'text-destructive bg-destructive/10 border-destructive/20' },
  counter:       { icon: ArrowLeftRight, label: 'Counter',     color: 'text-warning bg-warning/10 border-warning/20' },
  cash_offer:    { icon: DollarSign,    label: 'Cash offer',   color: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
}

export function ActionCard({ avatar, username, actionType, description, timestamp }: ActionCardProps) {
  const config = actionConfig[actionType]
  const Icon = config.icon

  return (
    <div className="flex min-w-[240px] flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      {/* Row 1 — avatar + name + timestamp */}
      <div className="flex items-center gap-2.5">
        <Link href={`/profile/${username}`} className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <Image src={avatar} alt={username} fill sizes="32px" className="object-cover" />
        </Link>
        <Link
          href={`/profile/${username}`}
          className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground hover:underline"
        >
          @{username}
        </Link>
        <span className="shrink-0 text-[10px] text-muted-foreground/60">{timestamp}</span>
      </div>

      {/* Row 2 — description */}
      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{description}</p>

      {/* Row 3 — chip + action */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
            config.color,
          )}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
        <Link
          href="/inbox"
          className="rounded-lg border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
        >
          View
        </Link>
      </div>
    </div>
  )
}
