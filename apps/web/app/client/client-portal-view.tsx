"use client"

import { useState, useTransition } from "react"
import { clientValidate, clientRefuse, clientComment as saveComment } from "@/app/agence/portail/actions"

type Candidate = {
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

type Mission = {
  id: string
  title: string
  targetCandidates: number | null
  pipeline: {
    id: string
    status: string
    candidates: PipelineCandidate[]
  } | null
}

type Client = {
  id: string
  name: string
  missions: Mission[]
}

type PipelineCandidateWithMission = PipelineCandidate & {
  missionTitle: string
  missionTarget: number | null
}

export function ClientPortalView({ client, token }: { client: Client; token: string }) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [localStates, setLocalStates] = useState<Record<string, "validated" | "refused" | null>>({})
  const [localComments, setLocalComments] = useState<Record<string, string>>({})
  const [openComment, setOpenComment] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState("")
  const [openSynthese, setOpenSynthese] = useState<PipelineCandidateWithMission | null>(null)

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleValidate(pcId: string) {
    startTransition(async () => {
      try {
        await clientValidate(token, pcId)
        setLocalStates((s) => ({ ...s, [pcId]: "validated" }))
        showToast("Intérêt confirmé ✅")
      } catch {
        showToast("Erreur", "error")
      }
    })
  }

  function handleRefuse(pcId: string) {
    startTransition(async () => {
      try {
        await clientRefuse(token, pcId)
        setLocalStates((s) => ({ ...s, [pcId]: "refused" }))
        showToast("Réponse enregistrée")
      } catch {
        showToast("Erreur", "error")
      }
    })
  }

  function openCommentBox(pcId: string, existingComment: string | null) {
    setOpenComment(pcId)
    setCommentDraft(existingComment ?? "")
  }

  function handleSaveComment(pcId: string) {
    startTransition(async () => {
      try {
        await saveComment(token, pcId, commentDraft)
        setLocalComments((s) => ({ ...s, [pcId]: commentDraft }))
        setOpenComment(null)
        showToast("Commentaire enregistré 💬")
      } catch {
        showToast("Erreur", "error")
      }
    })
  }

  const allCandidates = client.missions.flatMap((m) =>
    (m.pipeline?.candidates ?? []).map((pc) => ({
      ...pc,
      missionTitle: m.title,
      missionTarget: m.targetCandidates,
    }))
  )

  const pendingCount = allCandidates.filter(
    (c) => !c.clientValidated && !c.clientRefused && !localStates[c.id]
  ).length
  const validatedCount = allCandidates.filter(
    (c) => c.clientValidated || localStates[c.id] === "validated"
  ).length

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6FB", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #E8EBF0",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14,
          }}>IZ</div>
          <span style={{
            fontSize: 18, fontWeight: 700,
            background: "linear-gradient(135deg, #6C5CE7, #4A90D9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>IZYSS</span>
          <span style={{ fontSize: 13, color: "#B0B7C8", marginLeft: 4 }}>/ Espace Client</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #4A90D9, #74B3F0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 12,
          }}>
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1D23" }}>{client.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
        {/* Titre */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1D23", margin: "0 0 6px" }}>
            Bonjour 👋
          </h1>
          <p style={{ fontSize: 14, color: "#8892A4", margin: 0 }}>
            Votre agence vous propose{" "}
            <strong style={{ color: "#1A1D23" }}>
              {allCandidates.length} profil{allCandidates.length > 1 ? "s" : ""}
            </strong>{" "}
            — indiquez votre intérêt pour chaque candidat
          </p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Profils proposés", value: allCandidates.length, color: "#6C5CE7", bg: "#F0EEFF" },
            { label: "En attente de votre réponse", value: pendingCount, color: "#F39C12", bg: "#FEF5E7" },
            { label: "Vous êtes intéressé", value: validatedCount, color: "#2ECC71", bg: "#E8F8F0" },
          ].map((k) => (
            <div key={k.label} style={{
              background: "#fff", borderRadius: 14, padding: "16px 20px",
              border: "1.5px solid #E8EBF0",
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: "#8892A4", marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Profils */}
        {allCandidates.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 20, padding: 48,
            border: "1.5px solid #E8EBF0", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1D23", marginBottom: 6 }}>
              Aucun profil disponible pour l'instant
            </div>
            <p style={{ fontSize: 13, color: "#8892A4" }}>
              Votre agence prépare des profils pour vous. Revenez bientôt.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {allCandidates.map((pc) => {
              const localState = localStates[pc.id]
              const isValidated = pc.clientValidated || localState === "validated"
              const isRefused = pc.clientRefused || localState === "refused"
              const isPending2 = !isValidated && !isRefused
              const comment = localComments[pc.id] ?? pc.clientComment ?? ""
              const isCommentOpen = openComment === pc.id

              const vis = pc.portalVisibility
              const name =
                vis === "FULL"
                  ? `${pc.candidate.firstName} ${pc.candidate.lastName}`
                  : vis === "PARTIAL"
                  ? `Candidat ${pc.candidate.firstName[0]}.`
                  : "Profil anonyme"

              // PARTIAL : compétences + expérience visibles, mais pas ville ni coordonnées
              const showSkills = vis !== "ANONYMOUS"
              const showExp = vis !== "ANONYMOUS"

              return (
                <div
                  key={pc.id}
                  style={{
                    background: "#fff", borderRadius: 16,
                    border: `1.5px solid ${isValidated ? "#2ECC7140" : isRefused ? "#E74C3C40" : "#E8EBF0"}`,
                    overflow: "hidden", transition: "all 0.2s",
                  }}
                >
                  {/* Barre colorée top */}
                  {(isValidated || isRefused) && (
                    <div style={{
                      height: 3,
                      background: isValidated
                        ? "linear-gradient(90deg, #2ECC71, #27AE60)"
                        : "linear-gradient(90deg, #E74C3C, #C0392B)",
                    }} />
                  )}

                  <div style={{ padding: "20px 24px" }}>
                    {/* Ligne principale */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                      {/* Infos candidat */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                          background: vis === "ANONYMOUS"
                            ? "linear-gradient(135deg, #9CA3C4, #B0B7C8)"
                            : "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 700, fontSize: 17,
                        }}>
                          {vis === "FULL"
                            ? `${pc.candidate.firstName[0]}${pc.candidate.lastName[0]}`
                            : vis === "PARTIAL"
                            ? `${pc.candidate.firstName[0]}?`
                            : "?"}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1D23" }}>{name}</div>
                          <div style={{ fontSize: 12, color: "#8892A4", marginTop: 2 }}>
                            {showExp && pc.candidate.experience !== null
                              ? `${pc.candidate.experience} an${pc.candidate.experience > 1 ? "s" : ""} d'expérience`
                              : ""}
                          </div>
                          {/* Badge mission */}
                          <div style={{
                            marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "2px 8px", borderRadius: 6, background: "#F0EEFF",
                            fontSize: 11, fontWeight: 600, color: "#6C5CE7",
                          }}>
                            📋 {pc.missionTitle}
                          </div>
                        </div>
                      </div>

                      {/* Boutons intéressé / pas intéressé */}
                      <div style={{ flexShrink: 0 }}>
                        {isValidated ? (
                          <span style={{
                            padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: "#E8F8F0", color: "#2ECC71",
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                            ✅ Intéressé
                          </span>
                        ) : isRefused ? (
                          <span style={{
                            padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: "#FDECEB", color: "#E74C3C",
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                            ✕ Pas intéressé
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleRefuse(pc.id)}
                              disabled={isPending}
                              style={{
                                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                border: "1.5px solid #E8EBF0", background: "#fff",
                                color: "#6B7294", cursor: isPending ? "not-allowed" : "pointer",
                              }}
                            >
                              ✕ Pas intéressé
                            </button>
                            <button
                              onClick={() => handleValidate(pc.id)}
                              disabled={isPending}
                              style={{
                                padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: "linear-gradient(135deg, #2ECC71, #27AE60)",
                                border: "none", color: "#fff",
                                cursor: isPending ? "not-allowed" : "pointer",
                                boxShadow: "0 4px 12px rgba(46,204,113,0.3)",
                              }}
                            >
                              ✓ Intéressé
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compétences */}
                    {showSkills && pc.candidate.skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                        {pc.candidate.skills.slice(0, 7).map((s) => (
                          <span key={s} style={{
                            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: "#F4F6FB", color: "#6B7294",
                          }}>{s}</span>
                        ))}
                      </div>
                    )}

                    {vis === "ANONYMOUS" && (
                      <div style={{
                        marginTop: 12, padding: "10px 14px", borderRadius: 10,
                        background: "#F4F6FB", display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{ fontSize: 14 }}>🔒</span>
                        <span style={{ fontSize: 12, color: "#8892A4" }}>
                          Profil confidentiel — les détails seront communiqués sur demande
                        </span>
                      </div>
                    )}

                    {/* Bouton Voir la synthèse */}
                    {vis !== "ANONYMOUS" && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          onClick={() => setOpenSynthese(pc)}
                          style={{
                            background: "none", border: "1.5px solid #E8EBF0",
                            borderRadius: 8, padding: "7px 14px",
                            fontSize: 12, fontWeight: 600, color: "#6C5CE7",
                            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                          }}
                        >
                          📄 Voir la synthèse
                        </button>
                      </div>
                    )}

                    {/* Bulle commentaire */}
                    <div style={{ marginTop: 14 }}>
                      {!isCommentOpen ? (
                        <button
                          onClick={() => openCommentBox(pc.id, pc.clientComment)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 12, color: comment ? "#6C5CE7" : "#B0B7C8",
                            fontWeight: comment ? 600 : 400, padding: 0,
                          }}
                        >
                          💬 {comment ? `"${comment.slice(0, 60)}${comment.length > 60 ? "…" : ""}"` : "Ajouter un commentaire"}
                        </button>
                      ) : (
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                          <textarea
                            value={commentDraft}
                            onChange={(e) => setCommentDraft(e.target.value)}
                            placeholder="Votre commentaire pour l'agence..."
                            rows={2}
                            autoFocus
                            style={{
                              flex: 1, padding: "10px 12px", borderRadius: 10,
                              border: "1.5px solid #6C5CE7", fontSize: 13,
                              outline: "none", resize: "none", fontFamily: "inherit",
                              color: "#1A1D23",
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <button
                              onClick={() => handleSaveComment(pc.id)}
                              disabled={isPending}
                              style={{
                                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: "#6C5CE7", border: "none", color: "#fff",
                                cursor: isPending ? "not-allowed" : "pointer",
                              }}
                            >
                              Envoyer
                            </button>
                            <button
                              onClick={() => setOpenComment(null)}
                              style={{
                                padding: "7px 14px", borderRadius: 8, fontSize: 12,
                                background: "none", border: "1.5px solid #E8EBF0",
                                color: "#8892A4", cursor: "pointer",
                              }}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#B0B7C8" }}>
            Propulsé par <strong style={{ color: "#6C5CE7" }}>IZYSS</strong> — IA au service de l&apos;intérim
          </p>
        </div>
      </div>

      {/* Modal Synthèse CV anonymisé */}
      {openSynthese && (() => {
        const pc = openSynthese
        const c = pc.candidate
        const availLabel =
          c.availability === "AVAILABLE" ? "✅ Disponible immédiatement"
          : c.availability === "BUSY" ? "⏳ En mission"
          : "❌ Non disponible"

        return (
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(26,29,35,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000, padding: 16,
            }}
            onClick={() => setOpenSynthese(null)}
          >
            <div
              style={{
                background: "#fff", borderRadius: 20,
                width: "min(540px, 100%)", maxHeight: "88vh", overflowY: "auto",
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: "22px 28px 18px",
                borderBottom: "1px solid #F0F2F8",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1D23" }}>
                    Synthèse du profil
                  </div>
                  <div style={{ fontSize: 12, color: "#8892A4", marginTop: 3 }}>
                    Coordonnées masquées — transmises par l'agence après accord
                  </div>
                </div>
                <button
                  onClick={() => setOpenSynthese(null)}
                  style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#B0B7C8" }}
                >×</button>
              </div>

              {/* Body */}
              <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Disponibilité + Expérience */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{
                    background: "#F4F6FB", borderRadius: 12, padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#8892A4", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Disponibilité</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1D23" }}>{availLabel}</div>
                  </div>
                  <div style={{
                    background: "#F4F6FB", borderRadius: 12, padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#8892A4", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Expérience</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1D23" }}>
                      {c.experience !== null ? `${c.experience} an${c.experience > 1 ? "s" : ""}` : "Non renseigné"}
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                {c.city && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#8892A4", marginBottom: 10 }}>
                      Localisation
                    </div>
                    <div style={{ fontSize: 14, color: "#1A1D23", display: "flex", alignItems: "center", gap: 6 }}>
                      📍 {c.city}
                    </div>
                  </div>
                )}

                {/* Compétences / CACES / Permis / Diplômes */}
                {c.skills.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#8892A4", marginBottom: 10 }}>
                      Compétences &amp; qualifications
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {c.skills.map((s) => {
                        const isCaces = /caces/i.test(s)
                        const isPermis = /permis/i.test(s)
                        const isDiplome = /bts|bac|master|licence|cap|bep|titre|certif|diplôme|formation/i.test(s)
                        const bg = isCaces ? "#FFF8E1" : isPermis ? "#E8F8F0" : isDiplome ? "#EBF8FF" : "#F4F6FB"
                        const color = isCaces ? "#D69E2E" : isPermis ? "#276749" : isDiplome ? "#2B6CB0" : "#4A5568"
                        return (
                          <span key={s} style={{
                            padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: bg, color,
                          }}>{s}</span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Mission concernée */}
                <div style={{
                  background: "#F0EEFF", borderRadius: 10, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>📋</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#6C5CE7" }}>{pc.missionTitle}</span>
                </div>

                {/* Notice anonymisation */}
                <div style={{
                  background: "#FFFBEB", border: "1px solid #F6E05E",
                  borderRadius: 10, padding: "12px 16px",
                  fontSize: 12, color: "#744210", lineHeight: 1.5,
                }}>
                  🔒 <strong>Profil anonymisé</strong> — Le nom, les coordonnées et l'adresse du candidat sont masqués. Confirmez votre intérêt pour que l'agence vous transmette ses informations complètes.
                </div>

                <button
                  onClick={() => setOpenSynthese(null)}
                  style={{
                    background: "#6C5CE7", border: "none", borderRadius: 10,
                    padding: "12px", color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "#E74C3C" : "#1A1D23",
          color: "#fff", padding: "12px 24px", borderRadius: 50,
          fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
