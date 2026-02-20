"use client"

import { useState, useTransition } from "react"
import { clientValidate, clientRefuse } from "@/app/agence/portail/actions"

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

export function ClientPortalView({ client, token }: { client: Client; token: string }) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [localStates, setLocalStates] = useState<Record<string, "validated" | "refused" | null>>({})

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleValidate(pcId: string) {
    startTransition(async () => {
      try {
        await clientValidate(token, pcId)
        setLocalStates((s) => ({ ...s, [pcId]: "validated" }))
        showToast("Candidat validé avec succès ✅")
      } catch {
        showToast("Erreur lors de la validation", "error")
      }
    })
  }

  function handleRefuse(pcId: string) {
    startTransition(async () => {
      try {
        await clientRefuse(token, pcId)
        setLocalStates((s) => ({ ...s, [pcId]: "refused" }))
        showToast("Candidat refusé")
      } catch {
        showToast("Erreur lors du refus", "error")
      }
    })
  }

  const allCandidates = client.missions.flatMap((m) =>
    (m.pipeline?.candidates ?? []).map((pc) => ({ ...pc, missionTitle: m.title, missionTarget: m.targetCandidates }))
  )

  const pendingCount = allCandidates.filter((c) => !c.clientValidated && !c.clientRefused && !localStates[c.id]).length
  const validatedCount = allCandidates.filter((c) => c.clientValidated || localStates[c.id] === "validated").length

  return (
    <div style={{
      minHeight: "100vh", background: "#F4F6FB",
      fontFamily: "'DM Sans', sans-serif",
    }}>
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

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* Bienvenue */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1D23", margin: "0 0 6px" }}>
            Bonjour 👋
          </h1>
          <p style={{ fontSize: 14, color: "#8892A4", margin: 0 }}>
            Votre agence vous propose {allCandidates.length} profil{allCandidates.length > 1 ? "s" : ""} — validez ou refusez chaque candidat
          </p>
        </div>

        {/* Compteurs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Profils proposés", value: allCandidates.length, color: "#6C5CE7", bg: "#F0EEFF" },
            { label: "En attente de votre réponse", value: pendingCount, color: "#F39C12", bg: "#FEF5E7" },
            { label: "Validés", value: validatedCount, color: "#2ECC71", bg: "#E8F8F0" },
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

        {/* Profils par mission */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allCandidates.map((pc) => {
              const localState = localStates[pc.id]
              const isValidated = pc.clientValidated || localState === "validated"
              const isRefused = pc.clientRefused || localState === "refused"
              const isPending2 = !isValidated && !isRefused

              return (
                <CandidateCard
                  key={pc.id}
                  pc={pc}
                  isValidated={isValidated}
                  isRefused={isRefused}
                  isPending2={isPending2}
                  isLoading={isPending}
                  onValidate={() => handleValidate(pc.id)}
                  onRefuse={() => handleRefuse(pc.id)}
                />
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#B0B7C8" }}>
            Propulsé par <strong style={{ color: "#6C5CE7" }}>IZYSS</strong> — IA au service de l'intérim
          </p>
        </div>
      </div>

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

function CandidateCard({
  pc, isValidated, isRefused, isPending2, isLoading, onValidate, onRefuse,
}: {
  pc: PipelineCandidate & { missionTitle: string; missionTarget: number | null }
  isValidated: boolean
  isRefused: boolean
  isPending2: boolean
  isLoading: boolean
  onValidate: () => void
  onRefuse: () => void
}) {
  const vis = pc.portalVisibility
  const name = vis === "FULL"
    ? `${pc.candidate.firstName} ${pc.candidate.lastName}`
    : vis === "PARTIAL"
    ? `Candidat ${pc.candidate.firstName[0]}.`
    : "Profil anonyme"

  const city = vis !== "ANONYMOUS" ? pc.candidate.city : null
  const exp = vis !== "ANONYMOUS" ? pc.candidate.experience : null

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: `1.5px solid ${isValidated ? "#2ECC7140" : isRefused ? "#E74C3C40" : "#E8EBF0"}`,
      overflow: "hidden",
      transition: "all 0.2s",
    }}>
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          {/* Infos candidat */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: vis === "ANONYMOUS"
                ? "linear-gradient(135deg, #9CA3C4, #B0B7C8)"
                : "linear-gradient(135deg, #6C5CE7, #A29BFE)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 16,
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
                {city && `${city} · `}
                {exp !== null ? `${exp} an${exp > 1 ? "s" : ""} d'expérience` : ""}
              </div>
              {/* Mission */}
              <div style={{
                marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 6, background: "#F0EEFF",
                fontSize: 11, fontWeight: 600, color: "#6C5CE7",
              }}>
                📋 {pc.missionTitle}
              </div>
            </div>
          </div>

          {/* Statut ou boutons */}
          <div style={{ flexShrink: 0 }}>
            {isValidated ? (
              <span style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: "#E8F8F0", color: "#2ECC71",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                ✅ Validé
              </span>
            ) : isRefused ? (
              <span style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: "#FDECEB", color: "#E74C3C",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                ❌ Refusé
              </span>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={onRefuse}
                  disabled={isLoading}
                  style={{
                    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    border: "1.5px solid #E8EBF0", background: "#fff",
                    color: "#6B7294", cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  ✕ Refuser
                </button>
                <button
                  onClick={onValidate}
                  disabled={isLoading}
                  style={{
                    padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "linear-gradient(135deg, #2ECC71, #27AE60)",
                    border: "none", color: "#fff",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(46,204,113,0.3)",
                  }}
                >
                  ✓ Valider
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Compétences */}
        {pc.candidate.skills.length > 0 && vis !== "ANONYMOUS" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {pc.candidate.skills.slice(0, 6).map((s) => (
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
              Profil anonymisé — les détails seront révélés après validation
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
