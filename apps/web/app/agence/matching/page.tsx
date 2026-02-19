export default function MatchingPage() {
  return <PlaceholderPage title="Matching IA" icon="⚡" desc="Trouvez les meilleurs profils pour chaque mission grâce à l'IA." />
}

function PlaceholderPage({ title, icon, desc }: { title: string; icon: string; desc: string }) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1D23", margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 14, color: "#8892A4", marginTop: 4 }}>{desc}</p>
      </div>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 64,
        border: "1.5px solid #E8EBF0",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", minHeight: 400,
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1D23", marginBottom: 8 }}>
          {title}
        </div>
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 20,
          background: "#F0EEFF", color: "#6C5CE7", fontSize: 12, fontWeight: 600,
        }}>
          En cours de développement
        </div>
      </div>
    </div>
  )
}
