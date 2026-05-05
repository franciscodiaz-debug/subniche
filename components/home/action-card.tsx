import Image from 'next/image'
import { MessageCircle, Repeat2, CheckCircle2, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActionCardProps {
  avatar: string
  username: string
  actionType: 'trade' | 'message' | 'approved' | 'counter'
  itemTitle: string
  description: string
  timestamp: string
}

const actionConfig = {
  trade: { icon: Repeat2, label: 'Trade offer', color: 'text-primary bg-primary/10' },
  message: { icon: MessageCircle, label: 'Message', color: 'text-info bg-info/10' },
  approved: { icon: CheckCircle2, label: 'Approved', color: 'text-success bg-success/10' },
  counter: { icon: ArrowLeftRight, label: 'Counter', color: 'text-warning bg-warning/10' },
}

export function ActionCard({ avatar, username, actionType, description, timestamp }: ActionCardProps) {
  const config = actionConfig[actionType]
  const Icon = config.icon

  return (
    <div className="flex min-w-[260px] flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
            <Image src={avatar} alt={username} fill sizes="32px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{username}</p>
          </div>
        </div>
        <span
          className={cn(
            'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
            config.color,
          )}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60">{timestamp}</span>
        <button
          type="button"
          className="rounded-lg border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
        >
          View
        </button>
      </div>
    </div>
  )
}
