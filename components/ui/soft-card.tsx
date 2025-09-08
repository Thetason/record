"use client"

import React from "react"

type Props = React.PropsWithChildren<{
  className?: string
  title?: string
  description?: string
  headerRight?: React.ReactNode
}>

export function SoftCard({ className = "", title, description, headerRight, children }: Props) {
  return (
    <div className={
      [
        "rounded-2xl border border-orange-100 bg-white",
        "shadow-[0_10px_30px_-10px_rgba(255,107,53,0.15)]",
        "transition-colors",
        className,
      ].join(" ")
    }>
      {(title || description) && (
        <div className="px-5 py-4 border-b border-orange-50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
          {headerRight}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export default SoftCard

