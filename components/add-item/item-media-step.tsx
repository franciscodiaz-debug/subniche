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
  const selected = images.find((image) => image.src === selectedImage);

  return (
    <FormSection
      title="Photos"
      description="Choose sample photos for this prototype. Real upload and ordering will connect later."
    >
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {selected ? (
          <Image
            src={selected.src}
            alt={selected.alt}
            width={720}
            height={540}
            sizes="(min-width: 1280px) 420px, 100vw"
            className="aspect-square w-full object-cover"
            style={{ objectPosition: "center bottom" }}
          />
        ) : (
          <div className="grid aspect-square place-items-center border border-dashed border-border text-center">
            <div>
              <ImagePlus
                className="mx-auto size-8 text-accent"
                aria-hidden="true"
              />
              <div className="mt-3 text-sm font-semibold text-foreground">
                Add Photos
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((image) => {
          const active = selectedImage === image.src;

          return (
            <button
              key={image.src}
              type="button"
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-background text-left transition hover:border-accent/45",
                active && "border-accent shadow-card",
              )}
              aria-pressed={active}
              onClick={() => onSelectImage(image.src)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="80px"
                className="object-cover"
                style={{ objectPosition: "center bottom" }}
              />
            </button>
          );
        })}
        <button
          type="button"
          className="grid size-20 shrink-0 place-items-center rounded-lg border border-dashed border-border bg-background text-muted-foreground transition hover:border-accent/45 hover:text-foreground"
          aria-label="Add another photo"
        >
          <ImagePlus className="size-5" aria-hidden="true" />
        </button>
      </div>
    </FormSection>
  );
}
