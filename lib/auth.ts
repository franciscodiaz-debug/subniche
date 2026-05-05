import { cookies } from 'next/headers'

export type AuthState = 'logged-out' | 'onboarding' | 'logged-in'

export async function getAuthState(): Promise<AuthState> {
  const cookieStore = await cookies()
  const state = cookieStore.get('subniche_auth')?.value
  if (state === 'logged-in' || state === 'onboarding' || state === 'logged-out') {
    return state as AuthState
  }
  return 'logged-out'
}
