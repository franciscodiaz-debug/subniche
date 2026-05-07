"use client"

/**
 * Listing detail view.
 *
 * Shared skeleton for the published listing page. Composes all the
 * sub-sections and renders them in two arrangements:
 *
 *   - Desktop (lg+): two columns. Left = content the lister wrote (title,
 *     seller, description, condition, specs). Right = transactional setup
 *     + photos (sticky on scroll).
 *   - Mobile (<lg): a single column, same order the spec defines, with
 *     secondary sections collapsed by default to keep the page scannable.
 *
 * Four state variants drop out of the `MockListing` shape without branching
 * at the layout level: owner vs viewer, for-sale/trade/collection mixes,
 * and mutual-match banners. Sections that don't apply (e.g. payment on a
 * collection-only listing) simply return null.
 */

import { TopStrip } from "./top-strip"
import { PhotoGallery } from "./photo-gallery"
import { CompactSellerCard } from "./compact-seller-card"
import {
  ConditionBlock,
  DescriptionBlock,
  PaymentMethodsBlock,
  ReturnPolicyBlock,
  ShippingBlock,
  SpecificationsBlock,
} from "./info-sections"
import { TradeInterestView } from "./trade-interest-view"
import { OwnerActions, ViewerActions } from "./action-bar"
import { CommentsSection } from "./comments-section"
import { RelatedRow } from "./related-row"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import type { MockListing } from "@/lib/mock-listing-detail"

interface ListingDetailViewProps {
  listing: MockListing
}

export function ListingDetailView({ listing }: ListingDetailViewProps) {
  const {
    categoryPath,
    availability,
    title,
    subtitle,
    description,
    price,
    images,
    conditionLabel,
    conditionExplanation,
    specs,
    seller,
    paymentMethods,
    shipping,
    returnPolicy,
    tradeInterest,
    mutualMatch,
    viewerIsOwner,
    ownerStats,
    markedAsSold,
    comments,
    moreFromSeller,
    youMightAlsoLike,
  } = listing

  const isCollectionOnly =
    availability.includes("collection") &&
    !availability.includes("for-sale") &&
    !availability.includes("for-trade")

  /* Commerce-only sections (payment/shipping/returns) are hidden on
     collection-only listings since they don't apply there. Trade interest
     is gated on `tradeInterest` being non-null. */
  const showCommerceSections = !isCollectionOnly

  /* Reusable element trees so both layouts render the same content without
     diverging. Any subsequent tweaks only have to be made in one place. */

  const titleBlock = (
    <div>
      <h1 className="font-display text-2xl font-semibold leading-tight text-foreground text-balance md:text-3xl lg:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
          {subtitle}
        </p>
      ) : null}
      {typeof price === "number" ? (
        <p className="mt-4 font-display text-3xl font-semibold tabular-nums text-primary md:text-4xl">
          ${price.toLocaleString('en-US')}
        </p>
      ) : null}
      {markedAsSold ? (
        <span className="mt-3 inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Marked as sold
        </span>
      ) : null}
    </div>
  )

  const sellerCard = <CompactSellerCard seller={seller} />
  const descriptionBlock = <DescriptionBlock description={description} />
  const conditionBlock = (
    <ConditionBlock label={conditionLabel} explanation={conditionExplanation} />
  )
  const specsBlock = <SpecificationsBlock specs={specs} />

  const actionBar = viewerIsOwner ? (
    <OwnerActions
      listingId={listing.id}
      stats={ownerStats}
      initialMarkedAsSold={markedAsSold}
    />
  ) : (
    <ViewerActions
      availability={availability}
      markedAsSold={markedAsSold}
      mutualMatch={mutualMatch}
    />
  )

  const paymentBlock = showCommerceSections ? (
    <PaymentMethodsBlock methods={paymentMethods} />
  ) : null
  const shippingBlockEl = showCommerceSections ? (
    <ShippingBlock shipping={shipping} />
  ) : null
  const returnBlockEl = showCommerceSections ? (
    <ReturnPolicyBlock policy={returnPolicy} />
  ) : null
  const tradeBlockEl =
    tradeInterest ? (
      <TradeInterestView data={tradeInterest} mutualMatch={mutualMatch} />
    ) : null

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-4 md:px-6 md:pt-6 lg:px-8">
      <div className="mb-6 md:mb-8">
        <TopStrip
          categoryPath={categoryPath}
          availability={availability}
          mutualMatch={mutualMatch}
        />
      </div>

      {/* -------------------------- Desktop layout -------------------------- */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10">
        {/* Left column — narrative content the buyer reads. */}
        <div className="space-y-6 min-w-0">
          {titleBlock}
          {sellerCard}
          {descriptionBlock}
          {conditionBlock}
          {specsBlock}
        </div>

        {/* Right column — transactional + photos. Sticky wrapper so the
            gallery and CTAs stay in view while the buyer scans the left
            column's longer narrative. `self-start` + `top-*` is the
            canonical sticky-sidebar pattern. */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-6">
            <PhotoGallery images={images} title={title} />
            {actionBar}
            {tradeBlockEl}
            {paymentBlock}
            {shippingBlockEl}
            {returnBlockEl}
          </div>
        </aside>
      </div>

      {/* --------------------------- Mobile layout --------------------------- */}
      <div className="space-y-6 lg:hidden">
        <PhotoGallery images={images} title={title} />
        {titleBlock}
        {actionBar}
        {tradeBlockEl}
        {sellerCard}

        {/* Collapsible accordion for the narrative + commerce sections.
            We intentionally split expanded/collapsed defaults per the
            spec's mobile scannability rules. */}
        <MobileCollapsibleStack
          defaultOpen={[
            "description",
            "condition",
            ...(tradeBlockEl && (mutualMatch || tradeInterest) ? ["trade"] : []),
          ]}
          sections={[
            {
              id: "description",
              label: "Description",
              content: descriptionBlock,
            },
            {
              id: "condition",
              label: `Condition${conditionLabel ? ` · ${conditionLabel}` : ""}`,
              content: conditionBlock,
            },
            {
              id: "specs",
              label: "Specifications",
              content: specsBlock,
            },
            ...(paymentBlock
              ? [{ id: "payment", label: "Payment methods", content: paymentBlock }]
              : []),
            ...(shippingBlockEl
              ? [
                  {
                    id: "shipping",
                    label: "Shipping & logistics",
                    content: shippingBlockEl,
                  },
                ]
              : []),
            ...(returnBlockEl
              ? [
                  {
                    id: "returns",
                    label: "Return policy",
                    content: returnBlockEl,
                  },
                ]
              : []),
          ]}
        />
      </div>

      {/* ------------------------- Below both columns ------------------------ */}
      <div className="mt-12 space-y-12 md:mt-16">
        <CommentsSection
          comments={comments}
          viewerIsOwner={viewerIsOwner}
          sellerDisplayName={seller.displayName}
          sellerAvatarUrl={seller.avatarUrl}
        />

        <RelatedRow
          title={`More from ${seller.displayName}`}
          items={moreFromSeller}
          trailingLink={{ href: seller.profileHref, label: "View store" }}
        />

        <RelatedRow title="You might also like" items={youMightAlsoLike} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mobile collapsible stack                                                   */
/*                                                                            */
/* Small wrapper over the Radix accordion. We strip the "already in a panel"  */
/* chrome from each inner block (the child component already renders its own  */
/* section heading, which we hide here) and render our own trigger row.       */
/* -------------------------------------------------------------------------- */
interface MobileCollapsibleSection {
  id: string
  label: string
  content: React.ReactNode
}

function MobileCollapsibleStack({
  sections,
  defaultOpen,
}: {
  sections: MobileCollapsibleSection[]
  defaultOpen: string[]
}) {
  if (sections.length === 0) return null
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className="space-y-3"
    >
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          className="overflow-hidden rounded-card border border-border bg-card"
        >
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
            {section.label}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            {/* Inner blocks ship their own SectionHeading for desktop. On
                mobile we hide it so we don't double-label the section. */}
            <MobileInnerContent>{section.content}</MobileInnerContent>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/**
 * Hides the inner `SectionHeading` (via the `mb-3` wrapper it uses) and strips
 * the panel border on mobile, so the mobile collapsible renders cleanly
 * without double chrome. We target the first child which is always the
 * heading for blocks exported from `./info-sections`.
 */
function MobileInnerContent({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        // Hide the inner SectionHeading (rendered as the first div child
        // of each section, and always containing the h2/h3).
        "[&_section>div:first-child]:hidden",
        // Panels inside already render their own borders + padding; strip
        // them when they appear inside a mobile collapsible to avoid a
        // card-in-card look. We target `[data-listing-panel]` explicitly
        // so global utility classes (e.g. the spec grid's rounded dl) are
        // left alone.
        "[&_[data-listing-panel]]:border-0! [&_[data-listing-panel]]:bg-transparent! [&_[data-listing-panel]]:p-0!",
      ].join(" ")}
    >
      {children}
    </div>
  )
}


