import Image from "next/image"

import { cn } from "@/lib/utils"

interface SubnicheLogoProps {
  className?: string
  /** Pixel width of the rendered logo. Height auto-scales to preserve the 117:36 ratio. */
  width?: number
  height?: number
  /** When true, applies the white/light treatment used on dark backgrounds. */
  light?: boolean
  priority?: boolean
}

export function SubnicheLogo({
  className,
  width = 117,
  height = 36,
  light = true,
  priority = false,
}: SubnicheLogoProps) {
  return (
    <Image
      src="/images/subniche-logo.svg"
      alt="SubNiche"
      width={width}
      height={height}
      className={cn("h-auto w-auto select-none", className)}
      style={light ? { filter: "brightness(0) invert(1)" } : undefined}
      priority={priority}
    />
  )
}
