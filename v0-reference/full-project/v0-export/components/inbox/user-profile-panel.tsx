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
  ExternalLink,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ConversationParticipant } from "@/lib/types/inbox"

interface UserProfilePanelProps {
  participant: ConversationParticipant
}

export function UserProfilePanel({ participant }: UserProfilePanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="p-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-xl">{participant.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 my-0 pt-0 gap-0.5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold leading-tight text-foreground">{participant.username}</h2>
            <Link
              href={`/profile/${participant.id}`}
              className="text-muted-foreground hover:text-yellow-400 transition-colors"
              title="View full profile"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{participant.location}</p>
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
      <div className="bg-card border border-border rounded-lg p-4 py-4">
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Joined {formatDate(participant.joined_at)}
        </p>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Verification
        </h3>
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2 w-24">
              <Mail className="h-3 w-3" />
              Email
            </span>
            {participant.verification.email ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Not verified</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2 w-24">
              <Phone className="h-3 w-3" />
              Phone
            </span>
            {participant.verification.phone ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Not verified</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2 w-24">
              <ShieldCheck className="h-3 w-3" />
              ID Verified
            </span>
            {participant.verification.id ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Not verified</span>
            )}
          </div>
        </div>

        {participant.linked_accounts.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mb-3 mt-4">Linked Accounts</h3>
            <div className="space-y-0">
              {participant.linked_accounts
                .filter((a) => a.verified)
                .map((account) => (
                  <a
                    key={account.platform}
                    href="#"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors py-0.5"
                  >
                    <span className="text-sm capitalize flex items-center gap-2">
                      {account.platform === "reddit" && (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                        </svg>
                      )}
                      {account.platform === "ebay" && (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5.939 13.315c0 1.449.738 2.64 2.558 2.64 1.252 0 2.022-.547 2.402-1.25h.035v1.099h1.611v-4.522c0-2.026-1.15-2.791-3.01-2.791-1.252 0-2.596.481-3.053 1.82l1.575.336c.215-.575.749-.975 1.5-.975.856 0 1.377.42 1.377 1.162v.246l-1.861.113c-1.752.105-3.134.687-3.134 2.122zm2.68.89c-.82 0-1.232-.388-1.232-.89 0-.582.508-.853 1.33-.904l1.78-.106v.439c0 .925-.785 1.461-1.878 1.461z" />
                        </svg>
                      )}
                      {account.platform === "reverb" && (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      )}
                      {account.platform === "facebook" && (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
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
      <div className="bg-card border border-border rounded-lg p-4">
        {participant.feedback_score !== undefined && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-amber-500 fill-current" />
              <span className="text-2xl font-bold">{participant.feedback_score}%</span>
              <span className="text-sm text-muted-foreground">Positive Feedback</span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Repeat2 className="h-4 w-4" />
            Transactions
          </span>
          <span className="text-sm font-medium">{participant.stats.transactions}</span>
        </div>
        <h3 className="text-sm font-semibold mb-3">Response Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Response Rate
            </span>
            <span className="text-sm font-medium">{participant.stats.response_rate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
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
