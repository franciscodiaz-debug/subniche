"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Mail,
  Share2,
  MapPin,
  Check,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  Package,
  ChevronRight,
  ArrowRightLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ContactModal } from "@/components/contact-modal"
import { MakeOfferModal } from "@/components/make-offer-modal"
import { MakeTradeOfferModal } from "@/components/make-trade-offer-modal"
import { demoProfiles, demoListings } from "@/lib/demo-data"
import { FollowButton } from "@/components/favorites/follow-button"
import type { Listing } from "@/lib/types"

interface ListingDetailProps {
  listing: Listing
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const [showContactModal, setShowContactModal] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [showTradeOfferModal, setShowTradeOfferModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [communitiesExpanded, setCommunitiesExpanded] = useState(false)

  const sellerProfile = demoProfiles.find((p) => p.id === listing.seller_id) || listing.seller
  const currentUserProfile = demoProfiles.find((p) => p.id === "demo-buyer-1")

  const sharedCommunities =
    sellerProfile?.communities?.filter((comm) => currentUserProfile?.communities?.some((c) => c.id === comm.id)) || []

  const sellerOnlyCommunities =
    sellerProfile?.communities?.filter((comm) => !currentUserProfile?.communities?.some((c) => c.id === comm.id)) || []

  const sellerOtherListings = demoListings.filter((l) => l.seller_id === listing.seller_id && l.id !== listing.id)

  const getMemberDuration = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const months = Math.floor((now.getTime() - created.getTime()) / (30 * 24 * 60 * 60 * 1000))
    if (months < 1) return "New member"
    if (months < 12) return `Member for ${months} month${months !== 1 ? "s" : ""}`
    const years = Math.floor(months / 12)
    return `Member for ${years} year${years !== 1 ? "s" : ""}`
  }

  const getLocationConnection = () => {
    if (!sellerProfile?.location || !currentUserProfile?.location) return null
    const sellerState = sellerProfile.location.split(", ").pop()
    const buyerState = currentUserProfile.location.split(", ").pop()
    if (sellerState === buyerState) return sellerState
    return null
  }

  const sharedState = getLocationConnection()

  return (
    <div className="p-6">
      <div className="flex gap-2 text-sm text-muted-foreground mb-4">
        <span>{listing.category}</span>
        {listing.subcategory && (
          <>
            <span>{">"}</span>
            <span>{listing.subcategory}</span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
        {/* Photos Section - First on mobile */}
        <div className="order-1 lg:hidden">
          {/* Main Image */}
          <div className="aspect-square relative rounded-lg overflow-hidden bg-card">
            <Image
              src={listing.images[selectedImage] || "/placeholder.svg?height=600&width=600&query=disc golf markers"}
              alt={listing.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Image Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 relative rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-primary" : "border-border"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${listing.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Left Column - Main Info */}
        <div className="space-y-6 order-2 lg:order-1">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
            {listing.subtitle && <p className="text-muted-foreground mt-1">{listing.subtitle}</p>}
            <p className="text-4xl font-bold text-primary mt-4">${listing.price}</p>
          </div>

          {/* Combined Seller Card with Action Buttons */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Seller info row */}
            <a
              href={`/seller/${listing.seller_id}`}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
            >
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={sellerProfile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {sellerProfile?.username?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {sellerProfile?.username}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                  {sellerProfile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {sellerProfile.location}
                    </span>
                  )}
                  {sellerOtherListings.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {sellerOtherListings.length} other listing{sellerOtherListings.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>

            {/* Groups in common - expandable inline */}
            {sharedCommunities.length > 0 && (
              <div className="border-t border-border">
                <button
                  onClick={() => setCommunitiesExpanded(!communitiesExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-primary font-medium">
                    <Users className="h-3.5 w-3.5" />
                    {sharedCommunities.length} group{sharedCommunities.length !== 1 ? "s" : ""} in common
                  </span>
                  {communitiesExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {communitiesExpanded && (
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {sharedCommunities.map((comm) => (
                      <Badge
                        key={comm.id}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary border border-primary/30"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        <span className="mr-1">{comm.icon}</span>
                        {comm.name}
                      </Badge>
                    ))}
                    {sellerOnlyCommunities.length > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground self-center px-1">·</span>
                        {sellerOnlyCommunities.map((comm) => (
                          <Badge key={comm.id} variant="secondary" className="text-xs">
                            <span className="mr-1">{comm.icon}</span>
                            {comm.name}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons inside the card */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3 mb-3">
                <Button
                  onClick={() => setShowContactModal(true)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button
                  onClick={() => setShowOfferModal(true)}
                  className="flex-1 bg-transparent border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make Offer
                </Button>
                <FollowButton
                  type="item"
                  targetId={listing.id}
                  targetName={listing.title}
                  variant="icon"
                  className="bg-card border-2 border-border hover:bg-muted h-10 w-10"
                />
                <Button className="bg-card border-2 border-border text-foreground hover:bg-muted px-4">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {/* Trade Offer Button */}
              <Button
                onClick={() => setShowTradeOfferModal(true)}
                variant="outline"
                className="w-full border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Propose a Trade
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          {/* Condition */}
          {listing.condition && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Condition</h2>
              <p className="text-muted-foreground">{listing.condition}</p>
            </div>
          )}

          {/* Specifications placeholder */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <p className="text-muted-foreground">Details about the item...</p>
          </div>
        </div>

        {/* Right Column - Desktop only: Photos + Payment/Logistics stacked together */}
        <div className="hidden lg:flex lg:flex-col lg:gap-6 lg:order-2">
          {/* Photos */}
          <div>
            {/* Main Image */}
            <div className="aspect-square relative rounded-lg overflow-hidden bg-card">
              <Image
                src={listing.images[selectedImage] || "/placeholder.svg?height=600&width=600&query=disc golf markers"}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 relative rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${listing.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="space-y-2">
              {listing.payment_methods.map((method) => (
                <div key={method} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics */}
          {listing.logistics && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Logistics</h2>
              <div className="space-y-2">
                {listing.logistics.split(",").map((option, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{option.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment & Logistics - Mobile only, appears last */}
        <div className="space-y-6 order-3 lg:hidden">
          {/* Payment */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="space-y-2">
              {listing.payment_methods.map((method) => (
                <div key={method} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics */}
          {listing.logistics && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Logistics</h2>
              <div className="space-y-2">
                {listing.logistics.split(",").map((option, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{option.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal listing={listing} open={showContactModal} onClose={() => setShowContactModal(false)} />

      {/* Make Offer Modal */}
      <MakeOfferModal
        listing={listing}
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onOfferSent={() => {
          // Optionally open contact modal after sending offer
        }}
      />

      {/* Trade Offer Modal */}
      <MakeTradeOfferModal
        listing={listing}
        open={showTradeOfferModal}
        onClose={() => setShowTradeOfferModal(false)}
        onOfferSent={() => {
          // Optionally show success or open messages
        }}
      />
    </div>
  )
}
