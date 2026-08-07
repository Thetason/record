import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { randomBytes } from 'crypto'
import { put, list, del } from '@vercel/blob'
import { hasBlobToken } from '@/lib/blob-storage'
import { baseUrl } from '@/lib/google-business'

// Android PWA share target: "스크린샷 캡처 → 공유 → Re:cord" lands here as a
// multipart POST from the OS share sheet. We stash the images briefly in Blob
// under an unguessable key, bounce to the import page, and the page claims
// (then purges) them — no service worker needed.
//
// iOS Safari has no share-target support; iPhone users keep the gallery
// upload flow (and Google's official API for true one-click).

const MAX_SHARE_FILES = 20
const PREFIX = 'record/share'

export async function POST(req: NextRequest) {
  const importUrl = `${baseUrl()}/dashboard/import`
  if (!hasBlobToken()) return NextResponse.redirect(importUrl, 303)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.redirect(importUrl, 303)
  }

  const files = form
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.type.startsWith('image/'))
    .slice(0, MAX_SHARE_FILES)
  if (files.length === 0) return NextResponse.redirect(importUrl, 303)

  const id = randomBytes(16).toString('hex')
  let stored = 0
  for (const [i, file] of files.entries()) {
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      await put(`${PREFIX}/${id}/${i}.${ext}`, Buffer.from(await file.arrayBuffer()), {
        access: 'public',
        addRandomSuffix: false,
        contentType: file.type,
      })
      stored++
    } catch {
      // skip the frame that failed; the rest still import
    }
  }

  if (stored === 0) return NextResponse.redirect(importUrl, 303)
  return NextResponse.redirect(`${importUrl}?shared=${id}`, 303)
}

// Claim: the import page fetches the stashed image URLs by id.
export async function GET(req: NextRequest) {
  if (!hasBlobToken()) return NextResponse.json({ urls: [] })
  const id = new URL(req.url).searchParams.get('id')
  if (!id || !/^[a-f0-9]{32}$/.test(id)) {
    return NextResponse.json({ urls: [] }, { status: 400 })
  }
  const { blobs } = await list({ prefix: `${PREFIX}/${id}/` })
  return NextResponse.json({ urls: blobs.map((b) => b.url) })
}

// Purge after the page has loaded the files into its upload list.
export async function DELETE(req: NextRequest) {
  if (!hasBlobToken()) return NextResponse.json({ ok: true })
  const id = new URL(req.url).searchParams.get('id')
  if (!id || !/^[a-f0-9]{32}$/.test(id)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const { blobs } = await list({ prefix: `${PREFIX}/${id}/` })
  if (blobs.length > 0) await del(blobs.map((b) => b.url))
  return NextResponse.json({ ok: true, purged: blobs.length })
}
