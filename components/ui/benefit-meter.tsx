"use client"

import React from "react"

type Props = {
  totalReviews: number
  trustScore: number // 0-100
  completeness: number // 0-100
}

export function BenefitMeter({ totalReviews, trustScore, completeness }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 mb-1">누적 리뷰</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">{totalReviews}</span>
          <span className="text-xs text-gray-500">개</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">신뢰지수</p>
        <div className="h-2 w-full rounded-full bg-orange-50 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#FF6B35] via-[#FF8A64] to-[#FFB199]"
            style={{ width: `${Math.max(0, Math.min(100, trustScore))}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-600">{trustScore}%</div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">포트폴리오 완성도</p>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
            style={{ width: `${Math.max(0, Math.min(100, completeness))}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-600">{completeness}%</div>
      </div>
    </div>
  )
}

export default BenefitMeter

