"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh", background: "#F4F6FB",
      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <div style={{
          width: 48, height: 48, background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
          borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "var(--font-space-mono), monospace",
          fontWeight: 700, fontSize: 18, boxShadow: "0 4px 24px rgba(108,92,231,0.25)",
        }}>IZ</div>
        <span style={{
          fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #6C5CE7, #4A90D9)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>IZYSS</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1D2E", margin: 0 }}>
          Bienvenue sur le Portail IZYSS
        </h1>
        <p style={{ fontSize: 14, color: "#6B7294", marginTop: 8 }}>
          Choisissez votre espace pour accéder à vos outils
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%", maxWidth: 640 }}>
        <RoleCard
          href="/agence"
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          }
          iconBg="#F0EEFF"
          hoverColor="#6C5CE7"
          hoverShadow="rgba(108,92,231,0.12)"
          title="Espace Agence"
          desc="Gérez vos candidats, lancez des missions et suivez vos placements."
          badge="Imane — MCM Mulhouse"
          badgeBg="#F0EEFF"
          badgeColor="#6C5CE7"
        />
        <RoleCard
          href="/client"
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
          iconBg="#FEF5F4"
          hoverColor="#E74C3C"
          hoverShadow="rgba(231,76,60,0.1)"
          title="Espace Client"
          desc="Consultez les candidats proposés, donnez votre avis et faites vos demandes."
          badge="Philippe D. — Carrefour Supply Chain"
          badgeBg="#FEF5F4"
          badgeColor="#E74C3C"
        />
      </div>

      <p style={{ marginTop: 48, fontSize: 12, color: "#9CA3C4" }}>
        Propulsé par <strong style={{ color: "#6C5CE7" }}>IZYSS</strong> — IA au service de l&apos;intérim
      </p>
    </div>
  )
}

function RoleCard({ href, icon, iconBg, hoverColor, hoverShadow, title, desc, badge, badgeBg, badgeColor }: {
  href: string; icon: React.ReactNode; iconBg: string; hoverColor: string; hoverShadow: string
  title: string; desc: string; badge: string; badgeBg: string; badgeColor: string
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff", border: "2px solid #E8ECF4", borderRadius: 20,
          padding: "36px 28px", cursor: "pointer", textAlign: "center",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = hoverColor
          el.style.boxShadow = `0 12px 40px ${hoverShadow}`
          el.style.transform = "translateY(-4px)"
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = "#E8ECF4"
          el.style.boxShadow = "none"
          el.style.transform = "translateY(0)"
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>{icon}</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A1D2E", marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "#6B7294", lineHeight: 1.6, margin: 0 }}>{desc}</p>
        <span style={{
          display: "inline-block", marginTop: 18, padding: "5px 14px", borderRadius: 20,
          background: badgeBg, color: badgeColor, fontSize: 11.5, fontWeight: 700,
        }}>{badge}</span>
      </div>
    </Link>
  )
}
