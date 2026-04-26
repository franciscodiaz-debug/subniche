import { redirect } from "next/navigation"

export default function RootPage() {
  // In this hub-and-spoke chat we only focus on the Profile module.
  // Other modules (Home, Market, etc.) live in their own v0 chats.
  redirect("/profile")
}
