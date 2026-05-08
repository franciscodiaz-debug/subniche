'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface AuthState {
  error?: string
  fieldErrors?: {
    email?: string
    password?: string
    name?: string
  }
}

export interface SignupState extends AuthState {
  /** Set when the magic link was sent successfully. */
  sent?: { email: string; niche?: string }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NICHE_SLUG_RE = /^[a-z0-9-]{1,64}$/
const MAX_REDIRECT_LENGTH = 200

function safeRedirectTo(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return '/'
  if (value.length > MAX_REDIRECT_LENGTH) return '/'
  // Must be a same-origin relative path (no protocol, no //)
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

function safeNiche(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined
  return NICHE_SLUG_RE.test(value) ? value : undefined
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const fieldErrors: AuthState['fieldErrors'] = {}
  if (!email) fieldErrors.email = 'Email is required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'
  if (!password) fieldErrors.password = 'Password is required'
  else if (password.length < 6) fieldErrors.password = 'At least 6 characters'

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  // Mock auth — in a real app, verify credentials here.
  const cookieStore = await cookies()
  cookieStore.set('subniche_auth', 'logged-in', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  const redirectTo = safeRedirectTo(formData.get('redirect'))
  redirect(redirectTo)
}

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get('email') ?? '').trim()

  const fieldErrors: SignupState['fieldErrors'] = {}
  if (!email) fieldErrors.email = 'Email is required'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email'

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const niche = safeNiche(formData.get('niche'))

  // In a real app: generate token, persist, send email with verification link.
  // Here we just acknowledge the request so the UI flips to the "Check your
  // email" confirmation screen. The user's auth cookie is set on first
  // verification (see /verify route).
  return { sent: { email, niche } }
}

export async function verifyEmailAction(token: string, niche?: string) {
  // Mock token validation. In a real app: lookup token in DB, check expiry,
  // mark account as verified, then set the cookie + redirect.
  if (!token || token.trim().length === 0) {
    throw new Error('Missing token')
  }
  const cookieStore = await cookies()
  cookieStore.set('subniche_auth', 'onboarding', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  // If the user signed up from a niche home, drop them straight into that
  // niche; otherwise send them to the niche selector first.
  const safe = niche && NICHE_SLUG_RE.test(niche) ? niche : null
  redirect(safe ? `/n/${safe}` : '/find-niche')
}

export async function loginWithGoogleAction(formData: FormData) {
  // Mock OAuth flow — in a real app this would redirect to Google's
  // consent screen and handle the callback.
  const cookieStore = await cookies()
  cookieStore.set('subniche_auth', 'logged-in', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  const redirectTo = safeRedirectTo(formData.get('redirect'))
  redirect(redirectTo)
}

export async function signupWithGoogleAction(formData: FormData) {
  const cookieStore = await cookies()
  cookieStore.set('subniche_auth', 'onboarding', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  const niche = safeNiche(formData.get('niche'))
  redirect(niche ? `/n/${niche}` : '/find-niche')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('subniche_auth')
  redirect('/')
}
