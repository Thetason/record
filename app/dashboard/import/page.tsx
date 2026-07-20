"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

type ExtractedReview = {
  platform: string
  reviewType: string
  business: string
  author: string
  rating: number | null
  date: string | null
  content: string
  confidence: number
}

type Row = ExtractedReview & { include: boolean }

const PLATFORMS = ["네이버", "카카오", "당근", "숨고", "크몽", "인스타그램", "기타"]

// Platforms whose reviews normally have no star rating — so "별점 없음" is
// correct, not a miss.
const NO_RATING_PLATFORMS = new Set(["당근", "인스타그램"])

function confidenceLabel(c: number): { text: string; className: string } {
  if (c >= 0.8) return { text: "높음", className: "bg-emerald-100 text-emerald-700" }
  if (c >= 0.6) return { text: "보통", className: "bg-amber-100 text-amber-700" }
  return { text: "확인 필요", className: "bg-rose-100 text-rose-700" }
}

export default function ImportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<"idle" | "analyzing" | "review" | "saving">("idle")
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState("")

  const onPick = useCallback((picked: FileList | null) => {
    if (!picked) return
    const images = Array.from(picked)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5)
    setFiles(images)
    setError("")
  }, [])

  const analyze = async () => {
    if (files.length === 0) return
    setStatus("analyzing")
    setError("")
    try {
      const form = new FormData()
      files.forEach((f) => form.append("images", f))
      const res = await fetch("/api/ocr/multi", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "리뷰 인식에 실패했습니다.")
      }
      const extracted: ExtractedReview[] = data.reviews || []
      if (extracted.length === 0) {
        setError("이미지에서 리뷰를 찾지 못했어요. 리뷰 목록이 잘 보이게 다시 캡처해 주세요.")
        setStatus("idle")
        return
      }
      setRows(extracted.map((r) => ({ ...r, include: true })))
      setStatus("review")
    } catch (e) {
      setError(e instanceof Error ? e.message : "리뷰 인식 중 오류가 발생했습니다.")
      setStatus("idle")
    }
  }

  const update = (idx: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  const selectedCount = rows.filter((r) => r.include).length

  const save = async () => {
    const chosen = rows.filter((r) => r.include && r.content.trim().length >= 4)
    if (chosen.length === 0) return
    setStatus("saving")
    try {
      const res = await fetch("/api/reviews/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews: chosen.map((r) => ({
            platform: r.platform,
            business: r.business,
            author: r.author,
            rating: r.rating,
            date: r.date,
            content: r.content.trim(),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "저장에 실패했습니다.")
      }
      toast({
        title: `${data.saved}개 리뷰를 가져왔어요`,
        description: data.truncated ? "플랜 한도까지만 저장했어요." : "이제 대표 후기를 골라 공개하세요.",
      })
      router.push("/dashboard/reviews")
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.")
      setStatus("review")
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/dashboard/reviews" className="text-sm text-gray-500 hover:text-gray-700">
            ← 대표 후기로 돌아가기
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">리뷰 한 번에 가져오기</h1>
          <p className="mt-1 text-sm text-gray-600">
            리뷰를 하나씩 찍지 마세요. 리뷰 화면을 쭉 스크롤 캡처해서 올리면, 여러 개를 한 번에 정리해 드려요.
          </p>
        </div>

        {status === "idle" && (
          <>
            <Card className="mb-4 border-[#FF6B35]/20 bg-[#FF6B35]/5">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-gray-900">이렇게 캡처하세요</p>
                <ol className="mt-2 space-y-1.5 text-sm leading-6 text-gray-700">
                  <li>1. 네이버·카카오·당근·숨고·크몽 등에서 <b>내 리뷰 목록 화면</b>을 엽니다.</li>
                  <li>2. 휴대폰 <b>스크롤 캡처</b>(아이폰: 전체 페이지 · 삼성: 길게 캡처)로 리뷰가 많이 담기게 찍어요.</li>
                  <li>3. 캡처 1~5장을 아래에 올리면 끝. 나머지는 저희가 정리합니다.</li>
                </ol>
                <p className="mt-3 text-xs leading-5 text-gray-500">
                  플랫폼마다 형식이 달라도 괜찮아요. 네이버·카카오·당근·숨고·크몽을 <b>섞어서 올려도</b> 각 리뷰가 어느 플랫폼인지 알아서 구분하고, 당근처럼 별점이 없는 후기는 별점 없이 그대로 가져옵니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    onPick(e.dataTransfer.files)
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-[#FF6B35] hover:bg-[#FF6B35]/5"
                >
                  <p className="text-sm font-medium text-gray-800">캡처 이미지를 여기에 올려주세요</p>
                  <p className="mt-1 text-xs text-gray-500">클릭하거나 끌어다 놓기 · 최대 5장</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onPick(e.target.files)}
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-700">{files.length}장 선택됨</p>
                    <div className="flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          {f.name.length > 20 ? f.name.slice(0, 20) + "…" : f.name}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={analyze}
                      className="mt-4 w-full bg-[#FF6B35] hover:bg-[#E55A2B]"
                    >
                      리뷰 인식하기
                    </Button>
                  </div>
                )}

                {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
              </CardContent>
            </Card>
          </>
        )}

        {status === "analyzing" && (
          <Card>
            <CardContent className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B35]" />
              <p className="mt-4 text-sm font-medium text-gray-800">리뷰를 읽고 있어요…</p>
              <p className="mt-1 text-xs text-gray-500">캡처 한 장에서 여러 리뷰를 한 번에 정리하는 중입니다.</p>
            </CardContent>
          </Card>
        )}

        {(status === "review" || status === "saving") && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                <b>{rows.length}개</b> 리뷰를 찾았어요 · 선택 <b>{selectedCount}개</b>
              </p>
              <button
                onClick={() => setRows((prev) => prev.map((r) => ({ ...r, include: true })))}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                전체 선택
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((r, idx) => {
                const conf = confidenceLabel(r.confidence)
                return (
                  <Card key={idx} className={r.include ? "" : "opacity-50"}>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={r.include}
                            onChange={(e) => update(idx, { include: e.target.checked })}
                            className="h-4 w-4 accent-[#FF6B35]"
                          />
                          <span className="text-gray-600">가져오기</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          {r.reviewType && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {r.reviewType}
                            </span>
                          )}
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${conf.className}`}>
                            정확도 {conf.text}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <select
                          value={r.platform}
                          onChange={(e) => update(idx, { platform: e.target.value })}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        >
                          {PLATFORMS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={r.author}
                          placeholder="작성자"
                          onChange={(e) => update(idx, { author: e.target.value })}
                          className="h-9 text-sm"
                        />
                        <select
                          value={r.rating ?? ""}
                          onChange={(e) =>
                            update(idx, { rating: e.target.value ? Number(e.target.value) : null })
                          }
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        >
                          <option value="">
                            {NO_RATING_PLATFORMS.has(r.platform) ? "별점 없음 (정상)" : "별점 없음"}
                          </option>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              ⭐ {n}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={r.date ?? ""}
                          placeholder="YYYY-MM-DD"
                          onChange={(e) => update(idx, { date: e.target.value || null })}
                          className="h-9 text-sm"
                        />
                      </div>

                      <Textarea
                        value={r.content}
                        onChange={(e) => update(idx, { content: e.target.value })}
                        rows={3}
                        className="mt-2 text-sm"
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

            <div className="sticky bottom-4 mt-4">
              <Button
                onClick={save}
                disabled={selectedCount === 0 || status === "saving"}
                className="w-full bg-[#FF6B35] py-6 text-base shadow-lg hover:bg-[#E55A2B]"
              >
                {status === "saving" ? "저장 중…" : `${selectedCount}개 리뷰 전부 추가`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
