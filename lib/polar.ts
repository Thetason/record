import { Polar } from '@polar-sh/sdk'

// Lazy initialization - only create Polar instance when needed
let polarInstance: Polar | null = null

export function getPolar(): Polar {
  if (!polarInstance) {
    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error('POLAR_ACCESS_TOKEN is not set. Please configure Polar.sh credentials.')
    }
    polarInstance = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    })
  }
  return polarInstance
}

export function getPolarConfig() {
  if (!process.env.POLAR_ORGANIZATION_ID || 
      !process.env.POLAR_PREMIUM_PRODUCT_ID || 
      !process.env.POLAR_BUSINESS_PRODUCT_ID) {
    throw new Error('Polar configuration is incomplete. Please set all required environment variables.')
  }
  
  return {
    organizationId: process.env.POLAR_ORGANIZATION_ID,
    products: {
      premium: process.env.POLAR_PREMIUM_PRODUCT_ID,
      business: process.env.POLAR_BUSINESS_PRODUCT_ID,
    }
  }
}

// For backward compatibility
export const polar = getPolar
export const POLAR_CONFIG = getPolarConfig
