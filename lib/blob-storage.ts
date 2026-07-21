import { put } from '@vercel/blob'
import crypto from 'crypto'

// Images used to be stored as base64 data URIs inside DB columns, which made
// the public profile SSR payload ~12MB. Everything image-shaped now goes to
// Vercel Blob and only the (short) URL is persisted.
//
// Without BLOB_READ_WRITE_TOKEN (e.g. bare local dev) these helpers degrade
// gracefully and return the original value, so nothing breaks — it just stays
// on the legacy base64 path until the token is configured.

const DATA_URI_RE = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/

export function isDataUri(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith('data:image/'))
}

function extFromMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  return 'jpg'
}

export function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export async function uploadBufferToBlob(
  buffer: Buffer,
  contentType: string,
  keyHint: string
): Promise<string> {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16)
  const key = `record/${keyHint}/${hash}.${extFromMime(contentType)}`
  const blob = await put(key, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false // same content → same key → natural dedupe
  })
  return blob.url
}

// If value is a base64 data URI, upload it and return the blob URL.
// Any other value (already a URL, empty, null) passes through untouched.
export async function ensureBlobUrl(
  value: string | null | undefined,
  keyHint: string
): Promise<string | null | undefined> {
  if (!value || !isDataUri(value) || !hasBlobToken()) return value
  const match = value.match(DATA_URI_RE)
  if (!match) return value
  try {
    const buffer = Buffer.from(match[2], 'base64')
    if (buffer.length === 0) return value
    return await uploadBufferToBlob(buffer, match[1], keyHint)
  } catch (error) {
    console.error('blob upload failed; keeping original value:', error)
    return value
  }
}

export async function ensureBlobUrls(
  values: string[] | undefined,
  keyHint: string
): Promise<string[] | undefined> {
  if (!values || values.length === 0) return values
  return Promise.all(values.map(async (v) => (await ensureBlobUrl(v, keyHint)) as string))
}
