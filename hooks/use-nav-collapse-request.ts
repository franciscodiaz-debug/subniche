"use client"

import { useEffect, useSyncExternalStore } from "react"

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

export function useIsNavCollapseRequested() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

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
