"use client"

import { useState } from "react"
import { scoreCandidates, ScoredCandidate, CriteriaConfig, CriterionConfig } from "./actions"
import { ScoringPresetRecord, savePreset, deletePreset, setDefaultPreset } from "./preset-actions"
import { getCvSignedUrl } from "../candidats/actions"

const DEFAULT_CRITERIA: CriteriaConfig = {
  competences: { weight: 40, enabled: true },
  experience: { weight: 25, enabled: true },
  disponibilite: { weight: 20, enabled: true },
  localisation: { weight: 15, enabled: true },
}

export function ScoringClient({
  candidateCount,
  presets: initialPresets,
}: {
  candidateCount: number
  presets: ScoringPresetRecord[]
}) {
  const [jobDescription, setJobDescription] = useState("")
  const [criteria, setCriteria] = useState<CriteriaConfig>(DEFAULT_CRITERIA)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScoredCandidate[] | null>(null)
  const [filter, setFilter] = useState<"all" | "high" | "available">("all")

  // Preset state
  const [presets, setPresets] = useState<ScoringPresetRecord[]>(initialPresets)
  const [activePresetId, setActivePresetId] = useState<string | "custom" | "default">("default")
  const [presetName, setPresetName] = useState("")
  const [presetJobType, setPresetJobType] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const activeTotal = (Object.values(criteria) as CriterionConfig[])
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + c.weight, 0)

  const totalOk = activeTotal === 100

  function loadPreset(preset: ScoringPresetRecord) {
    setCriteria(preset.criteria)
    setActivePresetId(preset.id)
    setResults(null)
  }

  function handlePresetSelect(value: string) {
    if (value === "default") {
      setCriteria(DEFAULT_CRITERIA)
      setActivePresetId("default")
      setResults(null)
    } else if (value === "custom") {
      setActivePresetId("custom")
    } else {
      const found = presets.find((p) => p.id === value)
      if (found) loadPreset(found)
    }
  }

  function updateCriterion(key: keyof CriteriaConfig, field: "weight" | "enabled", value: number | boolean) {
    setCriteria((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
    if (activePresetId !== "custom" && activePresetId !== "default") {
      setActivePresetId("custom")
    }
  }

  async function handleSave() {
    if (!presetName.trim()) { setSaveError("Nom requis"); return }
    setSaveError("")
    setSaving(true)
    try {
      const isEditing = activePresetId !== "default" && activePresetId !== "custom"
      const saved = await savePreset(
        presetName.trim(),
        presetJobType.trim() || null,
        criteria,
        isEditing ? activePresetId : undefined
      )
      setPresets((prev) => {
        const exists = prev.find((p) => p.id === saved.id)
        return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]
      })
      setActivePresetId(saved.id)
      setPresetName("")
      setPresetJobType("")
    } catch {
      setSaveError("Erreur lors de la sauvegarde")
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await deletePreset(id)
    setPresets((prev) => prev.filter((p) => p.id !== id))
    if (activePresetId === id) {
      setCriteria(DEFAULT_CRITERIA)
      setActivePresetId("default")
    }
  }

  async function handleSetDefault(id: string) {
    await setDefaultPreset(id)
    setPresets((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })))
  }

  async function handleScore() {
    if (!jobDescription.trim() || loading) return
    setLoading(true)
    try {
      const scored = await scoreCandidates(jobDescription, criteria)
      setResults(scored)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const filtered = results
    ? results.filter((c) => {
        if (filter === "high") return c.score >= 75
        if (filter === "available") return c.availability === "AVAILABLE"
        return true
      })
    : []

  const activePreset = presets.find((p) => p.id === activePresetId)

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round">
            <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
          </svg>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1D23", margin: 0 }}>Scoring CV</h1>
        </div>
        <p style={{ fontSize: 13, color: "#8892A4", marginTop: 4, marginLeft: 32 }}>
          Configurez vos critères et consultez les scores de vos candidats
        </p>
      </div>

      {/* Layout 2 colonnes */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── PANEL GAUCHE ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E8EBF0", overflow: "hidden" }}>
          {/* Titre */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F0F2F8" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1D23" }}>Critères d&apos;évaluation</div>
            <div style={{ fontSize: 12, color: "#8892A4", marginTop: 2 }}>Attribuez des points à chaque critère</div>
          </div>

          {/* ── SÉLECTEUR DE PRESET ── */}
          <div style={{ padding: "14px 20px 0" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#8892A4", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 6 }}>
              Preset de scoring
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={activePresetId}
                onChange={(e) => handlePresetSelect(e.target.value)}
                style={{
                  flex: 1, padding: "9px 12px",
                  border: "1.5px solid #E8EBF0", borderRadius: 10,
                  fontSize: 13, fontFamily: "inherit", color: "#1A1D23",
                  background: "#fff", cursor: "pointer", outline: "none",
                }}
              >
                <option value="default">Par défaut</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.isDefault ? " ★" : ""}
                  </option>
                ))}
                {activePresetId === "custom" && <option value="custom">Personnalisé</option>}
              </select>
              {activePreset && (
                <button
                  onClick={() => handleDelete(activePreset.id)}
                  title="Supprimer ce preset"
                  style={{
                    padding: "9px 11px", border: "1.5px solid #F0F2F8", borderRadius: 10,
                    background: "#fff", cursor: "pointer", color: "#E74C3C", fontSize: 13,
                    display: "flex", alignItems: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              )}
            </div>
            {activePreset && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 10px", background: "#F0EEFF", borderRadius: 20,
                  fontSize: 11, fontWeight: 700, color: "#6C5CE7",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#6C5CE7" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Preset actif : {activePreset.name}
                </div>
                {!activePreset.isDefault && (
                  <button
                    onClick={() => handleSetDefault(activePreset.id)}
                    style={{
                      fontSize: 11, color: "#8892A4", background: "none", border: "none",
                      cursor: "pointer", textDecoration: "underline", padding: 0,
                    }}
                  >
                    Définir par défaut
                  </button>
                )}
                {activePreset.isDefault && (
                  <span style={{ fontSize: 11, color: "#F39C12", fontWeight: 600 }}>★ Défaut</span>
                )}
              </div>
            )}
          </div>

          {/* Textarea poste */}
          <div style={{ padding: "14px 20px 0" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#8892A4", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Poste à pourvoir
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Ex: Cariste CACES 3 à Lyon, 2 ans d'expérience minimum, disponible immédiatement..."
              rows={4}
              style={{
                width: "100%", marginTop: 8, padding: "12px 14px",
                border: "1.5px solid #E8EBF0", borderRadius: 10,
                fontSize: 13, fontFamily: "inherit", resize: "none",
                outline: "none", color: "#1A1D23", lineHeight: 1.5,
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#6C5CE7")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E8EBF0")}
            />
          </div>

          {/* Total points */}
          <div style={{
            margin: "12px 20px 8px",
            padding: "14px 16px",
            background: "linear-gradient(135deg, rgba(108,92,231,0.04), rgba(74,144,217,0.04))",
            borderRadius: 10, border: "1px solid #F0F2F8",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8892A4" }}>Total des points actifs</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                <span style={{
                  fontFamily: "var(--font-space-mono), monospace",
                  fontSize: 22, fontWeight: 700,
                  color: totalOk ? "#2ECC71" : activeTotal > 100 ? "#E74C3C" : "#F39C12",
                }}>{activeTotal}</span>
                <span style={{ fontSize: 12, color: "#8892A4" }}>/ 100 pts</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: totalOk ? "#2ECC71" : "#F39C12", fontWeight: 600 }}>
              {totalOk ? "✓ Parfait" : activeTotal > 100 ? "⚠ Trop élevé" : "⚠ Incomplet"}
            </div>
          </div>
          <div style={{ margin: "0 20px 14px", height: 4, background: "#F4F6FB", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: totalOk ? "#2ECC71" : activeTotal > 100 ? "#E74C3C" : "#F39C12",
              width: `${Math.min(activeTotal, 100)}%`, transition: "all 0.3s",
            }} />
          </div>

          {/* Critères avec toggles */}
          <div style={{ padding: "0 20px 8px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#B0B7C8", marginBottom: 12 }}>
              Critères prédéfinis
            </div>
            {(["competences", "experience", "disponibilite", "localisation"] as (keyof CriteriaConfig)[]).map((key) => (
              <CriterionSlider
                key={key}
                label={LABELS[key]}
                desc={DESCS[key]}
                value={criteria[key].weight}
                max={MAXS[key]}
                color={COLORS[key]}
                enabled={criteria[key].enabled}
                onToggle={(enabled) => updateCriterion(key, "enabled", enabled)}
                onChange={(v) => updateCriterion(key, "weight", v)}
              />
            ))}
          </div>

          {/* ── BARRE DE SAUVEGARDE ── */}
          <div style={{
            margin: "4px 20px 16px",
            padding: "14px 16px",
            background: "#F8F9FC",
            borderRadius: 12, border: "1px solid #F0F2F8",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8892A4", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
              Sauvegarder comme preset
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={presetName}
                onChange={(e) => { setPresetName(e.target.value); setSaveError("") }}
                placeholder="Nom du preset (ex: Cariste)"
                style={{
                  flex: 1, padding: "8px 12px",
                  border: `1.5px solid ${saveError ? "#E74C3C" : "#E8EBF0"}`, borderRadius: 9,
                  fontSize: 12, fontFamily: "inherit", color: "#1A1D23", outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6C5CE7")}
                onBlur={(e) => (e.currentTarget.style.borderColor = saveError ? "#E74C3C" : "#E8EBF0")}
              />
              <input
                value={presetJobType}
                onChange={(e) => setPresetJobType(e.target.value)}
                placeholder="Type de poste"
                style={{
                  width: 120, padding: "8px 12px",
                  border: "1.5px solid #E8EBF0", borderRadius: 9,
                  fontSize: 12, fontFamily: "inherit", color: "#1A1D23", outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6C5CE7")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E8EBF0")}
              />
            </div>
            {saveError && <div style={{ fontSize: 11, color: "#E74C3C", marginBottom: 8 }}>{saveError}</div>}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%", padding: "9px 0",
                background: saving ? "#E8EBF0" : "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
                color: saving ? "#B0B7C8" : "#fff",
                border: "none", borderRadius: 9,
                fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {saving ? "Sauvegarde..." : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Sauvegarder le preset
                </>
              )}
            </button>
          </div>

          {/* Bouton lancer */}
          <div style={{ padding: "0 20px 20px" }}>
            <button
              onClick={handleScore}
              disabled={loading || !jobDescription.trim() || !totalOk}
              style={{
                width: "100%", padding: "13px 0",
                background: loading || !jobDescription.trim() || !totalOk
                  ? "#E8EBF0"
                  : "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
                color: loading || !jobDescription.trim() || !totalOk ? "#B0B7C8" : "#fff",
                border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: loading || !jobDescription.trim() || !totalOk ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, border: "2px solid #fff",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Lancer le scoring IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── PANEL DROIT ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E8EBF0", overflow: "hidden" }}>
          {/* Header résultats */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid #F0F2F8",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1D23" }}>
              {results ? `${filtered.length} candidat${filtered.length !== 1 ? "s" : ""} scorés` : "Candidats scorés"}
            </div>
            {results && (
              <div style={{ display: "flex", gap: 6 }}>
                {(["all", "high", "available"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: "1.5px solid",
                      borderColor: filter === f ? "#6C5CE7" : "#E8EBF0",
                      background: filter === f ? "#F0EEFF" : "transparent",
                      color: filter === f ? "#6C5CE7" : "#8892A4",
                      cursor: "pointer",
                    }}
                  >
                    {f === "all" ? "Tous" : f === "high" ? "Score élevé" : "Disponibles"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contenu */}
          {!results && !loading && (
            <EmptyState candidateCount={candidateCount} />
          )}
          {loading && <LoadingState />}
          {results && !loading && filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "#8892A4" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>Aucun candidat pour ce filtre</div>
            </div>
          )}
          {results && !loading && filtered.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16, padding: "16px 20px 20px",
            }}>
              {filtered.map((c, i) => (
                <CandidateScoreCard key={c.id} candidate={c} rank={i + 1} criteria={criteria} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

const LABELS: Record<keyof CriteriaConfig, string> = {
  competences: "Compétences",
  experience: "Expérience",
  disponibilite: "Disponibilité",
  localisation: "Localisation",
}
const DESCS: Record<keyof CriteriaConfig, string> = {
  competences: "Compétences et savoir-faire",
  experience: "Années d'expérience",
  disponibilite: "Disponibilité immédiate",
  localisation: "Proximité géographique",
}
const COLORS: Record<keyof CriteriaConfig, string> = {
  competences: "#6C5CE7",
  experience: "#4A90D9",
  disponibilite: "#2ECC71",
  localisation: "#F39C12",
}
const MAXS: Record<keyof CriteriaConfig, number> = {
  competences: 60,
  experience: 50,
  disponibilite: 40,
  localisation: 30,
}

function CriterionSlider({
  label, desc, value, max, color, enabled, onToggle, onChange,
}: {
  label: string; desc: string; value: number; max: number; color: string
  enabled: boolean; onToggle: (v: boolean) => void; onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 16, opacity: enabled ? 1 : 0.45, transition: "opacity 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Toggle */}
          <button
            onClick={() => onToggle(!enabled)}
            title={enabled ? "Désactiver ce critère" : "Activer ce critère"}
            style={{
              width: 32, height: 18, borderRadius: 9, border: "none", padding: 0,
              cursor: "pointer", position: "relative", flexShrink: 0,
              background: enabled ? color : "#D1D5DB",
              transition: "background 0.2s",
            }}
          >
            <div style={{
              position: "absolute", top: 2, left: enabled ? 16 : 2,
              width: 14, height: 14, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </button>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1D23" }}>{label}</span>
            <span style={{ fontSize: 11, color: "#8892A4", marginLeft: 6 }}>{desc}</span>
          </div>
        </div>
        <span style={{
          fontFamily: "var(--font-space-mono), monospace", fontSize: 13, fontWeight: 700,
          color: enabled ? color : "#B0B7C8",
        }}>{enabled ? `${value} pts` : "—"}</span>
      </div>
      <input
        type="range" min={0} max={max} step={5} value={value}
        disabled={!enabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: enabled ? "pointer" : "not-allowed" }}
      />
    </div>
  )
}

function ScoreRing({ score, maxScore }: { score: number; maxScore: number }) {
  const r = 22
  const circumference = 2 * Math.PI * r
  const pct = maxScore > 0 ? score / maxScore : 0
  const offset = circumference * (1 - pct)
  const color = pct >= 0.75 ? "#2ECC71" : pct >= 0.5 ? "#F39C12" : "#E74C3C"
  const displayScore = maxScore === 100 ? score : Math.round(pct * 100)
  return (
    <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
      <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="#F4F6FB" strokeWidth="4.5" />
        <circle
          cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color,
      }}>{displayScore}</div>
    </div>
  )
}

function CandidateScoreCard({ candidate: c, criteria }: { candidate: ScoredCandidate; rank: number; criteria: CriteriaConfig }) {
  const scoreColor = c.score >= 75 ? "#2ECC71" : c.score >= 50 ? "#F39C12" : "#E74C3C"
  const availColor = c.availability === "AVAILABLE" ? { bg: "#F0FFF4", color: "#2ECC71" } : c.availability === "BUSY" ? { bg: "#FFFAF0", color: "#F39C12" } : { bg: "#FFF5F5", color: "#E74C3C" }
  const availLabel = c.availability === "AVAILABLE" ? "Disponible" : c.availability === "BUSY" ? "En mission" : "Indisponible"
  const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase()

  // Only show active criteria in breakdown
  const activeCriteriaKeys = (Object.entries(criteria) as [keyof CriteriaConfig, CriterionConfig][])
    .filter(([, cfg]) => cfg.enabled)
    .map(([key]) => key)

  const maxScore = activeCriteriaKeys.reduce((sum, key) => sum + criteria[key].weight, 0)

  return (
    <div style={{
      border: "1.5px solid #E8EBF0", borderRadius: 16, overflow: "hidden",
      animation: "fadeUp 0.35s ease backwards",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(108,92,231,0.12)"
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.borderColor = "rgba(108,92,231,0.2)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.borderColor = "#E8EBF0"
      }}
    >
      {/* Score bar top */}
      <div style={{ height: 3, background: "#F4F6FB" }}>
        <div style={{ height: "100%", width: `${maxScore > 0 ? (c.score / maxScore) * 100 : 0}%`, background: scoreColor, transition: "width 0.8s ease" }} />
      </div>

      {/* Card body */}
      <div style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 15,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1D23" }}>{c.firstName} {c.lastName}</div>
          <div style={{ fontSize: 11.5, color: "#8892A4", marginTop: 2 }}>
            {c.city || "Ville NC"} · {c.experience ? `${c.experience} ans` : "Exp. NC"}
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", marginTop: 8,
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: availColor.bg, color: availColor.color,
          }}>{availLabel}</span>
        </div>
        <ScoreRing score={c.score} maxScore={maxScore} />
      </div>

      {/* Breakdown bars — only active criteria */}
      <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
        {activeCriteriaKeys.map((key) => {
          const earned = c.breakdown[key]
          const maxPts = criteria[key].weight
          const pct = maxPts > 0 ? (earned / maxPts) * 100 : 0
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#8892A4", width: 90, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {LABELS[key]}
              </div>
              <div style={{ flex: 1, height: 4, background: "#F0F2F8", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: COLORS[key],
                  width: `${pct}%`, transition: "width 0.7s ease",
                }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, width: 32, textAlign: "right", color: COLORS[key] }}>
                {earned}/{maxPts}
              </div>
            </div>
          )
        })}
      </div>

      {/* Raison */}
      {c.reason && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ fontSize: 11, color: "#8892A4", lineHeight: 1.5, fontStyle: "italic" }}>
            &ldquo;{c.reason}&rdquo;
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: "10px 16px 14px", borderTop: "1px solid #F0F2F8", display: "flex", gap: 6 }}>
        <ActionBtn label="📄 CV" onClick={async () => {
          if (!c.cvUrl) return
          const url = await getCvSignedUrl(c.cvUrl)
          window.open(url, "_blank")
        }} />
        <ActionBtn label="📱 Contacter" onClick={() => {}} green />
        <ActionBtn label="🚀 Proposer" onClick={() => {}} primary />
      </div>
    </div>
  )
}

function ActionBtn({ label, onClick, primary, green }: { label: string; onClick: () => void; primary?: boolean; green?: boolean }) {
  const base: React.CSSProperties = {
    flex: 1, padding: "8px 6px", borderRadius: 9, fontSize: 11.5, fontWeight: 700,
    cursor: "pointer", border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", fontFamily: "inherit",
  }
  const style: React.CSSProperties = primary
    ? { ...base, background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)", color: "#fff", borderColor: "transparent" }
    : green
    ? { ...base, background: "transparent", color: "#8892A4", borderColor: "#E8EBF0" }
    : { ...base, background: "transparent", color: "#8892A4", borderColor: "#E8EBF0" }

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (primary) { e.currentTarget.style.transform = "translateY(-1px)"; return }
        e.currentTarget.style.borderColor = green ? "#2ECC71" : "#6C5CE7"
        e.currentTarget.style.color = green ? "#2ECC71" : "#6C5CE7"
        e.currentTarget.style.background = green ? "#F0FFF4" : "#F0EEFF"
      }}
      onMouseLeave={(e) => {
        if (primary) { e.currentTarget.style.transform = "translateY(0)"; return }
        e.currentTarget.style.borderColor = "#E8EBF0"
        e.currentTarget.style.color = "#8892A4"
        e.currentTarget.style.background = "transparent"
      }}
    >{label}</button>
  )
}

function EmptyState({ candidateCount }: { candidateCount: number }) {
  return (
    <div style={{ padding: "64px 32px", textAlign: "center", color: "#8892A4" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1D23", marginBottom: 8 }}>
        {candidateCount} candidat{candidateCount !== 1 ? "s" : ""} prêt{candidateCount !== 1 ? "s" : ""} à être scoré{candidateCount !== 1 ? "s" : ""}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
        Décrivez le poste à pourvoir dans le panel gauche, puis cliquez sur &ldquo;Lancer le scoring IA&rdquo;.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: "64px 32px", textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, border: "3px solid #F0EEFF",
        borderTopColor: "#6C5CE7", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto 20px",
      }} />
      <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1D23", marginBottom: 6 }}>
        Claude analyse vos candidats...
      </div>
      <div style={{ fontSize: 12, color: "#8892A4" }}>Scoring en cours — quelques secondes</div>
    </div>
  )
}
