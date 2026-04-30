"use client"

/**
 * Photo gallery for the listing detail page.
 *
 * Two presentations in one component:
 *   - Desktop/tablet (md+): stacked main image + horizontal thumbnail row.
 *     The parent column is what becomes sticky; the gallery itself is just
 *     a block so it flows naturally inside that sticky wrapper.
 *   - Mobile (<md): a swipeable horizontal carousel with dot pagination,
 *     because a thumbnail strip chews up too much vertical space here.
 *
 * Both variants share state for the active index + an "Expand" button that
 * opens a lightweight lightbox. Keyboard arrows advance when the lightbox
 * is open; Escape closes it.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react"

import { cn } from "@/lib/utils"

interface PhotoGalleryProps {
  images: string[]
  title: string
}

export function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const safeImages = images.length > 0 ? images : ["/placeholder.svg"]
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % safeImages.length)
  }, [safeImages.length])
  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  /* Keyboard nav while the lightbox is open. */
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxOpen, goNext, goPrev])

  return (
    <div className="space-y-3">
      {/* Desktop: main + thumbnail row. Hidden on mobile. */}
      <div className="hidden md:block">
        <MainStage
          src={safeImages[activeIndex]}
          alt={`${title} — photo ${activeIndex + 1}`}
          onExpand={() => setLightboxOpen(true)}
        />
        {safeImages.length > 1 ? (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {safeImages.slice(0, 5).map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === activeIndex}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border transition-colors",
                  i === activeIndex
                    ? "border-primary"
                    : "border-border hover:border-muted-foreground",
                )}
              >
                <Image
                  src={src || "/placeholder.svg"}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Mobile: swipe carousel with dots. */}
      <MobileCarousel
        images={safeImages}
        title={title}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        onExpand={() => setLightboxOpen(true)}
      />

      {lightboxOpen ? (
        <Lightbox
          images={safeImages}
          title={title}
          activeIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
          onSelect={setActiveIndex}
        />
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Desktop main stage                                                         */
/* -------------------------------------------------------------------------- */

function MainStage({
  src,
  alt,
  onExpand,
}: {
  src: string
  alt: string
  onExpand: () => void
}) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-card bg-card">
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes="(min-width: 1280px) 440px, (min-width: 768px) 50vw, 100vw"
        className="object-cover"
        priority
      />
      <button
        type="button"
        onClick={onExpand}
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-opacity hover:bg-background md:opacity-0 md:group-hover:opacity-100"
      >
        <Expand className="h-3.5 w-3.5" aria-hidden="true" />
        Expand
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mobile swipeable carousel                                                  */
/* -------------------------------------------------------------------------- */

function MobileCarousel({
  images,
  title,
  activeIndex,
  setActiveIndex,
  onExpand,
}: {
  images: string[]
  title: string
  activeIndex: number
  setActiveIndex: (i: number) => void
  onExpand: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  /* Scroll-driven index tracking. We use IntersectionObserver rather than
     scroll-snap points so we don't drift between rapid flicks. */
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const items = Array.from(scroller.querySelectorAll<HTMLElement>("[data-slide]"))
    if (items.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = Number(visible.target.getAttribute("data-index") ?? "0")
        setActiveIndex(idx)
      },
      { root: scroller, threshold: [0.5, 0.75, 0.95] },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [setActiveIndex, images.length])

  return (
    <div className="md:hidden">
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((src, i) => (
          <div
            key={src + i}
            data-slide
            data-index={i}
            className="relative aspect-[4/3] w-full flex-shrink-0 snap-center bg-card"
          >
            <Image
              src={src || "/placeholder.svg"}
              alt={`${title} — photo ${i + 1}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
            <button
              type="button"
              onClick={onExpand}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur"
              aria-label="Expand photo"
            >
              <Expand className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-muted",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Lightbox                                                                   */
/* -------------------------------------------------------------------------- */

function Lightbox({
  images,
  title,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  onSelect,
}: {
  images: string[]
  title: string
  activeIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onSelect: (i: number) => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photo viewer`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="truncate text-sm font-medium text-foreground">
          {title}
          <span className="ml-2 text-muted-foreground">
            {activeIndex + 1} / {images.length}
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        <Image
          key={activeIndex}
          src={images[activeIndex] || "/placeholder.svg"}
          alt={`${title} — photo ${activeIndex + 1}`}
          width={1600}
          height={1200}
          className="max-h-full max-w-full object-contain"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex items-center gap-2 overflow-x-auto border-t border-border px-4 py-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show photo ${i + 1}`}
              className={cn(
                "relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border transition-colors",
                i === activeIndex
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground",
              )}
            >
              <Image src={src || "/placeholder.svg"} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
