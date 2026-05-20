"use client"

/**
 * Loading simulation helpers — let designers preview loading + empty
 * states without backend latency.
 *
 * Two toggles, both off by default:
 *
 *   ?sim-loading=1   → forces components to stay in loading state
 *   ?sim-empty=1     → forces components to render their empty state
 *
 * Set ?sim-loading=2000 to control the delay (ms) before data resolves.
 * Default delay when sim-loading=1 is 1500ms.
 *
 * The flag is read once per render via a tiny hook. Pure URL-param
 * driven, no localStorage — so it doesn't leak between sessions.
 */

import { useEffect, useState } from "react"

const DEFAULT_DELAY_MS = 1500

function readSearchParam(name: string): string | null {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.search).get(name)
}

export function useSimulatedLoading<T>(data: T): { data: T; isLoading: boolean } {
  const [resolved, setResolved] = useState(() => {
    if (typeof window === "undefined") return true
    return readSearchParam("sim-loading") === null
  })

  useEffect(() => {
    const raw = readSearchParam("sim-loading")
    if (raw === null) {
      setResolved(true)
      return
    }
    const parsed = Number.parseInt(raw, 10)
    const delay = Number.isFinite(parsed) && parsed > 1 ? parsed : DEFAULT_DELAY_MS
    setResolved(false)
    const t = window.setTimeout(() => setResolved(true), delay)
    return () => window.clearTimeout(t)
  }, [])

  return { data, isLoading: !resolved }
}

export function useSimulatedEmpty<T>(data: T, empty: T): T {
  const [forceEmpty, setForceEmpty] = useState(false)

  useEffect(() => {
    setForceEmpty(readSearchParam("sim-empty") !== null)
  }, [])

  return forceEmpty ? empty : data
}
