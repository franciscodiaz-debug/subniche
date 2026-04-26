/* eslint-disable @next/next/no-img-element */
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
    <div className={cn("grid aspect-[4/3] grid-cols-3 gap-1", className)}>
      {images.slice(0, 3).map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={cn(
            "overflow-hidden bg-muted",
            index === 0 && "col-span-2 row-span-2",
          )}
        >
          <img src={image} alt="" className="size-full object-cover" />
        </div>
      ))}
      {images.length === 0 ? (
        <div className="col-span-3 grid size-full place-items-center bg-muted text-sm text-muted-foreground">
          Collection imagery pending
        </div>
      ) : null}
    </div>
  );
}
