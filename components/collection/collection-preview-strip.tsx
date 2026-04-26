import Image from "next/image";
import { cn } from "@/lib/utils";

type CollectionPreviewStripProps = {
  images: string[];
  className?: string;
};

export function CollectionPreviewStrip({
  images,
  className,
}: CollectionPreviewStripProps) {
  const imageCount = images.length;
  const previewImages =
    imageCount > 1
      ? Array.from({ length: 4 }, (_, index) => images[index % imageCount])
      : images;

  return (
    <div className={cn("grid aspect-[4/3] grid-cols-2 gap-1", className)}>
      {previewImages.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={cn(
            "relative overflow-hidden bg-muted",
            imageCount === 1 && "col-span-2 row-span-2",
          )}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: "center bottom" }}
          />
        </div>
      ))}
      {images.length === 0 ? (
        <div className="col-span-2 grid size-full place-items-center bg-muted text-sm text-muted-foreground">
          Collection imagery pending
        </div>
      ) : null}
    </div>
  );
}
