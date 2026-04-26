"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import {
  ImageIcon,
  MapPin,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { demoProfiles } from "@/lib/demo-data"

const categories = [
  { value: "discs", label: "Discs" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
  { value: "apparel", label: "Apparel" },
  { value: "guitars", label: "Guitars" },
  { value: "other", label: "Other" },
]

export function CreateListingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Form state - Step 1
  const [photos, setPhotos] = useState<string[]>([])
  const [category, setCategory] = useState<string>("")

  // Form state - Step 2
  const [title, setTitle] = useState("")
  const [subheading, setSubheading] = useState("")
  const [advancedSpecsOpen, setAdvancedSpecsOpen] = useState(true)

  // Advanced specifications state
  const [brand, setBrand] = useState("")
  const [year, setYear] = useState("")
  const [handedness, setHandedness] = useState("")
  const [color, setColor] = useState("")
  const [neckWood, setNeckWood] = useState("")
  const [fretboardWood, setFretboardWood] = useState("")
  const [nutWidth, setNutWidth] = useState("")
  const [neckProfile, setNeckProfile] = useState("")
  const [fretboardRadius, setFretboardRadius] = useState("")
  const [numberOfFrets, setNumberOfFrets] = useState("")
  const [fretSize, setFretSize] = useState("")
  const [onboardElectronics, setOnboardElectronics] = useState("")
  const [bodyShape, setBodyShape] = useState("")
  const [pickupConfiguration, setPickupConfiguration] = useState("")
  const [bridgeTailpieceType, setBridgeTailpieceType] = useState("")

  // Form state - Step 3
  const [itemDescription, setItemDescription] = useState("")
  const [conditionNotes, setConditionNotes] = useState("")

  // Form state - Step 4
  const [price, setPrice] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [otherPaymentDetails, setOtherPaymentDetails] = useState("")
  const [localPickup, setLocalPickup] = useState(false)
  const [shippingAvailable, setShippingAvailable] = useState(false)
  const [returnPolicy, setReturnPolicy] = useState("")

  // Form state - Step 5
  const [publishToGeneralNiche, setPublishToGeneralNiche] = useState(true)
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([])

  // Get current user for preview
  const currentUser = demoProfiles[0]

  const canProceedStep1 = photos.length > 0 && category !== ""
  const canProceedStep2 = title.trim() !== "" && subheading.trim() !== ""
  const canProceedStep3 = itemDescription.trim() !== "" && conditionNotes.trim() !== ""
  const canProceedStep4 = price.trim() !== "" && paymentMethods.length > 0 && (localPickup || shippingAvailable)

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return canProceedStep1
      case 2:
        return canProceedStep2
      case 3:
        return canProceedStep3
      case 4:
        return canProceedStep4
      default:
        return true
    }
  }

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods((prev) => (prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileUrls = Array.from(files).map((file) => URL.createObjectURL(file))
      setPhotos((prevPhotos) => [...prevPhotos, ...fileUrls])
    }
  }

  const RichTextToolbar = () => (
    <div className="flex items-center gap-1 p-2 border-b border-border">
      <button type="button" className="p-2 hover:bg-muted rounded text-foreground">
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className="p-2 hover:bg-muted rounded text-foreground">
        <Italic className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border mx-1" />
      <button type="button" className="p-2 hover:bg-muted rounded text-foreground">
        <ListOrdered className="h-4 w-4" />
      </button>
      <button type="button" className="p-2 hover:bg-muted rounded text-foreground">
        <List className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border mx-1" />
      <button type="button" className="p-2 hover:bg-muted rounded text-foreground">
        <Strikethrough className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-card rounded-lg border border-border p-6">
          {/* Header with step indicator */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Create Listing</h1>
            <span className="text-muted-foreground text-sm">
              {currentStep === 5 ? "Ready to publish" : `Step ${currentStep} of ${totalSteps - 1}`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-8">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step 1: Photos and Category */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Photos section */}
              <div>
                <h2 className="text-lg font-medium text-foreground mb-4">Photos</h2>
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-48 h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handlePhotoUpload}
                  />
                </label>

                {/* Photo thumbnails */}
                {photos.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={photo || "/placeholder.svg"}
                          alt={`Upload ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category section */}
              <div>
                <h2 className="text-lg font-medium text-foreground mb-4">
                  Category <span className="text-primary">*</span>
                </h2>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-card border-primary/50 text-foreground">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Details section */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Details</h2>
                <p className="text-muted-foreground text-sm mb-6">This category has no attributes</p>

                {/* Listing Title */}
                <div className="mb-4">
                  <label className="block text-foreground font-medium mb-2">
                    Listing Title <span className="text-primary">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your listing title"
                    className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Subheading */}
                <div className="mb-6">
                  <label className="block text-foreground font-medium mb-2">
                    Subheading <span className="text-primary">*</span>
                  </label>
                  <Input
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                    placeholder="Enter a short subheading for your listing"
                    className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Advanced Specifications Collapsible */}
              <Collapsible open={advancedSpecsOpen} onOpenChange={setAdvancedSpecsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <h3 className="text-xl font-semibold text-foreground">Advanced Specifications</h3>
                  {advancedSpecsOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Brand */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Brand</label>
                      <Input
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Year</label>
                      <Input
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Handedness */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Handedness</label>
                      <Select value={handedness} onValueChange={setHandedness}>
                        <SelectTrigger className="bg-card border-border text-foreground">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">Right-Handed</SelectItem>
                          <SelectItem value="left">Left-Handed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Color</label>
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Neck Wood */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Neck Wood</label>
                      <Input
                        value={neckWood}
                        onChange={(e) => setNeckWood(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Fretboard Wood */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Fretboard Wood</label>
                      <Input
                        value={fretboardWood}
                        onChange={(e) => setFretboardWood(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Nut Width */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Nut Width</label>
                      <Input
                        value={nutWidth}
                        onChange={(e) => setNutWidth(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Neck Profile */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Neck Profile</label>
                      <Input
                        value={neckProfile}
                        onChange={(e) => setNeckProfile(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Fretboard Radius */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Fretboard Radius</label>
                      <Input
                        value={fretboardRadius}
                        onChange={(e) => setFretboardRadius(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Number of Frets */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Number of Frets</label>
                      <Input
                        value={numberOfFrets}
                        onChange={(e) => setNumberOfFrets(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Fret Size */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Fret Size</label>
                      <Input
                        value={fretSize}
                        onChange={(e) => setFretSize(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* On-board Electronics */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">On-board Electronics</label>
                      <Input
                        value={onboardElectronics}
                        onChange={(e) => setOnboardElectronics(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Body Shape */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Body Shape</label>
                      <Input
                        value={bodyShape}
                        onChange={(e) => setBodyShape(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Pickup Configuration */}
                    <div>
                      <label className="block text-foreground text-sm mb-2">Pickup Configuration</label>
                      <Input
                        value={pickupConfiguration}
                        onChange={(e) => setPickupConfiguration(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Bridge/Tailpiece Type - full width */}
                    <div className="col-span-2">
                      <label className="block text-foreground text-sm mb-2">Bridge/Tailpiece Type</label>
                      <Input
                        value={bridgeTailpieceType}
                        onChange={(e) => setBridgeTailpieceType(e.target.value)}
                        placeholder="-"
                        className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Description</h2>

              {/* Item Description */}
              <div>
                <label className="block text-foreground font-medium mb-2">
                  Item Description <span className="text-primary">*</span>
                </label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <RichTextToolbar />
                  <Textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Describe your product"
                    className="min-h-[150px] border-0 bg-card text-foreground placeholder:text-muted-foreground resize-y rounded-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Condition Notes */}
              <div>
                <label className="block text-foreground font-medium mb-2">
                  Condition Notes <span className="text-primary">*</span>
                </label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <RichTextToolbar />
                  <Textarea
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    placeholder="Describe the condition of your item"
                    className="min-h-[150px] border-0 bg-card text-foreground placeholder:text-muted-foreground resize-y rounded-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Transaction Details</h2>

              {/* Price */}
              <div>
                <label className="block text-foreground font-medium mb-2">
                  Price <span className="text-primary">*</span>
                </label>
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">$</span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7 bg-card border-border text-foreground"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Payment</h3>
                <div className="space-y-3">
                  {[
                    { id: "cash", label: "Cash" },
                    { id: "paypal-ff", label: "Paypal - Friends and Family" },
                    { id: "paypal-gs", label: "Paypal - Goods and Services" },
                    { id: "venmo", label: "Venmo" },
                    { id: "crypto", label: "Cryptocurrency" },
                  ].map((method) => (
                    <div key={method.id} className="flex items-center gap-3">
                      <Checkbox
                        id={method.id}
                        checked={paymentMethods.includes(method.id)}
                        onCheckedChange={() => togglePaymentMethod(method.id)}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor={method.id} className="text-foreground cursor-pointer">
                        {method.label}
                      </label>
                    </div>
                  ))}
                  {/* Other payment option */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="other"
                      checked={paymentMethods.includes("other")}
                      onCheckedChange={() => togglePaymentMethod("other")}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="other" className="text-foreground cursor-pointer">
                      Other
                    </label>
                    <span className="text-muted-foreground text-sm bg-muted px-2 py-1 rounded">
                      Revolut, Wise, etc.
                    </span>
                  </div>
                </div>
              </div>

              {/* Logistics */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Logistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="local-pickup"
                      checked={localPickup}
                      onCheckedChange={(checked) => setLocalPickup(checked as boolean)}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="local-pickup" className="text-foreground cursor-pointer">
                      Local Pickup
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="shipping"
                      checked={shippingAvailable}
                      onCheckedChange={(checked) => setShippingAvailable(checked as boolean)}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="shipping" className="text-foreground cursor-pointer">
                      Shipping Available
                    </label>
                  </div>
                </div>
              </div>

              {/* Return Policy */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Return Policy</h3>
                <Textarea
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  placeholder="Provide details about your return policy, if any"
                  className="min-h-[120px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-y"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Publish Listing</h2>
                <p className="text-muted-foreground">Choose where to publish your listing</p>
              </div>

              {/* General Niche */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="general-niche"
                    checked={publishToGeneralNiche}
                    onCheckedChange={(checked) => setPublishToGeneralNiche(checked as boolean)}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="general-niche" className="text-foreground font-medium cursor-pointer">
                    General Niche
                  </label>
                </div>
                <p className="text-muted-foreground text-sm ml-7">
                  Any MarKat user may contact you regarding this listing.
                </p>
              </div>

              {/* My Communities */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">My Communities</h3>
                <p className="text-muted-foreground text-sm">
                  Publishing only in communities means only other community members will be able to contact you about
                  this item.
                </p>
                <p className="text-foreground font-medium mt-4">You don't belong to any community yet.</p>
              </div>
            </div>
          )}

          {/* Bottom buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              className="flex-1 border-primary text-foreground hover:bg-muted bg-transparent"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1)
                }
              }}
            >
              {currentStep === 1 ? "Cancel" : currentStep === 5 ? "Edit" : "Back"}
            </Button>
            <Button
              className={`flex-1 ${
                currentStep === 5
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
              }`}
              disabled={currentStep !== 5 && !canProceed()}
              onClick={() => {
                if (currentStep < totalSteps) {
                  setCurrentStep(currentStep + 1)
                } else {
                  // Handle publish action
                  console.log("Publishing listing...")
                }
              }}
            >
              {currentStep === 5 ? "Publish" : "Next"}
            </Button>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Preview</h2>

          {/* Title and tagline preview */}
          <div>
            <h3 className="text-2xl font-bold text-primary">{title || "Title"}</h3>
            <p className="text-primary/70 text-sm">{subheading || "Tagline"}</p>
          </div>

          {/* Price preview */}
          <div className="flex items-center text-primary text-xl font-bold">
            <DollarSign className="h-5 w-5" />
            <span>{price || ""}</span>
          </div>

          {/* User info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src={currentUser?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {currentUser?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground">@{currentUser?.username || "username"}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              {currentUser?.location || "Location"}
            </div>
          </div>

          {/* Description preview */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <h4 className="text-foreground font-medium mb-2">Description</h4>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{itemDescription || ""}</p>
          </div>

          {/* Image preview area */}
          <div className="flex gap-4">
            {/* Main image */}
            <div className="flex-1 aspect-square bg-card rounded-lg border border-border flex items-center justify-center">
              {photos.length > 0 ? (
                <div className="relative w-full h-full">
                  <Image src={photos[0] || "/placeholder.svg"} alt="Preview" fill className="object-cover rounded-lg" />
                </div>
              ) : (
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-card rounded border border-border flex items-center justify-center"
                >
                  {photos[index] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={photos[index] || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Condition preview */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <h4 className="text-foreground font-medium">Condition</h4>
            <p className="text-muted-foreground text-sm mt-1 whitespace-pre-wrap">{conditionNotes || ""}</p>
          </div>

          {/* Payment preview */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <h4 className="text-foreground font-medium mb-2">Payment</h4>
            {paymentMethods.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => {
                  const labels: Record<string, string> = {
                    cash: "Cash",
                    "paypal-ff": "PayPal F&F",
                    "paypal-gs": "PayPal G&S",
                    venmo: "Venmo",
                    crypto: "Crypto",
                    other: "Other",
                  }
                  return (
                    <span key={method} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {labels[method] || method}
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No payment methods selected</p>
            )}
          </div>

          {/* Logistics preview */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <h4 className="text-foreground font-medium mb-2">Logistics</h4>
            {localPickup || shippingAvailable ? (
              <div className="flex flex-wrap gap-2">
                {localPickup && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Local Pickup</span>
                )}
                {shippingAvailable && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Shipping Available</span>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No logistics options selected</p>
            )}
          </div>

          {/* Specifications preview */}
          {(brand || year || color || handedness) && (
            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="text-foreground font-medium mb-2">Specifications</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {brand && (
                  <div>
                    <span className="text-muted-foreground">Brand:</span>{" "}
                    <span className="text-foreground">{brand}</span>
                  </div>
                )}
                {year && (
                  <div>
                    <span className="text-muted-foreground">Year:</span> <span className="text-foreground">{year}</span>
                  </div>
                )}
                {color && (
                  <div>
                    <span className="text-muted-foreground">Color:</span>{" "}
                    <span className="text-foreground">{color}</span>
                  </div>
                )}
                {handedness && (
                  <div>
                    <span className="text-muted-foreground">Handedness:</span>{" "}
                    <span className="text-foreground">{handedness === "right" ? "Right-Handed" : "Left-Handed"}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
