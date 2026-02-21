"use client"

import { useState, useTransition } from "react"
import { getOrCreatePortalToken, setPortalVisibility, proposeToPortalAction } from "./actions"

type Candidate = {
  id: string
  firstName: string
  lastName: string
  skills: string[]
  city: string | null
  experience: number | null
}

type CvthequeCandidate = {
  id: string
  firstName: string
  lastName: string
  skills: string[]
  city: string | null
  experience: number | null
  availability: string
}

type PipelineCandidate = {
  id: string
  portalVisibility: string
  clientValidated: boolean
  clientRefused: boolean
  clientComment: string | null
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
  FULL: { label: "Complet", icon: "👁", color: "#2ECC71", bg: "#E8F8F0", desc: "Nom + compétences visibles" },
  PARTIAL: { label: "Anonymisé", icon: "🔒", color: "#6C5CE7", bg: "#F0EEFF", desc: "Coordonnées masquées, compétences visibles" },
  ANONYMOUS: { label: "Masqué", icon: "⊘", color: "#6B7294", bg: "#F4F6FB", desc: "Profil entièrement masqué" },
}

const STATUS_PIPELINE = {
  RUNNING: { label: "En cours", color: "#4A90D9" },
  WAITING_CLIENT: { label: "Attente client", color: "#6C5CE7" },
  COMPLETED: { label: "Terminé", color: "#2ECC71" },
  WAITING_AGENCY: { label: "En attente", color: "#F39C12" },
  ALERT: { label: "Alerte", color: "#E74C3C" },
}

export function PortailAgenceClient({
  clients,
  candidates,
}: {
  clients: Client[]
  candidates: CvthequeCandidate[]
}) {
  const [selectedClient, setSelectedClient] = useState<string | null>(
    clients.length > 0 ? clients[0].id : null
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null)

  // Modal proposer un candidat
  const [showProposerModal, setShowProposerModal] = useState(false)
  const [proposerSearch, setProposerSearch] = useState("")
  const [selectedMissionId, setSelectedMissionId] = useState("")
  const [proposingId, setProposingId] = useState<string | null>(null)

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const allProposed = clients.flatMap((c) =>
    c.missions.flatMap((m) => (m.pipeline?.candidates ?? []).map((pc) => ({ ...pc, clientName: c.name, missionTitle: m.title })))
  )

  const current = clients.find((c) => c.id === selectedClient)
  const currentCandidates = current?.missions.flatMap((m) => m.pipeline?.candidates ?? []) ?? []
  const currentMissions = current?.missions ?? []

  function openProposerModal() {
    setShowProposerModal(true)
    setProposerSearch("")
    setSelectedMissionId(currentMissions[0]?.id ?? "")
  }

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
        showToast("Erreur lors de la génération du lien", "error")
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

  function handlePropose(candidateId: string) {
    if (!selectedMissionId) return
    setProposingId(candidateId)
    startTransition(async () => {
      try {
        await proposeToPortalAction(candidateId, selectedMissionId)
        showToast("Candidat proposé au portail client ✅")
        setShowProposerModal(false)
        window.location.reload()
      } catch {
        showToast("Erreur lors de la proposition", "error")
        setProposingId(null)
      }
    })
  }

  // Candidats filtrés dans la modal (exclure déjà proposés à ce client)
  const alreadyProposedIds = new Set(
    currentCandidates.map((pc) => pc.candidate.id)
  )
  const filteredCandidates = candidates.filter((c) => {
    const q = proposerSearch.toLowerCase()
    const match =
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q))
    return match
  })

  const availColor = (a: string) => {
    if (a === "AVAILABLE") return { label: "Disponible", color: "#2ECC71", bg: "#E8F8F0" }
    if (a === "BUSY") return { label: "En mission", color: "#F39C12", bg: "#FEF5E7" }
    return { label: "Indisponible", color: "#E74C3C", bg: "#FDECEB" }
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1D23", margin: 0 }}>
          Portail Client 🏢
        </h1>
        <p style={{ fontSize: 14, color: "#8892A4", marginTop: 4 }}>
          Proposez des candidats à vos clients et partagez leur espace en un clic
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
            Aucun client configuré
          </div>
          <p style={{ fontSize: 14, color: "#8892A4" }}>
            Ajoutez des clients depuis le Pipeline Auto pour commencer
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
                        {proposed.length} profil{proposed.length !== 1 ? "s" : ""} · {validated} validé{validated !== 1 ? "s" : ""}
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
                <div style={{ display: "flex", gap: 10 }}>
                  {/* Bouton Proposer un candidat */}
                  {currentMissions.length > 0 && (
                    <button
                      onClick={openProposerModal}
                      style={{
                        background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                        color: "#fff", border: "none", borderRadius: 10,
                        padding: "10px 18px", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      📤 Proposer un candidat
                    </button>
                  )}
                  {/* Bouton copier lien */}
                  <button
                    onClick={() => copyPortalLink(current)}
                    disabled={isPending}
                    style={{
                      background: copiedId === current.id ? "#2ECC71" : "#fff",
                      color: copiedId === current.id ? "#fff" : "#6C5CE7",
                      border: `1.5px solid ${copiedId === current.id ? "#2ECC71" : "#6C5CE7"}`,
                      borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600,
                      cursor: isPending ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    {copiedId === current.id ? "✅ Lien copié !" : "🔗 Lien portail"}
                  </button>
                </div>
              </div>

              {/* Missions + candidats proposés */}
              {current.missions.map((mission) => {
                const missionCandidates = mission.pipeline?.candidates ?? []
                if (missionCandidates.length === 0) return null
                const pipelineStatus = STATUS_PIPELINE[mission.pipeline?.status as keyof typeof STATUS_PIPELINE]

                return (
                  <div key={mission.id} style={{
                    background: "#fff", borderRadius: 16, border: "1.5px solid #E8EBF0",
                    overflow: "hidden",
                  }}>
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

                    <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {missionCandidates.map((pc) => {
                        const visCfg = VISIBILITY_CONFIG[pc.portalVisibility as keyof typeof VISIBILITY_CONFIG] ?? VISIBILITY_CONFIG.PARTIAL

                        return (
                          <div key={pc.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: 12,
                            border: `1.5px solid ${pc.clientValidated ? "#2ECC7130" : pc.clientRefused ? "#E74C3C30" : "#E8EBF0"}`,
                            background: pc.clientValidated ? "#F0FFF4" : pc.clientRefused ? "#FFF5F5" : "#F8F9FC",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontWeight: 700, fontSize: 14,
                              }}>
                                {`${pc.candidate.firstName[0]}${pc.candidate.lastName[0]}`}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1D23" }}>
                                  {pc.candidate.firstName} {pc.candidate.lastName}
                                </div>
                                <div style={{ fontSize: 12, color: "#8892A4" }}>
                                  {pc.candidate.skills.slice(0, 3).join(", ")}
                                  {pc.candidate.experience ? ` · ${pc.candidate.experience} ans` : ""}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

                              {/* Visibilité */}
                              <div style={{ display: "flex", gap: 4 }}>
                                {(["FULL", "PARTIAL", "ANONYMOUS"] as const).map((vis) => {
                                  const cfg = VISIBILITY_CONFIG[vis]
                                  const isActiveVis = pc.portalVisibility === vis
                                  return (
                                    <button
                                      key={vis}
                                      onClick={() => handleVisibility(pc.id, vis)}
                                      disabled={isPending}
                                      title={cfg.desc}
                                      style={{
                                        padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                                        border: `1.5px solid ${isActiveVis ? cfg.color : "#E8EBF0"}`,
                                        background: isActiveVis ? cfg.bg : "transparent",
                                        color: isActiveVis ? cfg.color : "#8892A4",
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

                            {/* Commentaire client */}
                            {pc.clientComment && (
                              <div style={{
                                marginTop: 10, padding: "10px 14px", borderRadius: 10,
                                background: "#F8F6FF", border: "1px solid #E0DBFF",
                                display: "flex", alignItems: "flex-start", gap: 8,
                              }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>💬</span>
                                <div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6C5CE7", display: "block", marginBottom: 2 }}>
                                    Commentaire client
                                  </span>
                                  <span style={{ fontSize: 12, color: "#4A5568", fontStyle: "italic" }}>
                                    &ldquo;{pc.clientComment}&rdquo;
                                  </span>
                                </div>
                              </div>
                            )}
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
                  border: "1.5px dashed #D0D5E8", textAlign: "center",
                }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📤</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1D23", marginBottom: 6 }}>
                    Aucun profil proposé à {current.name}
                  </div>
                  <p style={{ fontSize: 13, color: "#8892A4", marginBottom: 20 }}>
                    Cliquez sur &quot;Proposer un candidat&quot; pour envoyer des profils
                  </p>
                  {currentMissions.length > 0 && (
                    <button
                      onClick={openProposerModal}
                      style={{
                        background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                        color: "#fff", border: "none", borderRadius: 10,
                        padding: "11px 22px", fontSize: 14, fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      📤 Proposer un candidat
                    </button>
                  )}
                  {currentMissions.length === 0 && (
                    <p style={{ fontSize: 12, color: "#E74C3C" }}>
                      Ce client n&apos;a pas de mission ouverte
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ MODAL PROPOSER UN CANDIDAT ═══ */}
      {showProposerModal && current && (
        <div
          onClick={() => setShowProposerModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 20, width: "100%", maxWidth: 680,
              maxHeight: "85vh", display: "flex", flexDirection: "column",
              overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header modal */}
            <div style={{ padding: "24px 28px", borderBottom: "1.5px solid #E8EBF0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1A1D23" }}>
                    Proposer un candidat
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8892A4" }}>
                    à <strong style={{ color: "#1A1D23" }}>{current.name}</strong> — coordonnées masquées côté client
                  </p>
                </div>
                <button
                  onClick={() => setShowProposerModal(false)}
                  style={{
                    background: "#F4F6FB", border: "none", borderRadius: 8,
                    width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#8892A4",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✕</button>
              </div>

              {/* Sélection mission + recherche */}
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  value={selectedMissionId}
                  onChange={(e) => setSelectedMissionId(e.target.value)}
                  style={{
                    padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8EBF0",
                    fontSize: 13, color: "#1A1D23", background: "#F4F6FB",
                    outline: "none", flexShrink: 0,
                  }}
                >
                  {currentMissions.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                <input
                  value={proposerSearch}
                  onChange={(e) => setProposerSearch(e.target.value)}
                  placeholder="Rechercher par nom, compétence, ville..."
                  style={{
                    flex: 1, padding: "9px 14px", borderRadius: 8,
                    border: "1.5px solid #E8EBF0", fontSize: 13,
                    outline: "none", background: "#F4F6FB",
                  }}
                />
              </div>

              {/* Bandeau anonymisation */}
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 10,
                background: "#F0EEFF", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <span style={{ fontSize: 12, color: "#6C5CE7", fontWeight: 500 }}>
                  Nom, email, téléphone et ville seront masqués — seuls les compétences et l&apos;expérience sont visibles par le client
                </span>
              </div>
            </div>

            {/* Liste candidats */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px" }}>
              {filteredCandidates.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#8892A4" }}>
                  {candidates.length === 0
                    ? "Aucun candidat dans votre CVthèque"
                    : `Aucun résultat pour "${proposerSearch}"`}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredCandidates.map((c) => {
                    const avail = availColor(c.availability)
                    const alreadyProposed = alreadyProposedIds.has(c.id)
                    const isProposing = proposingId === c.id

                    return (
                      <div
                        key={c.id}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "14px 16px", borderRadius: 12,
                          border: `1.5px solid ${alreadyProposed ? "#E8F8F0" : "#E8EBF0"}`,
                          background: alreadyProposed ? "#F0FFF4" : "#fff",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                            background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: 14,
                          }}>
                            {c.firstName[0]}{c.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1D23" }}>
                              {c.firstName} {c.lastName}
                            </div>
                            <div style={{ fontSize: 12, color: "#8892A4", marginTop: 2 }}>
                              {c.city && `${c.city} · `}
                              {c.experience ? `${c.experience} ans d'exp.` : "Exp. non renseignée"}
                            </div>
                            {c.skills.length > 0 && (
                              <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                                {c.skills.slice(0, 4).map((s, i) => (
                                  <span key={i} style={{
                                    fontSize: 10, padding: "2px 8px", borderRadius: 20,
                                    background: "#F0EEFF", color: "#6C5CE7", fontWeight: 600,
                                  }}>{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                            color: avail.color, background: avail.bg,
                          }}>
                            {avail.label}
                          </span>
                          {alreadyProposed ? (
                            <span style={{
                              fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8,
                              color: "#2ECC71", background: "#E8F8F0",
                            }}>
                              ✅ Déjà proposé
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePropose(c.id)}
                              disabled={isPending || !selectedMissionId || isProposing}
                              style={{
                                padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                                background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                                border: "none", color: "#fff",
                                cursor: isPending ? "not-allowed" : "pointer",
                                opacity: isPending ? 0.6 : 1,
                                boxShadow: "0 3px 10px rgba(108,92,231,0.3)",
                              }}
                            >
                              {isProposing ? "..." : "Proposer"}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "#E74C3C" : "#1A1D23",
          color: "#fff", padding: "12px 24px",
          borderRadius: 50, fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
