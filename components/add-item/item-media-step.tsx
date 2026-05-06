"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import type { SampleImage } from "@/components/add-item/types";
import { cn } from "@/lib/utils";

type ItemMediaStepProps = {
  images: SampleImage[];
  selectedImage: string;
  onSelectImage: (image: string) => void;
};

type SelectedPhoto = SampleImage & {
  id: string;
  uploaded?: boolean;
};

export function ItemMediaStep({
  images,
  onSelectImage,
  selectedImage,
}: ItemMediaStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activePhoto =
    photos.find((photo) => photo.src === selectedImage) ??
    photos[selectedIndex] ??
    null;

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  function selectPhoto(photo: SelectedPhoto, index: number) {
    setSelectedIndex(index);
    onSelectImage(photo.src);
  }

  function handleFiles(files: FileList | null) {
    const availableSlots = Math.max(0, 6 - photos.length);
    const nextPhotos = Array.from(files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, availableSlots)
      .map((file) => {
        const src = URL.createObjectURL(file);
        objectUrlsRef.current.add(src);

        return {
          id: `upload-${src}`,
          src,
          alt: file.name,
          uploaded: true,
        };
      });

    if (nextPhotos.length === 0) {
      return;
    }

    const nextIndex = photos.length;
    setPhotos([...photos, ...nextPhotos]);
    setSelectedIndex(nextIndex);
    onSelectImage(nextPhotos[0].src);
  }

  function removePhoto(index: number) {
    const removedPhoto = photos[index];
    const next = photos.filter((_, photoIndex) => photoIndex !== index);

    if (removedPhoto?.uploaded) {
      URL.revokeObjectURL(removedPhoto.src);
      objectUrlsRef.current.delete(removedPhoto.src);
    }

    const nextIndex =
      selectedIndex === index
        ? Math.max(0, index - 1)
        : selectedIndex > index
          ? selectedIndex - 1
          : selectedIndex;
    const clampedIndex = Math.min(nextIndex, Math.max(0, next.length - 1));

    setPhotos(next);
    setSelectedIndex(clampedIndex);
    onSelectImage(next[clampedIndex]?.src ?? "");
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 xl:min-h-[578px]",
        dragging && "border-primary bg-primary/5",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (event.dataTransfer.types.includes("Files")) {
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      {activePhoto ? (
        <div
          role="img"
          aria-label={`Selected photo: ${activePhoto.alt}`}
          className="aspect-square w-full rounded-lg border border-border bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${activePhoto.src}")` }}
        />
      ) : (
        <button
          type="button"
          className={cn(
            "grid aspect-square w-full place-items-center rounded-lg border border-dashed border-primary/75 bg-background text-center outline-none transition hover:border-primary hover:bg-primary/5 focus-visible:border-primary focus-visible:bg-primary/10",
            dragging && "border-primary bg-primary/10",
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <span>
            <span className="mx-auto grid size-14 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ImagePlus className="size-7" aria-hidden="true" />
            </span>
            <span className="mt-4 block text-sm font-semibold text-foreground">
              {dragging ? "Drop photos to upload" : "Add Photos"}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              JPG, PNG, or HEIC
            </span>
          </span>
        </button>
      )}

      {photos.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <div key={photo.id} className="group relative">
              <button
                type="button"
                aria-label={`View photo ${index + 1}: ${photo.alt}`}
                aria-pressed={activePhoto?.id === photo.id}
                className={cn(
                  "block size-14 rounded-md border bg-cover bg-center bg-no-repeat transition",
                  activePhoto?.id === photo.id
                    ? "border-primary"
                    : "border-border hover:border-primary/55",
                )}
                style={{ backgroundImage: `url("${photo.src}")` }}
                onClick={() => selectPhoto(photo, index)}
              />
              <button
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-card transition hover:bg-destructive/90 focus-visible:opacity-100 group-hover:opacity-100"
                onClick={() => removePhoto(index)}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          ))}
          {photos.length < 6 ? (
            <button
              type="button"
              aria-label="Add more photos"
              className="grid size-14 place-items-center rounded-md border border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />

      {images.length > 0 && photos.length === 0 ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Choose photos from your computer. You can add up to 6.
        </p>
      ) : (
        <span className="sr-only">
          {photos.length} photo{photos.length === 1 ? "" : "s"} selected
        </span>
      )}
    </section>
  );
}
