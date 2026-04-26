"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { FormSection } from "@/components/add-item/form-section";
import type { SampleImage } from "@/components/add-item/types";
import { cn } from "@/lib/utils";

type ItemMediaStepProps = {
  images: SampleImage[];
  selectedImage: string;
  onSelectImage: (image: string) => void;
};

export function ItemMediaStep({
  images,
  onSelectImage,
  selectedImage,
}: ItemMediaStepProps) {
  return (
    <FormSection
      eyebrow="Photos"
      title="Choose a sample image"
      description="Photo upload will connect in the production build. For now, choose a sample image."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => {
          const selected = selectedImage === image.src;

          return (
            <button
              key={image.src}
              type="button"
              className={cn(
                "overflow-hidden rounded-xl border border-border bg-background text-left transition hover:border-accent/45",
                selected && "border-accent shadow-card",
              )}
              aria-pressed={selected}
              onClick={() => onSelectImage(image.src)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={320}
                height={240}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
        <ImagePlus className="size-5 text-accent" aria-hidden="true" />
        Real upload, drag-and-drop, and image ordering will be wired later.
      </div>
    </FormSection>
  );
}
