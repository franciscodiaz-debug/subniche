"use client"

/**
 * DevInfoDrawer
 *
 * Shared "Dev Info" drawer per the prototyping playbook: every prototype
 * gets a tiny toggleable panel at the bottom-right showing last-saved
 * timestamp, a change log, and a link back to the Master Index + this
 * chat. Keep the copy short and surgical — this is a handoff aid, not a
 * marketing surface. Individual prototypes pass their own metadata so a
 * single component serves every module.
 */

import { useState } from "react"
import { ChevronUp, ExternalLink, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface DevInfoDrawerProps {
  module: string
  version: string
  status: "LIVE" | "DEV" | "ARCHIVE"
  lastSaved: string
  changeLog: string[]
  masterIndexHref?: string
  chatHref?: string
}

const statusStyles: Record<DevInfoDrawerProps["status"], string> = {
  LIVE: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  DEV: "bg-primary/15 text-primary border-primary/30",
  ARCHIVE: "bg-muted text-muted-foreground border-border",
}

export function DevInfoDrawer({
  module,
  version,
  status,
  lastSaved,
  changeLog,
  masterIndexHref,
  chatHref,
}: DevInfoDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[90] flex flex-col items-end gap-2">
      {open ? (
        <div className="pointer-events-auto w-80 overflow-hidden rounded-lg border border-border bg-card/95 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold tracking-wide text-foreground">
                Dev Info
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close dev info"
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3 px-3 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider",
                  statusStyles[status],
                )}
              >
                {status}
              </span>
              <span className="truncate font-medium text-foreground">
                {module}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{version}</span>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Last saved
              </p>
              <p className="mt-0.5 text-foreground">{lastSaved}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Change log
              </p>
              <ul className="mt-1 space-y-1 text-foreground">
                {changeLog.length === 0 ? (
                  <li className="text-muted-foreground">No changes yet.</li>
                ) : (
                  changeLog.map((entry, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="text-muted-foreground">—</span> {entry}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {(masterIndexHref || chatHref) && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
                {masterIndexHref ? (
                  <a
                    href={masterIndexHref}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Master Index
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
                {chatHref ? (
                  <a
                    href={chatHref}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    Open v0 chat
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide dev info" : "Show dev info"}
        className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-card hover:text-foreground"
      >
        <Info className="h-3.5 w-3.5" />
        <span>Dev info</span>
        <ChevronUp
          className={cn(
            "h-3 w-3 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
    </div>
  )
}
