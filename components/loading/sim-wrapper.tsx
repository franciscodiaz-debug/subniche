"use client"

/**
 * Client-side wrapper that swaps a section's content between:
 *   - Loading skeleton (when ?sim-loading=N is present)
 *   - Empty state (when ?sim-empty=1 is present)
 *   - Real content (otherwise)
 *
 * Server sections stay as server components; this wrapper is the only
 * thin client boundary needed to make them previewable in the design
 * system without rewriting their code.
 */

import { useSimulatedLoading } from "@/lib/loading-sim"
import { useEffect, useState } from "react"

function readParam(name: string): string | null {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.search).get(name)
}

interface SimWrapperProps {
  children: React.ReactNode
  skeleton: React.ReactNode
  empty: React.ReactNode
}

export function SimWrapper({ children, skeleton, empty }: SimWrapperProps) {
  const { isLoading } = useSimulatedLoading(null)
  const [showEmpty, setShowEmpty] = useState(false)

  useEffect(() => {
    setShowEmpty(readParam("sim-empty") !== null)
  }, [])

  if (isLoading) return <>{skeleton}</>
  if (showEmpty) return <>{empty}</>
  return <>{children}</>
}
