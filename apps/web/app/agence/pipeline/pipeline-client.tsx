"use client"

import { useState, useTransition } from "react"
import { createMissionWithPipeline, launchPipeline, proposeToClient, validateCandidate, type Channel } from "./actions"

type Candidate = {
  id: string
  firstName: string
  lastName: string
  skills: string[]
  city: string | null
  phone: string | null
  availability: string
}

type PipelineCandidate = {
  id: string
  candidateId: string
  smsStatus: string
  selected: boolean
  proposedToClient: boolean
  clientValidated: boolean
  candidate: Candidate
}

type Pipeline = {
  id: string
  status: string
  createdAt: Date
  mission: {
    id: string
    title: string
    location: string | null
    targetCandidates: number | null
    channels: string[]
    requiredSkills: string[]
    client: { name: string }
  }
  candidates: PipelineCandidate[]
}

type Stats = {
  active: number
  smsSent: number
  pending: number
  validated: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  WAITING_AGENCY: { label: "En attente de lancement", color: "#F39C12", bg: "#FEF5E7" },
  RUNNING: { label: "En cours", color: "#4A90D9", bg: "#EBF3FC" },
  WAITING_CLIENT: { label: "Attente validation client", color: "#6C5CE7", bg: "#F0EEFF" },
  COMPLETED: { label: "Terminé", color: "#2ECC71", bg: "#E8F8F0" },
  ALERT: { label: "Alerte", color: "#E74C3C", bg: "#FDECEB" },
}

const SMS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  SENT: { label: "Envoyé", color: "#F39C12", icon: "📤" },
  ACCEPTED: { label: "Accepté", color: "#2ECC71", icon: "✅" },
  DECLINED: { label: "Refusé", color: "#E74C3C", icon: "❌" },
  NO_RESPONSE: { label: "Sans réponse", color: "#9CA3C4", icon: "⏳" },
}

const CHANNEL_CONFIG: Record<Channel, { label: string; icon: string; color: string }> = {
  SMS: { label: "SMS", icon: "📱", color: "#4A90D9" },
  WHATSAPP: { label: "WhatsApp", icon: "💬", color: "#25D366" },
  EMAIL: { label: "Email", icon: "📧", color: "#F39C12" },
  PORTAL: { label: "Portail", icon: "🖥", color: "#6C5CE7" },
}

export function PipelineClient({ pipelines, stats }: { pipelines: Pipeline[]; stats: Stats }) {
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [showNewMission, setShowNewMission] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)
  const [localPipelines, setLocalPipelines] = useState(pipelines)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function handleLaunch(pipelineId: string) {
    startTransition(async () => {
      try {
        const result = await launchPipeline(pipelineId)
        showToast(`Pipeline lancé — ${result.matched.length} candidats matchés, ${result.sent} messages envoyés`)
        // Refresh
        window.location.reload()
      } catch (e) {
        showToast("Erreur lors du lancement du pipeline")
        console.error(e)
      }
    })
  }

  function handlePropose(pcId: string) {
    startTransition(async () => {
      try {
        await proposeToClient(pcId)
        showToast("Profil anonymisé envoyé au client ✅")
        window.location.reload()
      } catch (e) {
        showToast("Erreur lors de l'envoi au client")
        console.error(e)
      }
    })
  }

  function handleValidate(pcId: string) {
    startTransition(async () => {
      try {
        const result = await validateCandidate(pcId)
        showToast(result.completed ? "🎉 Quota atteint — Pipeline terminé !" : "Candidat validé ✅")
        window.location.reload()
      } catch (e) {
        showToast("Erreur lors de la validation")
        console.error(e)
      }
    })
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1D23", margin: 0 }}>
            Pipeline Auto 🚀
          </h1>
          <p style={{ fontSize: 14, color: "#8892A4", marginTop: 4 }}>
            Automatisez votre recrutement de bout en bout — matching IA, relances et validation client
          </p>
        </div>
        <button
          onClick={() => setShowNewMission(true)}
          style={{
            background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "11px 20px", fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(108,92,231,0.3)",
          }}
        >
          <span>+</span> Nouvelle mission
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Pipelines actifs", value: stats.active, icon: "🚀", color: "#6C5CE7", bg: "#F0EEFF" },
          { label: "SMS / WA envoyés", value: stats.smsSent, icon: "📱", color: "#4A90D9", bg: "#EBF3FC" },
          { label: "En attente réponse", value: stats.pending, icon: "⏳", color: "#F39C12", bg: "#FEF5E7" },
          { label: "Validés par client", value: stats.validated, icon: "✅", color: "#2ECC71", bg: "#E8F8F0" },
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
            <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: "#8892A4", marginTop: 6 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Liste Pipelines */}
      {localPipelines.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 20, padding: 64,
          border: "1.5px solid #E8EBF0",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1D23", marginBottom: 8 }}>
            Aucun pipeline actif
          </div>
          <p style={{ fontSize: 14, color: "#8892A4", marginBottom: 24 }}>
            Créez votre première mission pour lancer le pipeline automatisé
          </p>
          <button
            onClick={() => setShowNewMission(true)}
            style={{
              background: "#6C5CE7", color: "#fff", border: "none",
              borderRadius: 10, padding: "10px 20px", fontSize: 14,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            + Créer une mission
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {localPipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onSelect={() => setSelectedPipeline(pipeline)}
              onLaunch={() => handleLaunch(pipeline.id)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Drawer Détail Pipeline */}
      {selectedPipeline && (
        <PipelineDrawer
          pipeline={selectedPipeline}
          onClose={() => setSelectedPipeline(null)}
          onPropose={handlePropose}
          onValidate={handleValidate}
          isPending={isPending}
        />
      )}

      {/* Modal Nouvelle Mission */}
      {showNewMission && (
        <NewMissionModal
          onClose={() => setShowNewMission(false)}
          onSuccess={(msg) => { showToast(msg); setShowNewMission(false); window.location.reload() }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "#1A1D23", color: "#fff", padding: "12px 24px",
          borderRadius: 50, fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 9999,
          animation: "slideUp 0.3s ease",
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── PIPELINE CARD ─────────────────────────────────────────────────────────

function PipelineCard({
  pipeline, onSelect, onLaunch, isPending,
}: {
  pipeline: Pipeline
  onSelect: () => void
  onLaunch: () => void
  isPending: boolean
}) {
  const status = STATUS_CONFIG[pipeline.status] ?? STATUS_CONFIG.RUNNING
  const accepted = pipeline.candidates.filter((c) => c.smsStatus === "ACCEPTED").length
  const validated = pipeline.candidates.filter((c) => c.clientValidated).length
  const target = pipeline.mission.targetCandidates ?? 1
  const channels = pipeline.mission.channels as Channel[]

  // Étapes du pipeline
  const steps = [
    {
      label: "Matching IA",
      icon: "🤖",
      done: pipeline.candidates.length > 0,
      value: pipeline.candidates.length > 0 ? `${pipeline.candidates.length} profils` : "En attente",
    },
    {
      label: "Messages envoyés",
      icon: "📱",
      done: pipeline.candidates.length > 0,
      value: pipeline.candidates.length > 0 ? `${pipeline.candidates.length} envoyés` : "—",
    },
    {
      label: "Réponses OK",
      icon: "✅",
      done: accepted > 0,
      value: accepted > 0 ? `${accepted} candidats` : "En attente",
    },
    {
      label: "Validations client",
      icon: "👁",
      done: validated > 0,
      value: `${validated}/${target} validés`,
    },
  ]

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 24,
      border: "1.5px solid #E8EBF0",
      cursor: "pointer",
      transition: "box-shadow 0.2s",
    }}
      onClick={onSelect}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        {/* Infos mission */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#1A1D23" }}>
              {pipeline.mission.title}
            </span>
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              color: status.color, background: status.bg,
            }}>
              {status.label}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#8892A4" }}>
            {pipeline.mission.client.name}
            {pipeline.mission.location ? ` · ${pipeline.mission.location}` : ""}
            {" · "}
            <span style={{ color: "#6C5CE7", fontWeight: 600 }}>
              {target} candidat{target > 1 ? "s" : ""} recherché{target > 1 ? "s" : ""}
            </span>
          </div>
          {/* Canaux */}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {channels.map((ch) => {
              const cfg = CHANNEL_CONFIG[ch]
              return (
                <span key={ch} style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  border: `1.5px solid ${cfg.color}20`,
                  color: cfg.color, background: `${cfg.color}10`,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {cfg.icon} {cfg.label}
                </span>
              )
            })}
          </div>
        </div>

        {/* Action selon statut */}
        <div onClick={(e) => e.stopPropagation()}>
          {pipeline.status === "WAITING_AGENCY" && (
            <button
              onClick={onLaunch}
              disabled={isPending}
              style={{
                background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 18px", fontSize: 13, fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Lancement..." : "🚀 Lancer le pipeline"}
            </button>
          )}
        </div>
      </div>

      {/* Étapes visuelles */}
      <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{
              flex: 1, padding: "12px 16px",
              background: step.done ? "#F0EEFF" : "#F8F9FC",
              borderRadius: i === 0 ? "12px 0 0 12px" : i === steps.length - 1 ? "0 12px 12px 0" : 0,
              borderRight: i < steps.length - 1 ? "1px solid #E8EBF0" : "none",
              border: step.done ? "1px solid #6C5CE7" : "1px solid #E8EBF0",
              marginRight: i < steps.length - 1 ? -1 : 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: "#8892A4", fontWeight: 500 }}>{step.label}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: step.done ? "#6C5CE7" : "#B0B7C8",
                  }}>{step.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PIPELINE DRAWER ─────────────────────────────────────────────────────────

function PipelineDrawer({
  pipeline, onClose, onPropose, onValidate, isPending,
}: {
  pipeline: Pipeline
  onClose: () => void
  onPropose: (id: string) => void
  onValidate: (id: string) => void
  isPending: boolean
}) {
  const channels = pipeline.mission.channels as Channel[]

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(26,29,46,0.4)",
          backdropFilter: "blur(4px)", zIndex: 200,
        }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 560, background: "#fff", zIndex: 201,
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(26,29,46,0.12)",
      }}>
        {/* Header Drawer */}
        <div style={{
          padding: "24px 28px",
          borderBottom: "1px solid #F0F2F8",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1D23" }}>
              {pipeline.mission.title}
            </div>
            <div style={{ fontSize: 13, color: "#8892A4", marginTop: 2 }}>
              {pipeline.mission.client.name}
              {pipeline.mission.location ? ` · ${pipeline.mission.location}` : ""}
            </div>
            {/* Canaux */}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {channels.map((ch) => {
                const cfg = CHANNEL_CONFIG[ch]
                return (
                  <span key={ch} style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11,
                    fontWeight: 600, color: cfg.color, background: `${cfg.color}15`,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {cfg.icon} {cfg.label}
                  </span>
                )
              })}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F4F6FB", border: "none", borderRadius: 8,
              width: 36, height: 36, fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6B7294",
            }}
          >×</button>
        </div>

        {/* Corps Drawer */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Infos mission */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28,
          }}>
            {[
              { label: "Candidats recherchés", value: `${pipeline.mission.targetCandidates ?? 1}` },
              { label: "Statut pipeline", value: STATUS_CONFIG[pipeline.status]?.label ?? pipeline.status },
              { label: "Compétences requises", value: pipeline.mission.requiredSkills.join(", ") || "—" },
              { label: "Candidats dans le pipeline", value: `${pipeline.candidates.length}` },
            ].map((info) => (
              <div key={info.label} style={{
                background: "#F8F9FC", borderRadius: 10, padding: "12px 16px",
              }}>
                <div style={{ fontSize: 11, color: "#8892A4", fontWeight: 500, marginBottom: 4 }}>{info.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1D23" }}>{info.value}</div>
              </div>
            ))}
          </div>

          {/* Liste candidats */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1D23", marginBottom: 14 }}>
            Candidats dans le pipeline ({pipeline.candidates.length})
          </div>

          {pipeline.candidates.length === 0 ? (
            <div style={{
              background: "#F8F9FC", borderRadius: 12, padding: 32,
              textAlign: "center", color: "#8892A4", fontSize: 14,
            }}>
              Aucun candidat — lancez le pipeline pour démarrer le matching IA
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pipeline.candidates.map((pc) => {
                const sms = SMS_CONFIG[pc.smsStatus] ?? SMS_CONFIG.SENT
                const canPropose = pc.smsStatus === "ACCEPTED" && !pc.proposedToClient
                const canValidate = pc.proposedToClient && !pc.clientValidated

                return (
                  <div key={pc.id} style={{
                    background: "#fff", borderRadius: 12, padding: "14px 16px",
                    border: `1.5px solid ${pc.clientValidated ? "#2ECC7130" : pc.proposedToClient ? "#6C5CE730" : "#E8EBF0"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {pc.candidate.firstName[0]}{pc.candidate.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1D23" }}>
                            {pc.candidate.firstName} {pc.candidate.lastName}
                          </div>
                          <div style={{ fontSize: 12, color: "#8892A4" }}>
                            {pc.candidate.city ?? "—"} · {pc.candidate.skills.slice(0, 2).join(", ")}
                          </div>
                        </div>
                      </div>

                      {/* Badges statut */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                          color: sms.color, background: `${sms.color}15`,
                        }}>
                          {sms.icon} {sms.label}
                        </span>
                        {pc.proposedToClient && (
                          <span style={{
                            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                            color: "#6C5CE7", background: "#F0EEFF",
                          }}>
                            📤 Proposé
                          </span>
                        )}
                        {pc.clientValidated && (
                          <span style={{
                            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                            color: "#2ECC71", background: "#E8F8F0",
                          }}>
                            ✅ Validé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {(canPropose || canValidate) && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        {canPropose && (
                          <button
                            onClick={() => onPropose(pc.id)}
                            disabled={isPending}
                            style={{
                              background: "#6C5CE7", color: "#fff", border: "none",
                              borderRadius: 8, padding: "8px 14px", fontSize: 12,
                              fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer",
                              opacity: isPending ? 0.7 : 1,
                            }}
                          >
                            📤 Proposer au client
                          </button>
                        )}
                        {canValidate && (
                          <button
                            onClick={() => onValidate(pc.id)}
                            disabled={isPending}
                            style={{
                              background: "#2ECC71", color: "#fff", border: "none",
                              borderRadius: 8, padding: "8px 14px", fontSize: 12,
                              fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer",
                              opacity: isPending ? 0.7 : 1,
                            }}
                          >
                            ✅ Valider côté client
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── MODAL NOUVELLE MISSION ───────────────────────────────────────────────────

function NewMissionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [isPending, startTransition] = useTransition()
  const [channels, setChannels] = useState<Channel[]>(["SMS", "PORTAL"])
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [form, setForm] = useState({
    title: "",
    clientName: "",
    location: "",
    startDate: "",
    endDate: "",
    targetCandidates: "3",
  })

  function toggleChannel(ch: Channel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    )
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s])
    setSkillInput("")
  }

  function handleSubmit() {
    if (!form.title || !form.clientName || channels.length === 0) return
    startTransition(async () => {
      try {
        await createMissionWithPipeline({
          title: form.title,
          clientName: form.clientName,
          location: form.location,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          targetCandidates: parseInt(form.targetCandidates) || 1,
          requiredSkills: skills,
          channels,
        })
        onSuccess("Mission créée — Pipeline prêt à être lancé 🚀")
      } catch (e) {
        console.error(e)
      }
    })
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(26,29,46,0.5)", backdropFilter: "blur(4px)", zIndex: 300 }}
      />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 540, background: "#fff", borderRadius: 20,
        zIndex: 301, boxShadow: "0 20px 60px rgba(26,29,46,0.15)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header Modal */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid #F0F2F8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1D23" }}>Nouvelle mission</div>
            <div style={{ fontSize: 13, color: "#8892A4", marginTop: 2 }}>Le pipeline IA se lancera sur demande</div>
          </div>
          <button onClick={onClose} style={{
            background: "#F4F6FB", border: "none", borderRadius: 8,
            width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#6B7294",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Corps Modal */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Champs texte */}
          {[
            { key: "title", label: "Intitulé du poste *", placeholder: "Ex: Cariste CACES 3" },
            { key: "clientName", label: "Client *", placeholder: "Ex: Carrefour Supply Chain" },
            { key: "location", label: "Localisation", placeholder: "Ex: Lyon 7e" },
          ].map((field) => (
            <div key={field.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7294", display: "block", marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1.5px solid #E8EBF0", fontSize: 14, color: "#1A1D23",
                  outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>
          ))}

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { key: "startDate", label: "Date de début" },
              { key: "endDate", label: "Date de fin" },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7294", display: "block", marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type="date"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #E8EBF0", fontSize: 14, color: "#1A1D23",
                    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Nombre de candidats */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7294", display: "block", marginBottom: 6 }}>
              Nombre de candidats recherchés *
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={form.targetCandidates}
              onChange={(e) => setForm((f) => ({ ...f, targetCandidates: e.target.value }))}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #E8EBF0", fontSize: 14, color: "#1A1D23",
                outline: "none", boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Compétences requises */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7294", display: "block", marginBottom: 6 }}>
              Compétences requises
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Ex: CACES 3, manutention..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10,
                  border: "1.5px solid #E8EBF0", fontSize: 14, color: "#1A1D23",
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <button
                onClick={addSkill}
                style={{
                  background: "#F0EEFF", color: "#6C5CE7", border: "none",
                  borderRadius: 10, padding: "10px 16px", fontSize: 14,
                  fontWeight: 600, cursor: "pointer",
                }}
              >+</button>
            </div>
            {skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.map((s) => (
                  <span key={s} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: "#F0EEFF", color: "#6C5CE7",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {s}
                    <button
                      onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#6C5CE7", padding: 0, fontSize: 14 }}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Canaux d'envoi */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7294", display: "block", marginBottom: 10 }}>
              Comment envoyer les CVs au client ? *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["SMS", "WHATSAPP", "EMAIL", "PORTAL"] as Channel[]).map((ch) => {
                const cfg = CHANNEL_CONFIG[ch]
                const isSelected = channels.includes(ch)
                const isSoon = ch === "EMAIL"
                return (
                  <button
                    key={ch}
                    onClick={() => !isSoon && toggleChannel(ch)}
                    disabled={isSoon}
                    style={{
                      padding: "14px 16px", borderRadius: 12, cursor: isSoon ? "not-allowed" : "pointer",
                      border: `2px solid ${isSelected ? cfg.color : "#E8EBF0"}`,
                      background: isSelected ? `${cfg.color}10` : "#F8F9FC",
                      display: "flex", alignItems: "center", gap: 10,
                      transition: "all 0.15s", textAlign: "left",
                      opacity: isSoon ? 0.5 : 1,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: isSelected ? cfg.color : "#1A1D23",
                      }}>{cfg.label}</div>
                      {isSoon && (
                        <div style={{ fontSize: 10, color: "#B0B7C8" }}>Bientôt disponible</div>
                      )}
                    </div>
                    {isSelected && (
                      <span style={{ marginLeft: "auto", color: cfg.color, fontSize: 16 }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notice IA */}
          <div style={{
            background: "#F0EEFF", borderRadius: 10, padding: "12px 16px",
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16 }}>🤖</span>
            <div style={{ fontSize: 12, color: "#6C5CE7", lineHeight: 1.5 }}>
              L'IA lancera automatiquement le matching dès que vous cliquerez sur "Lancer le pipeline" dans la liste.
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div style={{
          padding: "16px 28px 24px",
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent", color: "#6B7294",
              border: "1.5px solid #E8EBF0", borderRadius: 10,
              padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !form.title || !form.clientName || channels.length === 0}
            style={{
              background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 24px", fontSize: 14, fontWeight: 600,
              cursor: isPending || !form.title || !form.clientName ? "not-allowed" : "pointer",
              opacity: isPending || !form.title || !form.clientName ? 0.6 : 1,
            }}
          >
            {isPending ? "Création..." : "🚀 Créer la mission"}
          </button>
        </div>
      </div>
    </>
  )
}
