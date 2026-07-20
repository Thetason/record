import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Legacy rows may hold a single initial (e.g. "테") in avatar columns,
// which crashes next/image. Only URL-like values are renderable.
export function toImageSrc(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed
  }
  return null
}