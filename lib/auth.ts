export type AuthState = 'logged-out' | 'onboarding' | 'logged-in'

// Replace this with a real session check (e.g. next-auth, Supabase, Clerk).
// Toggle the return value to preview each home state.
export function getAuthState(): AuthState {
  return 'logged-in'
}
