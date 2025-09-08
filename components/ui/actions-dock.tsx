"use client"

import React from "react"

type Props = {
  step: 'upload' | 'review' | 'confirm'
  onBack?: () => void
  onNext?: () => void
  onSave?: () => void
  nextDisabled?: boolean
  saveDisabled?: boolean
}

export function ActionsDock({ step, onBack, onNext, onSave, nextDisabled, saveDisabled }: Props) {
  return (
    <div className="sticky bottom-4 z-20">
      <div className="mx-auto max-w-5xl rounded-2xl border border-orange-100 bg-white/95 backdrop-blur shadow-[0_10px_40px_-10px_rgba(255,107,53,0.25)] px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-gray-600">
          {step === 'upload' && '이미지를 업로드하면 자동으로 채워드려요'}
          {step === 'review' && '자동 채움 결과를 확인하고 다음 단계로 이동하세요'}
          {step === 'confirm' && '이제 저장하면 포트폴리오가 성장합니다'}
        </div>
        <div className="flex items-center gap-2">
          {step !== 'upload' && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              이전
            </button>
          )}
          {step !== 'confirm' && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className={`px-5 py-2 text-sm rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              다음
            </button>
          )}
          {step === 'confirm' && (
            <button
              onClick={onSave}
              disabled={saveDisabled}
              className={`px-5 py-2 text-sm rounded-lg text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActionsDock

