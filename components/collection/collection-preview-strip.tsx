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
  return (
    <div className={cn("grid aspect-[4/3] grid-cols-2 gap-1", className)}>
      {images.slice(0, 4).map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="relative overflow-hidden bg-muted"
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
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
