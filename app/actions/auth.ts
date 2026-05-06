'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const cookieStore = await cookies()
  cookieStore.set('subniche_auth', 'logged-in', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  const redirectTo = formData.get('redirect') as string | null
  redirect(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/')
}

export async function signupAction(_formData: FormData) {
  const cookieStore = await cookies()
  cookieStore.set('subniche_auth', 'onboarding', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  redirect('/')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('subniche_auth')
  redirect('/')
}
