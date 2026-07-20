export const LAUNCH_OFFER_MAX_USERS = 100
export const LAUNCH_OFFER_TRIAL_MONTHS = 3
export const LAUNCH_OCR_IMPORT_LIMIT = 30
export const LAUNCH_OFFER_START_AT_FALLBACK = '2026-04-17T00:00:00+09:00'

export type LaunchOfferSnapshot = {
  active: boolean
  claimed: number
  remaining: number
  maxUsers: number
  trialMonths: number
  ocrImportLimit: number
  startAt: string
}
