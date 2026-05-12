'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubnicheLogo } from '@/components/app-shell/subniche-logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!email) return
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="px-8 py-6">
          <Link href="/" aria-label="SubNiche home">
            <SubnicheLogo width={117} height={36} light priority />
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-start px-8 pt-16 pb-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <Link
              href="/login"
              className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>

            {!submitted ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your email and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-card"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>

                  <Button className="w-full gap-2" onClick={handleSubmit} disabled={!email}>
                    <Mail className="h-4 w-4" />
                    Send reset link
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Mail className="h-9 w-9 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
                  <p className="mt-2 text-sm text-muted-foreground">We sent a password reset link to</p>
                  <p className="mt-0.5 font-semibold text-foreground">{email}</p>
                </div>
                <p className="text-sm text-muted-foreground">The link will expire in 1 hour.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Try a different email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative panel */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="https://picsum.photos/seed/subniche-login/800/1200"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="text-xl font-semibold leading-snug text-white">
            &ldquo;The community for people who take their gear seriously.&rdquo;
          </p>
          <p className="mt-3 text-sm text-white/60">SubNiche — guitars &amp; beyond</p>
        </div>
      </div>
    </div>
  )
}
