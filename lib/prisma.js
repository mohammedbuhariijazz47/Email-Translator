import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
