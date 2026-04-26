"use client"

import { useState, useEffect } from "react"
import { Loader2, Pencil, Check, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const paymentMethodOptions = [
  { id: "paypal", label: "PayPal" },
  { id: "venmo", label: "Venmo" },
  { id: "zelle", label: "Zelle" },
  { id: "cash", label: "Cash" },
  { id: "cashapp", label: "Cash App" },
  { id: "crypto", label: "Crypto" },
]

const logisticsOptions = [
  { id: "shipping", label: "Shipping" },
  { id: "local_pickup", label: "Local pickup" },
]

interface SellerDefaults {
  default_payment_methods: string[]
  default_logistics: string[]
  default_return_policy: string | null
}

const demoDefaults: SellerDefaults = {
  default_payment_methods: ["paypal", "venmo"],
  default_logistics: ["shipping"],
  default_return_policy: "Returns accepted within 3 days of delivery.",
}

export default function SellerDefaultsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [logistics, setLogistics] = useState<string[]>([])
  const [returnPolicy, setReturnPolicy] = useState("")
  const [originalValues, setOriginalValues] = useState<SellerDefaults | null>(null)
  const [isEditingReturnPolicy, setIsEditingReturnPolicy] = useState(false)

  useEffect(() => {
    const loadDefaults = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("default_payment_methods, default_logistics, default_return_policy")
          .eq("id", user.id)
          .single()

        if (profileData) {
          const defaults: SellerDefaults = {
            default_payment_methods: profileData.default_payment_methods || [],
            default_logistics: Array.isArray(profileData.default_logistics)
              ? profileData.default_logistics
              : profileData.default_logistics
                ? [profileData.default_logistics]
                : [],
            default_return_policy: profileData.default_return_policy,
          }
          setOriginalValues(defaults)
          setPaymentMethods(defaults.default_payment_methods)
          setLogistics(defaults.default_logistics)
          setReturnPolicy(defaults.default_return_policy || "")
          setIsDemo(false)
        }
      } else {
        setIsDemo(true)
        setOriginalValues(demoDefaults)
        setPaymentMethods(demoDefaults.default_payment_methods)
        setLogistics(demoDefaults.default_logistics)
        setReturnPolicy(demoDefaults.default_return_policy || "")
      }

      setIsLoading(false)
    }

    loadDefaults()
  }, [])

  const handlePaymentMethodToggle = async (methodId: string) => {
    const newMethods = paymentMethods.includes(methodId)
      ? paymentMethods.filter((m) => m !== methodId)
      : [...paymentMethods, methodId]

    setPaymentMethods(newMethods)
    await savePaymentMethods(newMethods)
  }

  const handleLogisticsToggle = async (optionId: string) => {
    const newLogistics = logistics.includes(optionId)
      ? logistics.filter((l) => l !== optionId)
      : [...logistics, optionId]

    setLogistics(newLogistics)
    await saveLogistics(newLogistics)
  }

  const handleReturnPolicySave = async () => {
    setIsEditingReturnPolicy(false)
    await saveReturnPolicy(returnPolicy)
  }

  const savePaymentMethods = async (methods: string[]) => {
    if (isDemo) return
    if (!userId || !originalValues) return

    const supabase = createClient()
    await supabase.from("profiles").update({ default_payment_methods: methods }).eq("id", userId)

    if (JSON.stringify(methods.sort()) !== JSON.stringify([...originalValues.default_payment_methods].sort())) {
      await supabase
        .from("collection_items")
        .update({ sale_payment_methods: methods })
        .eq("uses_default_payment_methods", true)
        .in("collection_id", supabase.from("collections").select("id").eq("user_id", userId))
    }

    setOriginalValues({ ...originalValues, default_payment_methods: methods })
  }

  const saveLogistics = async (logisticsValue: string[]) => {
    if (isDemo) return
    if (!userId || !originalValues) return

    const supabase = createClient()
    await supabase.from("profiles").update({ default_logistics: logisticsValue }).eq("id", userId)

    if (JSON.stringify(logisticsValue.sort()) !== JSON.stringify([...originalValues.default_logistics].sort())) {
      await supabase
        .from("collection_items")
        .update({ sale_logistics: logisticsValue })
        .eq("uses_default_logistics", true)
        .in("collection_id", supabase.from("collections").select("id").eq("user_id", userId))
    }

    setOriginalValues({ ...originalValues, default_logistics: logisticsValue })
  }

  const saveReturnPolicy = async (policy: string) => {
    if (isDemo) return
    if (!userId || !originalValues) return

    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({ default_return_policy: policy || null })
      .eq("id", userId)

    if (policy !== (originalValues.default_return_policy || "")) {
      await supabase
        .from("collection_items")
        .update({ sale_return_policy: policy || null })
        .eq("uses_default_return_policy", true)
        .in("collection_id", supabase.from("collections").select("id").eq("user_id", userId))
    }

    setOriginalValues({ ...originalValues, default_return_policy: policy || null })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="p-6 lg:p-8 max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-xl font-semibold text-foreground">Seller defaults</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <ul className="text-xs space-y-1 list-disc pl-5">
                <li className="pl-1">Defaults will be autopopulated when adding a new item.</li>
                <li className="pl-1">They can be edited on an item-by-item basis.</li>
                <li className="pl-1">Changes made here will apply to all items using default values.</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-8">
          {/* Payment Methods */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Payment methods</label>
            <div className="space-y-2.5">
              {paymentMethodOptions.map((method) => (
                <div key={method.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`payment-${method.id}`}
                    checked={paymentMethods.includes(method.id)}
                    onCheckedChange={() => handlePaymentMethodToggle(method.id)}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`payment-${method.id}`}
                    className={`text-sm cursor-pointer ${
                      paymentMethods.includes(method.id) ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {method.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Logistics</label>
            <div className="space-y-2.5">
              {logisticsOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`logistics-${option.id}`}
                    checked={logistics.includes(option.id)}
                    onCheckedChange={() => handleLogisticsToggle(option.id)}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`logistics-${option.id}`}
                    className={`text-sm cursor-pointer ${
                      logistics.includes(option.id) ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Return Policy */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-foreground">Return policy</label>
              {!isEditingReturnPolicy && (
                <button
                  onClick={() => setIsEditingReturnPolicy(true)}
                  className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
            {isEditingReturnPolicy ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleReturnPolicySave()
                    } else if (e.key === "Escape") {
                      setIsEditingReturnPolicy(false)
                    }
                  }}
                  placeholder="e.g., Returns accepted within 3 days..."
                  className="flex-1 bg-transparent text-sm text-foreground focus:outline-none border-b border-primary/30 pb-2"
                  autoFocus
                />
                <button
                  onClick={handleReturnPolicySave}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-full text-left">
                {returnPolicy ? (
                  <p className="text-sm text-muted-foreground">{returnPolicy}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/50">Add return policy...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
