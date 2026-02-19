import Link from "next/link"

export default function PortailAgencePage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1D23", margin: 0 }}>Portail Client</h1>
        <p style={{ fontSize: 14, color: "#8892A4", marginTop: 4 }}>
          Accédez à l&apos;espace dédié à vos clients.
        </p>
      </div>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 64,
        border: "1.5px solid #E8EBF0",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", minHeight: 300,
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏢</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1D23", marginBottom: 8 }}>
          Portail Client
        </div>
        <p style={{ fontSize: 14, color: "#8892A4", marginBottom: 24, maxWidth: 400 }}>
          Partagez ce portail avec vos clients pour qu&apos;ils consultent les profils proposés et valident les candidats.
        </p>
        <Link
          href="/client"
          style={{
            display: "inline-block", padding: "12px 28px",
            background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
            color: "#fff", borderRadius: 12, fontWeight: 600, fontSize: 14,
            textDecoration: "none",
          }}
        >
          Ouvrir l&apos;Espace Client →
        </Link>
      </div>
    </div>
  )
}
