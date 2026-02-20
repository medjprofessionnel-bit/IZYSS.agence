"use client"

import { useState, useTransition } from "react"
import { getOrCreatePortalToken, setPortalVisibility } from "./actions"

type Candidate = {
  id: string
  firstName: string
  lastName: string
  skills: string[]
  city: string | null
  experience: number | null
}

type PipelineCandidate = {
  id: string
  portalVisibility: string
  clientValidated: boolean
  clientRefused: boolean
  proposedAt: Date | null
  candidate: Candidate
}

type Pipeline = {
  id: string
  status: string
  candidates: PipelineCandidate[]
} | null

type Mission = {
  id: string
  title: string
  targetCandidates: number | null
  pipeline: Pipeline
}

type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  portalToken: string | null
  missions: Mission[]
}

const VISIBILITY_CONFIG = {
  FULL: { label: "Profil complet", icon: "👁", color: "#2ECC71", bg: "#E8F8F0", desc: "Nom, compétences, expérience visibles" },
  PARTIAL: { label: "Partiel", icon: "◐", color: "#F39C12", bg: "#FEF5E7", desc: "Nom masqué, compétences visibles" },
  ANONYMOUS: { label: "Anonymisé", icon: "🔒", color: "#6B7294", bg: "#F4F6FB", desc: "Profil entièrement anonymisé" },
}

const STATUS_PIPELINE = {
  RUNNING: { label: "En cours", color: "#4A90D9" },
  WAITING_CLIENT: { label: "Attente client", color: "#6C5CE7" },
  COMPLETED: { label: "Terminé", color: "#2ECC71" },
  WAITING_AGENCY: { label: "En attente", color: "#F39C12" },
  ALERT: { label: "Alerte", color: "#E74C3C" },
}

export function PortailAgenceClient({ clients }: { clients: Client[] }) {
  const [selectedClient, setSelectedClient] = useState<string | null>(
    clients.length > 0 ? clients[0].id : null
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Tous les candidats proposés de tous les clients
  const allProposed = clients.flatMap((c) =>
    c.missions.flatMap((m) => (m.pipeline?.candidates ?? []).map((pc) => ({ ...pc, clientName: c.name, missionTitle: m.title })))
  )

  const current = clients.find((c) => c.id === selectedClient)
  const currentCandidates = current?.missions.flatMap((m) => m.pipeline?.candidates ?? []) ?? []

  async function copyPortalLink(client: Client) {
    startTransition(async () => {
      try {
        const token = await getOrCreatePortalToken(client.id)
        const url = `${window.location.origin}/client?token=${token}`
        await navigator.clipboard.writeText(url)
        setCopiedId(client.id)
        showToast("Lien portail copié ! Partagez-le avec votre client 🔗")
        setTimeout(() => setCopiedId(null), 2000)
      } catch {
        showToast("Erreur lors de la génération du lien")
      }
    })
  }

  function handleVisibility(pcId: string, vis: "FULL" | "PARTIAL" | "ANONYMOUS") {
    startTransition(async () => {
      await setPortalVisibility(pcId, vis)
      showToast("Visibilité mise à jour ✅")
      window.location.reload()
    })
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1D23", margin: 0 }}>
          Portail Client 🏢
        </h1>
        <p style={{ fontSize: 14, color: "#8892A4", marginTop: 4 }}>
          Gérez la visibilité des profils et partagez le portail avec vos clients
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Clients actifs", value: clients.length, icon: "🏢", color: "#6C5CE7", bg: "#F0EEFF" },
          { label: "Profils proposés", value: allProposed.length, icon: "📤", color: "#4A90D9", bg: "#EBF3FC" },
          { label: "Validés par clients", value: allProposed.filter((p) => p.clientValidated).length, icon: "✅", color: "#2ECC71", bg: "#E8F8F0" },
          { label: "Refusés", value: allProposed.filter((p) => p.clientRefused).length, icon: "❌", color: "#E74C3C", bg: "#FDECEB" },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: "#fff", borderRadius: 16, padding: "20px 24px",
            border: "1.5px solid #E8EBF0",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: kpi.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, marginBottom: 12,
            }}>{kpi.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: "#8892A4", marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {clients.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 20, padding: 64, border: "1.5px solid #E8EBF0",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1D23", marginBottom: 8 }}>
            Aucun client avec des profils proposés
          </div>
          <p style={{ fontSize: 14, color: "#8892A4" }}>
            Lancez un pipeline et proposez des candidats pour les voir apparaître ici
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
          {/* Sidebar clients */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#B0B7C8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
              Clients
            </div>
            {clients.map((client) => {
              const proposed = client.missions.flatMap((m) => m.pipeline?.candidates ?? [])
              const validated = proposed.filter((p) => p.clientValidated).length
              const isActive = selectedClient === client.id

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  style={{
                    background: isActive ? "#F0EEFF" : "#fff",
                    border: `1.5px solid ${isActive ? "#6C5CE7" : "#E8EBF0"}`,
                    borderRadius: 12, padding: "14px 16px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: isActive ? "linear-gradient(135deg, #6C5CE7, #A29BFE)" : "linear-gradient(135deg, #4A90D9, #74B3F0)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: isActive ? "#6C5CE7" : "#1A1D23",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{client.name}</div>
                      <div style={{ fontSize: 11, color: "#8892A4" }}>
                        {proposed.length} profil{proposed.length > 1 ? "s" : ""} · {validated} validé{validated > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Détail client */}
          {current && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header client */}
              <div style={{
                background: "#fff", borderRadius: 16, padding: "20px 24px",
                border: "1.5px solid #E8EBF0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1D23" }}>{current.name}</div>
                  <div style={{ fontSize: 13, color: "#8892A4", marginTop: 2 }}>
                    {current.email ?? "—"} · {current.phone ?? "—"}
                  </div>
                </div>
                <button
                  onClick={() => copyPortalLink(current)}
                  disabled={isPending}
                  style={{
                    background: copiedId === current.id ? "#2ECC71" : "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                    color: "#fff", border: "none", borderRadius: 10,
                    padding: "10px 18px", fontSize: 13, fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  {copiedId === current.id ? "✅ Lien copié !" : "🔗 Copier le lien portail"}
                </button>
              </div>

              {/* Missions + candidats */}
              {current.missions.map((mission) => {
                const candidates = mission.pipeline?.candidates ?? []
                if (candidates.length === 0) return null
                const pipelineStatus = STATUS_PIPELINE[mission.pipeline?.status as keyof typeof STATUS_PIPELINE]

                return (
                  <div key={mission.id} style={{
                    background: "#fff", borderRadius: 16, border: "1.5px solid #E8EBF0",
                    overflow: "hidden",
                  }}>
                    {/* Header mission */}
                    <div style={{
                      padding: "16px 24px", borderBottom: "1px solid #F0F2F8",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1D23" }}>{mission.title}</span>
                        <span style={{ fontSize: 12, color: "#8892A4", marginLeft: 8 }}>
                          · {mission.targetCandidates ?? 1} poste{(mission.targetCandidates ?? 1) > 1 ? "s" : ""}
                        </span>
                      </div>
                      {pipelineStatus && (
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                          color: pipelineStatus.color, background: `${pipelineStatus.color}15`,
                        }}>
                          {pipelineStatus.label}
                        </span>
                      )}
                    </div>

                    {/* Candidats */}
                    <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {candidates.map((pc) => {
                        const visCfg = VISIBILITY_CONFIG[pc.portalVisibility as keyof typeof VISIBILITY_CONFIG] ?? VISIBILITY_CONFIG.ANONYMOUS

                        return (
                          <div key={pc.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: 12,
                            border: `1.5px solid ${pc.clientValidated ? "#2ECC7130" : pc.clientRefused ? "#E74C3C30" : "#E8EBF0"}`,
                            background: pc.clientValidated ? "#F0FFF4" : pc.clientRefused ? "#FFF5F5" : "#F8F9FC",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {/* Avatar */}
                              <div style={{
                                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontWeight: 700, fontSize: 14,
                              }}>
                                {pc.portalVisibility === "FULL"
                                  ? `${pc.candidate.firstName[0]}${pc.candidate.lastName[0]}`
                                  : "?"}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1D23" }}>
                                  {pc.portalVisibility === "FULL"
                                    ? `${pc.candidate.firstName} ${pc.candidate.lastName}`
                                    : pc.portalVisibility === "PARTIAL"
                                    ? `Candidat ${pc.candidate.firstName[0]}.`
                                    : "Candidat anonyme"}
                                </div>
                                <div style={{ fontSize: 12, color: "#8892A4" }}>
                                  {pc.candidate.skills.slice(0, 3).join(", ")}
                                  {pc.portalVisibility !== "ANONYMOUS" && pc.candidate.city ? ` · ${pc.candidate.city}` : ""}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {/* Statut */}
                              {pc.clientValidated && (
                                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: "#2ECC71", background: "#E8F8F0" }}>
                                  ✅ Validé
                                </span>
                              )}
                              {pc.clientRefused && (
                                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: "#E74C3C", background: "#FDECEB" }}>
                                  ❌ Refusé
                                </span>
                              )}

                              {/* Sélecteur visibilité */}
                              <div style={{ display: "flex", gap: 4 }}>
                                {(["FULL", "PARTIAL", "ANONYMOUS"] as const).map((vis) => {
                                  const cfg = VISIBILITY_CONFIG[vis]
                                  const isActive = pc.portalVisibility === vis
                                  return (
                                    <button
                                      key={vis}
                                      onClick={() => handleVisibility(pc.id, vis)}
                                      disabled={isPending}
                                      title={cfg.desc}
                                      style={{
                                        padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                                        border: `1.5px solid ${isActive ? cfg.color : "#E8EBF0"}`,
                                        background: isActive ? cfg.bg : "transparent",
                                        color: isActive ? cfg.color : "#8892A4",
                                        cursor: isPending ? "not-allowed" : "pointer",
                                        transition: "all 0.15s",
                                      }}
                                    >
                                      {cfg.icon} {cfg.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {currentCandidates.length === 0 && (
                <div style={{
                  background: "#fff", borderRadius: 16, padding: 40,
                  border: "1.5px solid #E8EBF0", textAlign: "center",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📤</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1D23", marginBottom: 6 }}>
                    Aucun profil proposé à ce client
                  </div>
                  <p style={{ fontSize: 13, color: "#8892A4" }}>
                    Lancez un pipeline et proposez des candidats depuis la page Pipeline Auto
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "#1A1D23", color: "#fff", padding: "12px 24px",
          borderRadius: 50, fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
