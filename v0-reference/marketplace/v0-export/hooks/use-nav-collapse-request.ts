"use client"

import { useEffect, useSyncExternalStore } from "react"

// Module-level set of "requesters" that want the main nav sidebar
// to collapse to icon-only width. The nav is collapsed if at least
// one requester is active.
const requesters = new Set<string>()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): boolean {
  return requesters.size > 0
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Subscribe to whether any consumer currently requests the main nav
 * sidebar to collapse. Read-only.
 */
export function useIsNavCollapseRequested() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Imperatively request/release a nav-collapse for a given key.
 * When `active` is true, the key is added; when false, it's removed.
 * The key lets multiple independent UIs (filters, compare, etc.)
 * participate without stepping on each other.
 */
export function useRequestNavCollapse(key: string, active: boolean) {
  useEffect(() => {
    if (active) {
      requesters.add(key)
      emit()
      return () => {
        requesters.delete(key)
        emit()
      }
    }
    return undefined
  }, [key, active])
}
