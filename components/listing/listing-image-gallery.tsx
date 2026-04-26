/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ListingImageGalleryProps = {
  images: string[];
  title: string;
};

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  return (
    <section aria-label={`${title} images`} className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={title}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            Image pending
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Show image ${index + 1} for ${title}`}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-lg border bg-muted transition",
                selectedIndex === index
                  ? "border-accent"
                  : "border-border hover:border-accent/45",
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
