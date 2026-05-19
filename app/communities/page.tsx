import { redirect } from "next/navigation"

/**
 * Communities is post-MVP. Any old bookmark or external link to
 * /communities bounces back to home instead of showing a dead-end
 * placeholder.
 */
export default function CommunitiesPage() {
  redirect("/")
}
