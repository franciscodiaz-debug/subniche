"use client"

/**
 * Make an Offer modal — entry point for Trade Offer initiation.
 *
 * Three short steps:
 *   1. Pick one or more of YOUR items to offer in trade.
 *   2. Optionally add cash to balance the trade.
 *   3. Optionally include a short message + send.
 *
 * "Send" doesn't persist anything (no shared listings store in this
 * branch). On confirm we close the modal and route the user to /inbox,
 * which is where outbound offers land per the existing inbox fixtures.
 */

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Repeat2,
  X,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { myItems, type MyItem } from "@/lib/mock/my-stuff"

interface MakeOfferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The listing the viewer is making an offer ON. */
  targetListingId: string
  targetTitle: string
  targetImage?: string
  targetPrice?: number | null
}

type Step = 1 | 2 | 3

const STEP_LABELS: Record<Step, string> = {
  1: "Choose items",
  2: "Add cash (optional)",
  3: "Review & send",
}

export function MakeOfferModal({
  open,
  onOpenChange,
  targetListingId,
  targetTitle,
  targetImage,
  targetPrice,
}: MakeOfferModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [cashDirection, setCashDirection] = useState<"none" | "add" | "request">(
    "none",
  )
  const [cashAmount, setCashAmount] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  // Only show owned, unsold items that aren't drafts as trade fodder.
  const offerableItems = useMemo(
    () => myItems.filter((item) => !item.sold && item.updated_at !== "Draft"),
    [],
  )

  const selectedItems = useMemo(
    () => offerableItems.filter((item) => selectedIds.has(item.id)),
    [offerableItems, selectedIds],
  )
  const selectedValue = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.price ?? 0), 0),
    [selectedItems],
  )

  const parsedCash = Number.parseFloat(cashAmount) || 0
  const cashDelta =
    cashDirection === "add"
      ? parsedCash
      : cashDirection === "request"
        ? -parsedCash
        : 0
  const totalOfferValue = selectedValue + cashDelta

  const canAdvance = step === 1 ? selectedIds.size > 0 : true

  const handleClose = () => {
    onOpenChange(false)
    // Reset on close so a re-open starts fresh.
    setStep(1)
    setSelectedIds(new Set())
    setCashDirection("none")
    setCashAmount("")
    setMessage("")
  }

  const handleSend = () => {
    // Prototype: no persistence. Route to inbox where outbound offers live.
    handleClose()
    router.push("/inbox")
  }

  const toggleItem = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : handleClose())}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Repeat2 className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <DialogTitle className="text-base font-semibold tracking-tight">
                  Propose a Trade
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Step {step} of 3 &middot; {STEP_LABELS[step]}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </DialogHeader>

        {/* Target listing context — always visible */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
            {targetImage ? (
              <Image src={targetImage} alt={targetTitle} fill className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Trading for
            </p>
            <p className="truncate text-sm font-medium text-foreground">{targetTitle}</p>
          </div>
          {targetPrice != null ? (
            <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              ${targetPrice.toLocaleString("en-US")}
            </p>
          ) : null}
        </div>

        {/* Step body */}
        <div className="max-h-[55vh] overflow-y-auto px-5 py-4">
          {step === 1 && (
            <Step1ItemPicker
              items={offerableItems}
              selectedIds={selectedIds}
              onToggle={toggleItem}
            />
          )}

          {step === 2 && (
            <Step2Cash
              direction={cashDirection}
              onDirectionChange={setCashDirection}
              amount={cashAmount}
              onAmountChange={setCashAmount}
              selectedValue={selectedValue}
              targetPrice={targetPrice ?? null}
            />
          )}

          {step === 3 && (
            <Step3Review
              targetTitle={targetTitle}
              selectedItems={selectedItems}
              cashDirection={cashDirection}
              cashAmount={parsedCash}
              totalOfferValue={totalOfferValue}
              message={message}
              onMessageChange={setMessage}
            />
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border bg-card/40 px-5 py-3 sm:justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5"
              disabled={!canAdvance}
              onClick={() => setStep((s) => ((s + 1) as Step))}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5"
              onClick={handleSend}
              disabled={selectedIds.size === 0}
            >
              <Check className="h-4 w-4" />
              Send Offer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 1 — Item picker                                                       */
/* -------------------------------------------------------------------------- */
function Step1ItemPicker({
  items,
  selectedIds,
  onToggle,
}: {
  items: MyItem[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Pick one or more of your items to offer in trade.
      </p>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
          You don&apos;t have any items to trade yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) => {
            const checked = selectedIds.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={checked}
                className={cn(
                  "flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-left transition-colors",
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.subtitle ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {item.price != null ? (
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      ${item.price.toLocaleString("en-US")}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border text-primary-foreground transition-colors",
                      checked
                        ? "border-primary bg-primary"
                        : "border-border bg-transparent",
                    )}
                  >
                    {checked ? <Check className="h-3 w-3" /> : null}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Cash differential                                                 */
/* -------------------------------------------------------------------------- */
function Step2Cash({
  direction,
  onDirectionChange,
  amount,
  onAmountChange,
  selectedValue,
  targetPrice,
}: {
  direction: "none" | "add" | "request"
  onDirectionChange: (v: "none" | "add" | "request") => void
  amount: string
  onAmountChange: (v: string) => void
  selectedValue: number
  targetPrice: number | null
}) {
  const suggestedDiff =
    targetPrice != null ? targetPrice - selectedValue : null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Use cash to balance the trade if values differ. Optional.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { value: "none", label: "No cash", icon: X },
            { value: "add", label: "Add cash", icon: ChevronUp },
            { value: "request", label: "Request cash", icon: ChevronDown },
          ] as const
        ).map((opt) => {
          const Icon = opt.icon
          const selected = direction === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onDirectionChange(opt.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border bg-card px-3 py-3 text-center text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {opt.label}
            </button>
          )
        })}
      </div>

      {direction !== "none" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="offer-cash" className="text-xs text-muted-foreground">
            {direction === "add"
              ? "How much cash will you add?"
              : "How much cash are you asking for?"}
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="offer-cash"
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="h-10 pl-7"
            />
          </div>
          {suggestedDiff != null && suggestedDiff > 0 && direction === "add" ? (
            <p className="text-xs text-muted-foreground">
              Their item is listed for{" "}
              <span className="tabular-nums">
                ${targetPrice!.toLocaleString("en-US")}
              </span>
              . You&apos;d need about{" "}
              <span className="font-medium text-foreground tabular-nums">
                ${suggestedDiff.toLocaleString("en-US")}
              </span>{" "}
              cash to balance.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Review + message                                                  */
/* -------------------------------------------------------------------------- */
function Step3Review({
  targetTitle,
  selectedItems,
  cashDirection,
  cashAmount,
  totalOfferValue,
  message,
  onMessageChange,
}: {
  targetTitle: string
  selectedItems: MyItem[]
  cashDirection: "none" | "add" | "request"
  cashAmount: number
  totalOfferValue: number
  message: string
  onMessageChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          You&apos;re offering
        </p>
        <ul className="flex flex-col gap-1.5">
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate text-foreground">{item.title}</span>
              {item.price != null ? (
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  ${item.price.toLocaleString("en-US")}
                </span>
              ) : null}
            </li>
          ))}
          {cashDirection !== "none" && cashAmount > 0 ? (
            <li className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-foreground">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                {cashDirection === "add" ? "Cash added" : "Cash requested"}
              </span>
              <span
                className={cn(
                  "shrink-0 tabular-nums",
                  cashDirection === "add"
                    ? "text-foreground"
                    : "text-destructive",
                )}
              >
                {cashDirection === "add" ? "+" : "−"}$
                {cashAmount.toLocaleString("en-US")}
              </span>
            </li>
          ) : null}
        </ul>
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm">
          <span className="font-medium text-foreground">Total offer value</span>
          <span className="font-semibold tabular-nums text-foreground">
            ${totalOfferValue.toLocaleString("en-US")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offer-message" className="text-xs text-muted-foreground">
          Message <span className="font-normal">(optional)</span>
        </Label>
        <Textarea
          id="offer-message"
          rows={3}
          maxLength={280}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={`Hi! Interested in trading for your ${targetTitle}...`}
          className="resize-none text-sm"
        />
        <p className="text-right text-[11px] text-muted-foreground tabular-nums">
          {message.length}/280
        </p>
      </div>
    </div>
  )
}
