export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    runtime: 'nodejs',
    env: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV
    },
    timestamp: new Date().toISOString()
  })
}