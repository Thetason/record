export const FLAGS = {
  ENABLE_OCR: process.env.ENABLE_OCR !== 'false',
  ENABLE_EMAIL: process.env.ENABLE_EMAIL === 'true',
  ENABLE_PAYMENTS: process.env.ENABLE_PAYMENTS === 'true',
} as const;

