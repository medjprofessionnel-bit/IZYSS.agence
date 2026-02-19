import { NextResponse } from "next/server"

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test 1 : variables d'environnement
  results.env = {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "MISSING",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "SET" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 40) + "..." : "MISSING",
  }

  // Test 2 : Prisma
  try {
    const { prisma } = await import("@/lib/prisma")
    const count = await prisma.user.count()
    results.prisma = { ok: true, userCount: count }
  } catch (e: unknown) {
    results.prisma = { ok: false, error: e instanceof Error ? e.message : String(e) }
  }

  // Test 3 : Better Auth init
  try {
    const { auth } = await import("@/lib/auth")
    results.betterAuth = { ok: true, type: typeof auth }
  } catch (e: unknown) {
    results.betterAuth = { ok: false, error: e instanceof Error ? e.message : String(e) }
  }

  return NextResponse.json(results)
}
