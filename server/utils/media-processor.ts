import fs from "fs/promises"
import path from "path"
import sharp from "sharp"
import { ValidationError } from "@/server/errors/client.error"

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
}

export type ProcessedMedia = {
  file_name: string
  mime_type: string
  disk: "local"
  path: string
  file_size: number
  variants: { original: string; thumbnail: string; resized: string }
}

export async function processMediaUpload(
  base64: string,
  mediableType: string,
  mediableId: string
): Promise<ProcessedMedia> {
  const match = base64.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new ValidationError("Invalid base64 format. Expected: data:<mime>;base64,<data>")

  const [, mimeType, encoded] = match
  const extension = ALLOWED_MIME_TYPES[mimeType]
  if (!extension) {
    throw new ValidationError(
      `Unsupported file type: ${mimeType}. Allowed: jpg, gif, png, webp, avif`
    )
  }

  const buffer = Buffer.from(encoded, "base64")
  const fileSize = buffer.length
  const fileId = crypto.randomUUID()
  const fileName = `${fileId}.${extension}`
  const thumbName = `${fileId}_thumb.${extension}`
  const resizedName = `${fileId}_resized.${extension}`

  const relativeDir = `media/${mediableType}/${mediableId}`
  const absoluteDir = path.join(process.cwd(), "public", relativeDir)
  const publicBase = path.join(process.cwd(), "public", "media")
  if (!absoluteDir.startsWith(publicBase + path.sep) && absoluteDir !== publicBase) {
    throw new ValidationError("Invalid mediable_type")
  }
  await fs.mkdir(absoluteDir, { recursive: true })

  const originalPath = `/${relativeDir}/${fileName}`
  const thumbnailPath = `/${relativeDir}/${thumbName}`
  const resizedPath = `/${relativeDir}/${resizedName}`

  await fs.writeFile(path.join(absoluteDir, fileName), buffer)

  try {
    await sharp(buffer)
      .resize(200, 200, { fit: "cover" })
      .toFile(path.join(absoluteDir, thumbName))

    await sharp(buffer)
      .resize(800, 600, { fit: "inside" })
      .toFile(path.join(absoluteDir, resizedName))
  } catch (err) {
    await fs.unlink(path.join(absoluteDir, fileName)).catch(() => undefined)
    throw err
  }

  return {
    file_name: fileName,
    mime_type: mimeType,
    disk: "local",
    path: originalPath,
    file_size: fileSize,
    variants: {
      original: originalPath,
      thumbnail: thumbnailPath,
      resized: resizedPath,
    },
  }
}

export async function deleteMediaFiles(
  variants: { original: string; thumbnail: string; resized: string } | null,
  fallbackPath: string
): Promise<void> {
  const filePaths = variants
    ? Object.values(variants)
    : [fallbackPath]

  const publicBase = path.join(process.cwd(), "public", "media")

  for (const filePath of filePaths) {
    const absolute = path.join(process.cwd(), "public", filePath)
    if (!absolute.startsWith(publicBase + path.sep) && absolute !== publicBase) {
      continue
    }
    await fs.unlink(absolute).catch(() => undefined)
  }
}
