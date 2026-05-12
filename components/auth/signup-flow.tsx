'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Mail, Search, Camera,
  Guitar, Bike, Watch, LayoutGrid, Sparkles, X, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubnicheLogo } from '@/components/app-shell/subniche-logo'
import { cn } from '@/lib/utils'

// ─── Niche data (4 niches) ────────────────────────────────────────────────────

const NICHES = [
  { id: 'guitars',     label: 'Guitars',     description: 'Electric, acoustic, bass, and beyond',  icon: Guitar,     available: true },
  { id: 'motorcycles', label: 'Motorcycles', description: 'Bikes, gear, and powersports',           icon: Bike,       available: false },
  { id: 'watches',     label: 'Watches',     description: 'Horology, vintage timepieces, and more', icon: Watch,      available: false },
  { id: 'collectors',  label: 'Collectors',  description: 'Cards, coins, memorabilia, and more',    icon: LayoutGrid, available: false },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'email' | 'confirm-email' | 'password' | 'niche' | 'profile' | 'onboarding'

interface State {
  email: string
  niche: string
  displayName: string
  username: string
  password: string
  avatarPreview: string | null
  bio: string
  zipCode: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeUsername(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}

const ADJECTIVES = ['vintage', 'analog', 'golden', 'silent', 'rare', 'classic', 'electric', 'heavy', 'bright', 'solid']
const NOUNS      = ['signal', 'tone', 'string', 'wave', 'pick', 'loop', 'riff', 'fret', 'chord', 'note']

function randomUsername() {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num  = Math.floor(Math.random() * 90) + 10
  return `${adj}_${noun}${num}`
}

interface PasswordRule { label: string; test: (p: string) => boolean }
const PASSWORD_RULES: PasswordRule[] = [
  { label: '8+ characters',    test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number',           test: (p) => /[0-9]/.test(p) },
]

// ─── Right panel (desktop only) ───────────────────────────────────────────────

function RightPanel() {
  return (
    <div className="relative hidden lg:block lg:w-1/2">
      <Image
        src="https://picsum.photos/seed/subniche-signup/800/1200"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-12 left-10 right-10">
        <p className="text-xl font-semibold leading-snug text-white">
          &ldquo;Finally a marketplace built by gear nerds, for gear nerds.&rdquo;
        </p>
        <p className="mt-3 text-sm text-white/60">SubNiche — guitars &amp; beyond</p>
      </div>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i <= current ? 'w-4 bg-primary' : 'w-1.5 bg-border',
          )}
        />
      ))}
    </div>
  )
}

// ─── Step: Email ─────────────────────────────────────────────────────────────

function EmailStep({
  email,
  onChange,
  onNext,
}: {
  email: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Join the community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll send you a link to create your account.
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
            value={email}
            onChange={(e) => onChange(e.target.value)}
            className="bg-card"
            onKeyDown={(e) => e.key === 'Enter' && email && onNext()}
          />
        </div>

        <Button className="w-full gap-2" onClick={onNext} disabled={!email}>
          <Mail className="h-4 w-4" />
          Send link
        </Button>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="mx-4 text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <Button variant="hollow" className="w-full gap-2 bg-card">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

// ─── Step: Confirm email ──────────────────────────────────────────────────────

function ConfirmEmailStep({
  email,
  onNext,
}: {
  email: string
  onNext: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-sm text-center">
      <div className="mb-8 flex flex-col items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
          <Mail className="h-9 w-9 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">We sent a link to</p>
          <p className="mt-0.5 font-semibold text-foreground">{email}</p>
        </div>
        <p className="text-sm text-muted-foreground">The link will expire in 1 hour.</p>
      </div>

      {/* dev-only staging helper */}
      <button
        type="button"
        onClick={onNext}
        className="mt-8 text-[11px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
      >
        [dev] skip →
      </button>
    </div>
  )
}

// ─── Step: Password ───────────────────────────────────────────────────────────

function PasswordStep({
  password,
  onChange,
  onNext,
}: {
  password: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  const passwordValid = PASSWORD_RULES.every((r) => r.test(password))

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6">
        <StepDots current={0} total={4} />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Create a password</h1>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => onChange(e.target.value)}
            className="bg-card"
            autoComplete="new-password"
            autoFocus
          />
          {password.length > 0 && (
            <ul className="space-y-1 pt-1">
              {PASSWORD_RULES.map((rule) => {
                const pass = rule.test(password)
                return (
                  <li key={rule.label} className="flex items-center gap-2">
                    <div className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                      pass ? 'bg-primary/20' : 'bg-border',
                    )}>
                      {pass && <Check className="h-2.5 w-2.5 text-primary" />}
                    </div>
                    <span className={cn('text-xs', pass ? 'text-foreground' : 'text-muted-foreground')}>
                      {rule.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <Button className="w-full" disabled={!passwordValid} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}

// ─── Step: Niche selector ─────────────────────────────────────────────────────

function NicheStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: string
  onSelect: (id: string) => void
  onNext: () => void
}) {
  const [query, setQuery] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggestValue, setSuggestValue] = useState('')
  const [suggestNote, setSuggestNote] = useState('')
  const [suggestContact, setSuggestContact] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const filtered = NICHES.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase()) ||
    n.description.toLowerCase().includes(query.toLowerCase()),
  )

  function handleSubmitSuggestion() {
    if (!suggestValue.trim()) return
    setSubmitted(true)
    setSuggestValue('')
    setSuggestNote('')
    setSuggestContact(false)
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6">
        <StepDots current={1} total={4} />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Select your home niche</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This will be your default niche when logging in.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showSuggest ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search niches…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-card pl-9 pr-8"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Niche list */}
            <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
              {filtered.length > 0 ? (
                filtered.map((niche, i) => {
                  const Icon = niche.icon
                  const isSelected = selected === niche.id
                  return (
                    <button
                      key={niche.id}
                      type="button"
                      disabled={!niche.available}
                      onClick={() => niche.available && onSelect(niche.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                        i > 0 && 'border-t border-border',
                        niche.available
                          ? isSelected
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/50'
                          : 'cursor-not-allowed opacity-45',
                      )}
                    >
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        isSelected ? 'bg-primary/20' : 'bg-muted',
                      )}>
                        <Icon className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{niche.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{niche.description}</p>
                      </div>
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        ) : !niche.available ? (
                          <span className="text-[10px] text-muted-foreground/60">Coming soon</span>
                        ) : null}
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="flex flex-col items-center gap-2 p-8 text-center">
                  <Sparkles className="h-6 w-6 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No niches match &ldquo;{query}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Suggest link */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowSuggest(true)}
                className="group w-full text-center text-xs text-muted-foreground underline-offset-2"
              >
                Don&apos;t see yours?{' '}
                <span className="text-primary group-hover:underline">Suggest a niche</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="suggest"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mb-5"
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Thanks for the suggestion!</p>
                  <p className="text-xs text-muted-foreground">We read every submission and are always looking for ways to serve niche communities.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setShowSuggest(false) }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to signup
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <Label className="text-xs text-muted-foreground">What niche would you like to see supported?</Label>
                  <button
                    type="button"
                    onClick={() => { setShowSuggest(false); setSuggestValue(''); setSuggestNote(''); setSuggestContact(false) }}
                    aria-label="Back to niche list"
                    className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <Input
                    placeholder=""
                    value={suggestValue}
                    onChange={(e) => setSuggestValue(e.target.value)}
                    className="bg-background text-sm"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Note <span className="text-muted-foreground/50">(optional)</span>
                  </Label>
                  <textarea
                    placeholder="Tell us about your community and anything else you'd like us to know."
                    value={suggestNote}
                    onChange={(e) => setSuggestNote(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={suggestContact}
                    onChange={(e) => setSuggestContact(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I&apos;m open to being contacted by SubNiche for help implementing this niche.
                  </span>
                </label>

                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleSubmitSuggestion}
                  disabled={!suggestValue.trim()}
                >
                  Submit suggestion
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!showSuggest && (
        <Button className="w-full" disabled={!selected} onClick={onNext}>
          Continue
        </Button>
      )}
    </div>
  )
}

// ─── Step: Profile ────────────────────────────────────────────────────────────

function ProfileStep({
  displayName,
  username,
  onChangeDisplay,
  onChangeUsername,
  onNext,
}: {
  displayName: string
  username: string
  onChangeDisplay: (v: string) => void
  onChangeUsername: (v: string) => void
  onNext: () => void
}) {
  const canSubmit = displayName.trim() && username.trim()

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6">
        <StepDots current={2} total={4} />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Basic info</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Some logistics to help you get set up.
        </p>
      </div>

      <div className="space-y-5">
        {/* Display name */}
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            placeholder="e.g. Kyle's Guitars"
            value={displayName}
            onChange={(e) => onChangeDisplay(e.target.value)}
            className="bg-card"
            autoComplete="name"
          />
          <p className="text-xs text-muted-foreground">
            This is how you&apos;ll appear in your home niche. You can change it later.
          </p>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              u/
            </span>
            <Input
              id="username"
              placeholder="yourname"
              value={username}
              onChange={(e) => onChangeUsername(sanitizeUsername(e.target.value))}
              className="bg-card pl-7"
              autoComplete="username"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This identifies your account across all niches. It cannot be changed.
          </p>
        </div>

        <Button className="w-full" disabled={!canSubmit} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}

// ─── Step: Onboarding ─────────────────────────────────────────────────────────

function OnboardingStep({
  avatarPreview,
  bio,
  zipCode,
  onAvatarChange,
  onBioChange,
  onZipChange,
  onFinish,
}: {
  avatarPreview: string | null
  bio: string
  zipCode: string
  onAvatarChange: (url: string | null) => void
  onBioChange: (v: string) => void
  onZipChange: (v: string) => void
  onFinish: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onAvatarChange(URL.createObjectURL(file))
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6">
        <StepDots current={3} total={4} />
        <h1 className="mt-4 text-2xl font-bold text-foreground">You&apos;re in! Introduce yourself.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Help the community get to know you.
        </p>
      </div>

      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-card transition-colors hover:border-primary/60"
          >
            {avatarPreview ? (
              <>
                <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </>
            ) : (
              <Camera className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {avatarPreview ? 'Change avatar' : 'Upload avatar'}
          </button>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={3}
            placeholder="Tell the community a bit about yourself…"
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Zip code */}
        <div className="space-y-1.5">
          <Label htmlFor="zip">ZIP / Postal code</Label>
          <Input
            id="zip"
            placeholder="e.g. 90210"
            value={zipCode}
            onChange={(e) => onZipChange(e.target.value)}
            className="bg-card"
            autoComplete="postal-code"
          />
          <p className="text-xs text-muted-foreground">
            Helps surface local listings and traders near you.
          </p>
        </div>

        <Button className="w-full" onClick={onFinish}>
          Get started
        </Button>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onFinish}
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export function SignupFlow() {
  const [step, setStep] = useState<Step>('email')
  const [direction, setDirection] = useState(1)
  const [state, setState] = useState<State>(() => ({
    email: '',
    niche: '',
    displayName: '',
    username: randomUsername(),
    password: '',
    avatarPreview: null,
    bio: '',
    zipCode: '',
  }))

  const stepOrder: Step[] = ['email', 'confirm-email', 'password', 'niche', 'profile', 'onboarding']

  function advance(next: Step) {
    const curr    = stepOrder.indexOf(step)
    const nextIdx = stepOrder.indexOf(next)
    setDirection(nextIdx > curr ? 1 : -1)
    setStep(next)
  }

  function goBack() {
    const idx = stepOrder.indexOf(step)
    if (idx === 0) {
      window.location.href = '/'
    } else {
      advance(stepOrder[idx - 1])
    }
  }

  function set<K extends keyof State>(key: K) {
    return (value: State[K]) => setState((s) => ({ ...s, [key]: value }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Top bar */}
        <div className="flex items-center justify-end px-8 py-6">
          <Link href="/" aria-label="SubNiche home">
            <SubnicheLogo width={117} height={36} light priority />
          </Link>
        </div>

        {/* Step content */}
        <div className="flex flex-1 flex-col justify-start px-8 pt-10 pb-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <button
              type="button"
              onClick={goBack}
              className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 24 }),
                center: { opacity: 1, x: 0 },
                exit:  (d: number) => ({ opacity: 0, x: d * -24 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {step === 'email' && (
                <EmailStep
                  email={state.email}
                  onChange={set('email')}
                  onNext={() => advance('confirm-email')}
                />
              )}
              {step === 'confirm-email' && (
                <ConfirmEmailStep
                  email={state.email}
                  onNext={() => advance('password')}
                />
              )}
              {step === 'password' && (
                <PasswordStep
                  password={state.password}
                  onChange={set('password')}
                  onNext={() => advance('niche')}
                />
              )}
              {step === 'niche' && (
                <NicheStep
                  selected={state.niche}
                  onSelect={set('niche')}
                  onNext={() => advance('profile')}
                />
              )}
              {step === 'profile' && (
                <ProfileStep
                  displayName={state.displayName}
                  username={state.username}
                  onChangeDisplay={set('displayName')}
                  onChangeUsername={set('username')}
                  onNext={() => advance('onboarding')}
                />
              )}
              {step === 'onboarding' && (
                <OnboardingStep
                  avatarPreview={state.avatarPreview}
                  bio={state.bio}
                  zipCode={state.zipCode}
                  onAvatarChange={set('avatarPreview')}
                  onBioChange={set('bio')}
                  onZipChange={set('zipCode')}
                  onFinish={() => (window.location.href = `/n/${state.niche || 'guitars'}`)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <RightPanel />
    </div>
  )
}
