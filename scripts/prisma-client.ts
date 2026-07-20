import { createRequire } from 'module'
import type { PrismaClient as PrismaClientInstance } from '@prisma/client'

type PrismaClientConstructor = new (...args: unknown[]) => PrismaClientInstance

const shouldUseDevClient =
  process.env.NODE_ENV === 'development' ||
  process.env.DATABASE_URL?.startsWith('file:') === true

const runtimeRequire = createRequire(import.meta.url)

export const PrismaClient = (
  shouldUseDevClient
    ? runtimeRequire('../prisma/generated/dev-client').PrismaClient
    : runtimeRequire('@prisma/client').PrismaClient
) as PrismaClientConstructor
