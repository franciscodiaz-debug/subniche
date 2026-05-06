"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ListingImageGalleryProps = {
  images: string[];
  title: string;
};

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];
  const hasMultipleImages = images.length > 1;
  const showPrevious = () =>
    setSelectedIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  const showNext = () =>
    setSelectedIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );

  return (
    <section
      aria-label={`${title} images`}
      className="space-y-3"
      data-testid="listing-image-gallery"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={title}
            fill
            sizes="(min-width: 1280px) 62vw, (min-width: 1024px) 54vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            Image pending
          </div>
        )}
        {hasMultipleImages ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/85 text-foreground shadow-card transition hover:border-primary/45"
              onClick={showPrevious}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/85 text-foreground shadow-card transition hover:border-primary/45"
              onClick={showNext}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
      {hasMultipleImages ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`View photo ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border bg-card transition",
                selectedIndex === index
                  ? "border-primary"
                  : "border-border hover:border-primary/45",
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <Image src={image} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
