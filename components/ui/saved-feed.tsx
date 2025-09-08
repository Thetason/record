"use client"

import React from "react"

type Item = {
  id: string
  previewUrl: string
  platform: string
  rating: number
  author: string
  reviewDate: string
  businessName: string
  content: string
}

export function SavedFeed({ items }: { items: Item[] }) {
  const top3 = items.slice(0, 3)
  if (top3.length === 0) {
    return (
      <div className="text-xs text-gray-500">아직 저장된 항목이 없습니다.</div>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {top3.map((it, idx) => (
        <div key={it.id} className="relative rounded-lg overflow-hidden border border-gray-200">
          <img src={it.previewUrl} alt={it.businessName} className="h-20 w-full object-cover" />
          <div className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 border">
            {idx + 1}
          </div>
          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500 text-white">
              {it.platform}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 border">★ {it.rating}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SavedFeed

