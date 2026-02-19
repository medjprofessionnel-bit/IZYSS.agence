import Link from "next/link"

export default function ClientPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#F4F6FB",
      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{
          width: 40, height: 40, background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
          borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "var(--font-space-mono), monospace",
          fontWeight: 700, fontSize: 15, boxShadow: "0 4px 14px rgba(108,92,231,0.3)",
        }}>IZ</div>
        <span style={{
          fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #6C5CE7, #4A90D9)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>IZYSS</span>
      </div>

      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 40px",
        border: "1.5px solid #E8EBF0", textAlign: "center", maxWidth: 520, width: "100%",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: "#FEF5F4",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1D23", margin: "0 0 8px" }}>
          Espace Client
        </h1>
        <p style={{ fontSize: 14, color: "#8892A4", marginBottom: 8 }}>
          Connecté en tant que
        </p>
        <span style={{
          display: "inline-block", padding: "5px 14px", borderRadius: 20,
          background: "#FEF5F4", color: "#E74C3C", fontSize: 12, fontWeight: 700,
          marginBottom: 32,
        }}>
          Philippe D. — Carrefour Supply Chain
        </span>

        <div style={{
          background: "#F4F6FB", borderRadius: 14, padding: 24,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏗️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1D23", marginBottom: 6 }}>
            Espace en cours de construction
          </div>
          <p style={{ fontSize: 13, color: "#8892A4", margin: 0 }}>
            Bientôt, consultez les profils proposés par votre agence et validez vos candidats ici.
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link
            href="/"
            style={{
              fontSize: 13, color: "#8892A4", textDecoration: "none",
            }}
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 32, fontSize: 12, color: "#9CA3C4" }}>
        Propulsé par <strong style={{ color: "#6C5CE7" }}>IZYSS</strong> — IA au service de l&apos;intérim
      </p>
    </div>
  )
}
