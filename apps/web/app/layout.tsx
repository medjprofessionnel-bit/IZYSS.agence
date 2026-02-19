import type { Metadata } from "next"
import { DM_Sans, Space_Mono } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "IZYSS — Plateforme IA Intérim",
  description: "Plateforme SaaS IA pour agences d'intérim",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
