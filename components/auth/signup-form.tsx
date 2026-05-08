"use client"

import * as React from "react"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { useActionState } from "react"

import {
  signupAction,
  signupWithGoogleAction,
  type SignupState,
} from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

const initialState: SignupState = {}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  )

  // Confirmation view — magic link sent
  if (state.sent) {
    return <SentConfirmation email={state.sent.email} />
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" noValidate>
        {state.error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            {state.error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            aria-invalid={!!state.fieldErrors?.email}
            aria-describedby={
              state.fieldErrors?.email
                ? "email-error"
                : "email-helper"
            }
          />
          {state.fieldErrors?.email ? (
            <p
              id="email-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {state.fieldErrors.email}
            </p>
          ) : (
            <p id="email-helper" className="text-xs text-muted-foreground">
              We&apos;ll send you a link to create your account.
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2 h-11"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending link…
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send link
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton
        action={signupWithGoogleAction}
        label="Continue with Google"
      />
    </div>
  )
}

function SentConfirmation({ email }: { email: string }) {
  // Reload to reset the action state and return to the form.
  const handleReset = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Mail className="h-7 w-7" />
      </div>

      <h2 className="text-2xl font-bold text-foreground">Check your email</h2>

      <p className="mt-3 text-sm text-muted-foreground">We sent a link to</p>
      <p className="mt-1 text-base font-semibold text-foreground">{email}</p>

      <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Click the link in your email to sign in. The link will expire in 1 hour.
      </p>

      <button
        type="button"
        onClick={handleReset}
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Use a different email
      </button>
    </div>
  )
}
