/* eslint-disable @next/next/no-img-element */
import type { HTMLAttributes, ImgHTMLAttributes } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className={cn("size-full object-cover", className)}
      alt={alt}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid size-full place-items-center text-sm font-semibold",
        className,
      )}
      {...props}
    >
      {children ?? <User className="size-4" aria-hidden="true" />}
    </div>
  );
}
