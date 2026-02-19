import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24,     // refresh toutes les 24h
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "agency_admin",
        input: false, // non modifiable depuis le client
      },
      agencyId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
