'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

// Desktop-only "scroll capture" assistant.
//
// The user shares the browser tab that shows their reviews (native
// getDisplayMedia permission UI) and steps through it screen by screen.
// We watch the shared pixels, detect when the view has settled on new
// content, and save a frame. Legal shape: the platform is only ever
// accessed by the logged-in user's own browser — our server never touches
// it; we just receive pixels the user already sees and chooses to share.
//
// Frames are handed to the parent as File objects so the existing upload
// flow (5-image cap, /api/ocr/multi) stays the single source of truth.

// Generous safety bound (memory) — the user scrolls as much as they want and
// we keep capturing new screens; the import page then processes them in
// 5-image batches. Not a "5 at a time" limit anymore.
const MAX_FRAMES = 60
const SAMPLE_MS = 500
const GRID = 24
// Mean absolute grayscale difference (0-255 scale) thresholds:
const STABLE_BELOW = 2.5 // current vs previous sample → view has settled
const NEW_CONTENT_ABOVE = 10 // current vs captured frames → scrolled far enough

type HelperState = 'hidden' | 'idle' | 'capturing' | 'done'

function frameSignature(video: HTMLVideoElement, work: HTMLCanvasElement): Float32Array | null {
  const ctx = work.getContext('2d', { willReadFrequently: true })
  if (!ctx || video.videoWidth === 0) return null
  work.width = GRID
  work.height = GRID
  ctx.drawImage(video, 0, 0, GRID, GRID)
  const { data } = ctx.getImageData(0, 0, GRID, GRID)
  const sig = new Float32Array(GRID * GRID)
  for (let i = 0; i < sig.length; i++) {
    const o = i * 4
    sig[i] = data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114
  }
  return sig
}

function meanDiff(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i])
  return sum / a.length
}

export function ScrollCaptureHelper({
  onCaptured,
  disabled,
}: {
  onCaptured: (files: File[]) => void
  disabled?: boolean
}) {
  // Starts hidden (nothing SSR'd), then the effect reveals it only where
  // getDisplayMedia actually exists — mobile browsers never see the button.
  const [state, setState] = useState<HelperState>('hidden')
  const [frameCount, setFrameCount] = useState(0)
  const [thumbs, setThumbs] = useState<string[]>([])
  const [note, setNote] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const finishTimerRef = useRef<number | null>(null)
  const framesRef = useRef<File[]>([])
  const thumbsRef = useRef<string[]>([])
  const prevSigRef = useRef<Float32Array | null>(null)
  const capturedSigsRef = useRef<Float32Array[]>([])
  // Incremented synchronously at capture request time — the async JPEG encode
  // means framesRef lags behind, so the frame cap is enforced on this counter.
  const requestedRef = useRef(0)
  // Session generation: bumped on every start/finish so late async encodes
  // from an old session can never leak into a new one.
  const genRef = useRef(0)
  // finish() is reachable from three paths (manual stop, frame cap, browser
  // "stop sharing") — this makes it fire exactly once per session.
  const finishedRef = useRef(true)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function') {
      setState('idle')
    }
  }, [])

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      genRef.current += 1
      finishedRef.current = true
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current)
      cleanup()
      thumbsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [cleanup])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    cleanup()
    // JPEG encoding (toBlob) is async — give in-flight frames a beat to land.
    finishTimerRef.current = window.setTimeout(() => {
      const frames = framesRef.current
      if (frames.length > 0) {
        onCaptured(frames)
        setState('done')
        setNote(`캡처 ${frames.length}장을 업로드 목록으로 보냈어요. 아래에서 "리뷰 인식하기"를 누르면 끝!`)
      } else {
        setState('idle')
        setNote('캡처된 화면이 없어요. 공유를 시작한 뒤, 리뷰 화면을 한 화면씩 멈추며 내려주세요.')
      }
    }, 400)
  }, [cleanup, onCaptured])

  const captureFrame = useCallback((video: HTMLVideoElement, sig: Float32Array, gen: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    // Register the signature synchronously so the very next sample tick
    // already dedupes against this frame (the JPEG encode below is async).
    capturedSigsRef.current = [...capturedSigsRef.current, sig]
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob || gen !== genRef.current) return
        const n = framesRef.current.length + 1
        framesRef.current = [
          ...framesRef.current,
          new File([blob], `scroll-capture-${n}.jpg`, { type: 'image/jpeg' }),
        ]
        const url = URL.createObjectURL(blob)
        thumbsRef.current = [...thumbsRef.current, url]
        setThumbs([...thumbsRef.current])
        setFrameCount(framesRef.current.length)
      },
      'image/jpeg',
      0.85
    )
    return true
  }, [])

  const start = useCallback(async () => {
    setNote('')
    genRef.current += 1
    const gen = genRef.current
    framesRef.current = []
    capturedSigsRef.current = []
    requestedRef.current = 0
    prevSigRef.current = null
    thumbsRef.current.forEach((u) => URL.revokeObjectURL(u))
    thumbsRef.current = []
    setThumbs([])
    setFrameCount(0)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 8 },
        audio: false,
        // Chromium hint: hide the Re:cord tab itself from the picker so the
        // "hall of mirrors" mistake is impossible where supported.
        selfBrowserSurface: 'exclude',
      } as DisplayMediaStreamOptions)
    } catch (e) {
      const err = e as DOMException
      setNote(
        err?.name === 'NotAllowedError'
          ? '화면 공유가 취소됐어요. 다시 시도하려면 버튼을 눌러주세요.'
          : '이 환경에서는 화면 공유를 시작할 수 없어요. 스크린샷을 직접 올려주셔도 똑같이 동작합니다.'
      )
      return
    }

    finishedRef.current = false
    streamRef.current = stream
    setState('capturing')

    const video = videoRef.current
    if (!video) {
      finish()
      return
    }
    video.srcObject = stream
    await video.play().catch(() => undefined)

    stream.getVideoTracks()[0]?.addEventListener('ended', finish)

    const work = document.createElement('canvas')
    timerRef.current = window.setInterval(() => {
      if (requestedRef.current >= MAX_FRAMES) {
        finish()
        return
      }

      const sig = frameSignature(video, work)
      if (!sig) return

      const prev = prevSigRef.current
      prevSigRef.current = sig
      if (!prev) return

      const isStable = meanDiff(sig, prev) < STABLE_BELOW
      if (!isStable) return

      const isNewContent =
        capturedSigsRef.current.length === 0 ||
        capturedSigsRef.current.every((c) => meanDiff(sig, c) > NEW_CONTENT_ABOVE)
      if (!isNewContent) return

      if (captureFrame(video, sig, gen)) {
        requestedRef.current += 1
        if (requestedRef.current >= MAX_FRAMES) finish()
      }
    }, SAMPLE_MS)
  }, [captureFrame, finish])

  if (state === 'hidden') return null

  return (
    <div className="rounded-2xl border border-[#3182f6]/20 bg-[#3182f6]/5 p-5">
      <p className="text-sm font-semibold text-gray-900">
        PC로 보고 계시다면 — 캡처도 저희가 찍어드려요
      </p>
      <p className="mt-1 text-xs leading-5 text-gray-600">
        리뷰가 열린 <b>브라우저 탭(또는 창)을 공유</b>하고, <b>한 화면씩 잠깐 멈추며</b> 끝까지 내려주세요.
        멈출 때마다 자동으로 찍고 겹치는 장면은 걸러냅니다. 리뷰가 수백 개라도 <b>스크롤만</b> 하면 돼요.
      </p>

      {state !== 'capturing' && (
        <Button
          type="button"
          onClick={start}
          disabled={disabled}
          className="mt-3 bg-[#3182f6] hover:bg-[#2b74e0]"
          size="sm"
        >
          {state === 'done' ? '다시 캡처하기' : '스크롤 캡처 시작'}
        </Button>
      )}
      {state !== 'capturing' && disabled && (
        <p className="mt-2 text-xs text-gray-500">업로드 목록이 가득 찼어요. 먼저 인식한 뒤 이어서 캡처할 수 있어요.</p>
      )}

      {state === 'capturing' && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            </span>
            <p className="text-sm font-medium text-gray-800">
              지켜보는 중 — 한 화면씩 멈추며 끝까지 내려주세요 (지금까지 {frameCount}장)
            </p>
          </div>
          <Button type="button" onClick={finish} variant="outline" size="sm" className="mt-3">
            캡처 끝내기
          </Button>
        </div>
      )}

      {thumbs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {thumbs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`자동 캡처 ${i + 1}`}
              className="h-16 w-24 rounded-lg border border-gray-200 object-cover object-top"
            />
          ))}
        </div>
      )}

      {note && <p className="mt-3 text-xs font-medium text-gray-700">{note}</p>}

      <p className="mt-3 text-[11px] leading-4 text-gray-400">
        공유 화면은 회원님 브라우저 안에서 캡처되고, &quot;리뷰 인식하기&quot;를 누른 캡처만 Re:cord에
        업로드됩니다. Re:cord 서버가 리뷰 플랫폼에 접속하는 일은 없습니다.
      </p>

      <video ref={videoRef} muted playsInline className="hidden" />
    </div>
  )
}
