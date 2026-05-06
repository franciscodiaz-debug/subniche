"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ownProfile } from "@/lib/profile-page-data"
import { ProfileEditView } from "@/components/profile/profile-edit-view"

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    const el = document.getElementById("settings-section")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <ProfileEditView
      profile={ownProfile}
      onBack={() => router.push("/profile")}
      onSave={(_next) => router.push("/profile")}
    />
  )
}
