"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useActionState } from "react"

import {
  loginAction,
  loginWithGoogleAction,
  type AuthState,
} from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

const initialState: AuthState = {}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  )
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="space-y-4">
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirect" value={redirectTo} />

      {/* Top-level error */}
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
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        {state.fieldErrors?.email && (
          <p
            id="email-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            aria-invalid={!!state.fieldErrors?.password}
            aria-describedby={
              state.fieldErrors?.password ? "password-error" : undefined
            }
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {state.fieldErrors?.password && (
          <p
            id="password-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {state.fieldErrors.password}
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
            Signing in…
          </>
        ) : (
          "Sign in"
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
      action={loginWithGoogleAction}
      redirectTo={redirectTo}
      label="Continue with Google"
    />
    </div>
  )
}
