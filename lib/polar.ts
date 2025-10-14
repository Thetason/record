import { Polar } from '@polar-sh/sdk'

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error('POLAR_ACCESS_TOKEN is not set')
}

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
})

export const POLAR_CONFIG = {
  organizationId: process.env.POLAR_ORGANIZATION_ID!,
  products: {
    premium: process.env.POLAR_PREMIUM_PRODUCT_ID!,
    business: process.env.POLAR_BUSINESS_PRODUCT_ID!,
  }
}
