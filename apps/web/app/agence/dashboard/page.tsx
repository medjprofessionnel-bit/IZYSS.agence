import { prisma } from "@/lib/prisma"

async function getStats() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return { total: 0, available: 0, busy: 0 }
  const [total, available, busy] = await Promise.all([
    prisma.candidate.count({ where: { agencyId: agency.id } }),
    prisma.candidate.count({ where: { agencyId: agency.id, availability: "AVAILABLE" } }),
    prisma.candidate.count({ where: { agencyId: agency.id, availability: "BUSY" } }),
  ])
  return { total, available, busy }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1D23", margin: 0 }}>
          Bonjour, Imane 👋
        </h1>
        <p style={{ fontSize: 14, color: "#8892A4", marginTop: 4 }}>
          Voici un aperçu de votre activité — MCM Mulhouse
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <KpiCard
          icon="👥"
          label="Candidats en base"
          value={stats.total}
          color="#6C5CE7"
          bg="#F0EEFF"
        />
        <KpiCard
          icon="✅"
          label="Disponibles"
          value={stats.available}
          color="#38A169"
          bg="#F0FFF4"
        />
        <KpiCard
          icon="⚡"
          label="En mission"
          value={stats.busy}
          color="#DD6B20"
          bg="#FFFAF0"
        />
      </div>

      {/* Coming soon sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ComingSoon title="Activité récente" icon="📋" />
        <ComingSoon title="Assistant IA" icon="🤖" />
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, color, bg }: {
  icon: string; label: string; value: number; color: string; bg: string
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "24px 28px",
      border: "1.5px solid #E8EBF0",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, marginBottom: 16,
      }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#8892A4", marginTop: 6 }}>{label}</div>
    </div>
  )
}

function ComingSoon({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 28,
      border: "1.5px solid #E8EBF0",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 200, textAlign: "center",
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1D23" }}>{title}</div>
      <div style={{ fontSize: 12, color: "#B0B7C8", marginTop: 6 }}>Bientôt disponible</div>
    </div>
  )
}
