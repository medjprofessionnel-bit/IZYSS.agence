"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number | string
  badgeGreen?: boolean
}

const NAV_PRINCIPAL: NavItem[] = [
  {
    href: "/agence/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: "/agence/candidats",
    label: "Candidats",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: "/agence/clients",
    label: "Clients",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

const NAV_IA: NavItem[] = [
  {
    href: "/agence/scoring",
    label: "Scoring CV",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 20V10"/>
        <path d="M18 20V4"/>
        <path d="M6 20v-4"/>
      </svg>
    ),
  },
  {
    href: "/agence/matching",
    label: "Matching",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: "/agence/relances",
    label: "Relances",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    href: "/agence/pipeline",
    label: "Pipeline Auto",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
]

const NAV_CLIENT: NavItem[] = [
  {
    href: "/agence/portail",
    label: "Portail Client",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export function AgenceSidebar({ candidateCount }: { candidateCount: number }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/agence/dashboard") return pathname === href || pathname === "/agence"
    return pathname.startsWith(href)
  }

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, bottom: 0,
      width: 260, background: "#fff",
      borderRight: "1px solid #E8EBF0",
      display: "flex", flexDirection: "column", zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 28px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #F0F2F8",
      }}>
        <div style={{
          width: 40, height: 40,
          background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "var(--font-space-mono), monospace",
          fontWeight: 700, fontSize: 15,
          boxShadow: "0 4px 14px rgba(108,92,231,0.3)",
        }}>IZ</div>
        <span style={{
          fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #6C5CE7, #4A90D9)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>IZYSS</span>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: 4,
        overflowY: "auto",
      }}>
        <NavSection label="Principal" />
        {NAV_PRINCIPAL.map((item) => (
          <NavItemEl
            key={item.href}
            item={{ ...item, badge: item.href === "/agence/candidats" ? candidateCount || undefined : item.badge }}
            active={isActive(item.href)}
          />
        ))}

        <NavSection label="Outils IA" />
        {NAV_IA.map((item) => (
          <NavItemEl key={item.href} item={item} active={isActive(item.href)} />
        ))}

        <NavSection label="Espace Client" />
        {NAV_CLIENT.map((item) => (
          <NavItemEl key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: "1px solid #F0F2F8" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: 12,
          borderRadius: 10, background: "#F4F6FB",
        }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>IM</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1D23" }}>Imane</div>
            <div style={{ fontSize: 11, color: "#8892A4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>MCM Mulhouse</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavSection({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "1.2px", color: "#B0B7C8",
      padding: "16px 12px 8px",
    }}>{label}</div>
  )
}

function NavItemEl({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 14px", borderRadius: 8,
        fontSize: 14, fontWeight: active ? 600 : 500,
        color: active ? "#6C5CE7" : "#6B7294",
        background: active ? "#F0EEFF" : "transparent",
        textDecoration: "none",
        transition: "all 0.15s",
        position: "relative",
        borderLeft: active ? "3px solid #6C5CE7" : "3px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "#F8F9FC"
          ;(e.currentTarget as HTMLElement).style.color = "#1A1D23"
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "transparent"
          ;(e.currentTarget as HTMLElement).style.color = "#6B7294"
        }
      }}
    >
      <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge !== undefined && item.badge !== 0 && (
        <span style={{
          background: item.badgeGreen ? "#38A169" : "#6C5CE7",
          color: "#fff", fontSize: 11, fontWeight: 600,
          padding: "2px 8px", borderRadius: 20, marginLeft: "auto",
        }}>{item.badge}</span>
      )}
    </Link>
  )
}
