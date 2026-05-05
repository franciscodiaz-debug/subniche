"use client"

import Link from "next/link"
import {
  Calendar,
  Package,
  FolderOpen,
  Repeat2,
  Star,
  Clock,
  MessageSquare,
  Shield,
  Mail,
  Phone,
  ShieldCheck,
  Check,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ConversationParticipant } from "@/lib/inbox-types"

interface UserProfilePanelProps {
  participant: ConversationParticipant
}

export function UserProfilePanel({ participant }: UserProfilePanelProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long" })

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-xl">
            {participant.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5 pt-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/profile/${participant.id}`}
              className="text-lg font-bold leading-tight text-foreground hover:underline"
            >
              {participant.username}
            </Link>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{participant.location}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Package className="h-4 w-4" />
          {participant.stats.items} items
        </span>
        <span className="flex items-center gap-1.5">
          <FolderOpen className="h-4 w-4" />
          {participant.stats.collections} collections
        </span>
      </div>

      {/* Verification & Linked Accounts */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Joined {formatDate(participant.joined_at)}
        </p>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4" />
          Verification
        </h3>
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-4">
            <span className="flex w-24 items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              Email
            </span>
            {participant.verification.email ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <span className="text-xs text-muted-foreground">Not verified</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex w-24 items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              Phone
            </span>
            {participant.verification.phone ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <span className="text-xs text-muted-foreground">Not verified</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex w-24 items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              ID Verified
            </span>
            {participant.verification.id ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <span className="text-xs text-muted-foreground">Not verified</span>
            )}
          </div>
        </div>

        {participant.linked_accounts.length > 0 && (
          <>
            <h3 className="mb-3 mt-4 text-sm font-semibold">Linked Accounts</h3>
            <div className="space-y-0">
              {participant.linked_accounts
                .filter((a) => a.verified)
                .map((account) => (
                  <a
                    key={account.platform}
                    href="#"
                    className="flex items-center justify-between rounded-lg px-2 py-0.5 transition-colors hover:bg-secondary/50"
                  >
                    <span className="flex items-center gap-2 text-sm capitalize">
                      {account.platform}
                    </span>
                    <span className="text-xs text-muted-foreground">@{account.username}</span>
                  </a>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Feedback & Response Stats */}
      <div className="rounded-lg border border-border bg-card p-4">
        {participant.feedback_score !== undefined && (
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 fill-current text-primary" />
            <span className="text-2xl font-bold">{participant.feedback_score}%</span>
            <span className="text-sm text-muted-foreground">Positive Feedback</span>
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat2 className="h-4 w-4" />
            Transactions
          </span>
          <span className="text-sm font-medium">{participant.stats.transactions}</span>
        </div>
        <h3 className="mb-3 text-sm font-semibold">Response Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              Response Rate
            </span>
            <span className="text-sm font-medium">{participant.stats.response_rate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Avg. Response Time
            </span>
            <span className="text-sm font-medium">{participant.stats.avg_response_time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
