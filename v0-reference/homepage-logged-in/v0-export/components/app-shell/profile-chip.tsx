"use client"

import { currentUser } from "../../lib/current-user"
import { NicheSwitcher } from "./niche-switcher"

/**
 * Top-right header chip. Shows the signed-in user and acts as a niche switcher
 * (mirroring the lower-left sidebar switcher). Mobile collapses to avatar-only.
 */
export function ProfileChip() {
  return (
    <NicheSwitcher
      variant="chip"
      user={{
        avatarUrl: currentUser.avatarUrl,
        username: currentUser.username,
        displayName: currentUser.displayName,
      }}
    />
  )
}
