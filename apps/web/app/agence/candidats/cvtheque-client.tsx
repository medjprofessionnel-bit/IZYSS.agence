"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadZone } from "./upload-zone"
import { deleteCandidate, deleteCandidates, getCvSignedUrl } from "./actions"

type Candidate = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  city: string | null
  skills: string[]
  experience: number | null
  availability: string
  cvUrl: string | null
  createdAt: Date
}

export function CvthequeClient({ candidates }: { candidates: Candidate[] }) {
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [preview, setPreview] = useState<{ name: string; url: string } | null>(null)
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null)
  const router = useRouter()

  async function handlePreview(c: Candidate, e: React.MouseEvent) {
    e.stopPropagation()
    if (!c.cvUrl) return
    setLoadingPreview(c.id)
    const url = await getCvSignedUrl(c.cvUrl)
    setPreview({ name: `${c.firstName} ${c.lastName}`, url })
    setLoadingPreview(null)
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((c) => c.id)))
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`Supprimer ${selected.size} candidat${selected.size > 1 ? "s" : ""} ?`)) return
    setBulkDeleting(true)
    await deleteCandidates(Array.from(selected))
    setSelected(new Set())
    router.refresh()
    setBulkDeleting(false)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("Supprimer ce candidat ?")) return
    setDeleting(id)
    await deleteCandidate(id)
    router.refresh()
    setDeleting(null)
  }

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q))
    )
  })

  const availabilityLabel = (a: string) => {
    if (a === "AVAILABLE") return { label: "Disponible", color: "bg-green-100 text-green-700" }
    if (a === "BUSY") return { label: "En mission", color: "bg-orange-100 text-orange-700" }
    return { label: "Indisponible", color: "bg-red-100 text-red-700" }
  }

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif", minHeight: "100vh", background: "#F4F6FB" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8EBF0", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1D23", margin: 0 }}>CVthèque</h1>
            <p style={{ fontSize: 13, color: "#8892A4", margin: "2px 0 0" }}>
              {candidates.length} candidat{candidates.length !== 1 ? "s" : ""} dans votre base
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {selected.size > 0 && (
              <>
                <span style={{ fontSize: 13, color: "#6C5CE7", fontWeight: 600 }}>
                  {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  style={{
                    background: "#FFF5F5", color: "#E53E3E", border: "1.5px solid #FEB2B2",
                    borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", opacity: bulkDeleting ? 0.5 : 1,
                  }}
                >
                  {bulkDeleting ? "Suppression..." : "🗑 Supprimer la sélection"}
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  style={{
                    background: "none", color: "#8892A4", border: "1.5px solid #E8EBF0",
                    borderRadius: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </>
            )}
            <button
              onClick={() => setShowUpload(true)}
              style={{
                background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "10px 20px", fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              ＋ Importer des CVs
            </button>
          </div>
        </div>

        {/* Recherche + tout sélectionner */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un candidat, compétence, ville..."
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 50,
              border: "1.5px solid #E8EBF0", fontSize: 13,
              outline: "none", background: "#F4F6FB",
            }}
          />
          {filtered.length > 0 && (
            <button
              onClick={toggleAll}
              style={{
                background: "none", border: "1.5px solid #E8EBF0", borderRadius: 10,
                padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                color: selected.size === filtered.length ? "#6C5CE7" : "#8892A4",
                whiteSpace: "nowrap",
              }}
            >
              {selected.size === filtered.length ? "✓ Tout désélectionner" : "Tout sélectionner"}
            </button>
          )}
        </div>
      </div>

      {/* Modal upload */}
      {showUpload && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setShowUpload(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: 20, padding: 32, width: 560, maxWidth: "90vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Importer des CVs</h2>
              <button onClick={() => setShowUpload(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8892A4" }}>✕</button>
            </div>
            <UploadZone onDone={() => { router.refresh(); }} />
          </div>
        </div>
      )}

      {/* Modal aperçu PDF */}
      {preview && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 20, width: "100%", maxWidth: 900,
              height: "90vh", display: "flex", flexDirection: "column", overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 24px", borderBottom: "1px solid #E8EBF0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📄</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#1A1D23" }}>
                  CV — {preview.name}
                </span>
              </div>
              <button
                onClick={() => setPreview(null)}
                style={{
                  background: "#F4F6FB", border: "none", borderRadius: 8,
                  width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#8892A4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
            {/* PDF iframe */}
            <iframe
              src={preview.url}
              style={{ flex: 1, border: "none", width: "100%" }}
              title={`CV ${preview.name}`}
            />
          </div>
        </div>
      )}

      {/* Liste candidats */}
      <div style={{ padding: 32 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#8892A4" }}>
            {candidates.length === 0 ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#4A5568" }}>Aucun candidat pour l&apos;instant</p>
                <p style={{ fontSize: 13 }}>Cliquez sur &quot;Importer des CVs&quot; pour commencer</p>
              </>
            ) : (
              <p>Aucun résultat pour &quot;{search}&quot;</p>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {filtered.map((c) => {
              const avail = availabilityLabel(c.availability)
              const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase()
              return (
                <div
                  key={c.id}
                  style={{
                    background: selected.has(c.id) ? "#F8F6FF" : "#fff",
                    borderRadius: 16,
                    padding: 20,
                    border: `1.5px solid ${selected.has(c.id) ? "#6C5CE7" : "#E8EBF0"}`,
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, border-color 0.15s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { if (!selected.has(c.id)) e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,92,231,0.12)" }}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  {/* Checkbox sélection */}
                  <div
                    onClick={(e) => toggleSelect(c.id, e)}
                    style={{
                      position: "absolute", top: 12, left: 12,
                      width: 18, height: 18, borderRadius: 5,
                      border: `2px solid ${selected.has(c.id) ? "#6C5CE7" : "#CBD2E0"}`,
                      background: selected.has(c.id) ? "#6C5CE7" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0, zIndex: 1,
                    }}
                  >
                    {selected.has(c.id) && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, paddingLeft: 24 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1A1D23" }}>
                        {c.firstName} {c.lastName}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8892A4" }}>
                        {c.city || "Ville non renseignée"} • {c.experience ? `${c.experience} ans d'exp.` : "Exp. non renseignée"}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px",
                      borderRadius: 20, flexShrink: 0,
                    }} className={avail.color}>
                      {avail.label}
                    </span>
                    {/* Aperçu CV */}
                    {c.cvUrl && (
                      <button
                        onClick={(e) => handlePreview(c, e)}
                        disabled={loadingPreview === c.id}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#CBD2E0", fontSize: 16, padding: "2px 4px",
                          borderRadius: 6, flexShrink: 0,
                          opacity: loadingPreview === c.id ? 0.4 : 1,
                        }}
                        title="Aperçu du CV"
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6C5CE7")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#CBD2E0")}
                      >
                        {loadingPreview === c.id ? "⏳" : "👁"}
                      </button>
                    )}
                    {/* Supprimer */}
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      disabled={deleting === c.id}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#CBD2E0", fontSize: 16, padding: "2px 4px",
                        borderRadius: 6, flexShrink: 0,
                        opacity: deleting === c.id ? 0.4 : 1,
                      }}
                      title="Supprimer ce candidat"
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#E53E3E")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#CBD2E0")}
                    >
                      {deleting === c.id ? "..." : "✕"}
                    </button>
                  </div>

                  {c.skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.skills.slice(0, 4).map((skill, i) => (
                        <span key={i} style={{
                          fontSize: 11, padding: "3px 10px", borderRadius: 20,
                          background: "#F0EEFF", color: "#6C5CE7", fontWeight: 500
                        }}>
                          {skill}
                        </span>
                      ))}
                      {c.skills.length > 4 && (
                        <span style={{ fontSize: 11, color: "#8892A4", padding: "3px 6px" }}>
                          +{c.skills.length - 4}
                        </span>
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
  )
}
