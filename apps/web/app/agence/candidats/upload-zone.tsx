"use client"

import { useState, useRef } from "react"
import { uploadCvs } from "./actions"

export function UploadZone({ onDone }: { onDone: () => void }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ file: string; status: string; message?: string }[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setLoading(true)
    setResults([])
    setProgress({ done: 0, total: files.length })
    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append("files", f))
    const res = await uploadCvs(formData)
    setResults(res)
    setProgress({ done: res.length, total: files.length })
    setLoading(false)
    onDone()
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Zone de drop */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        style={{
          border: `2px dashed ${dragging ? "#6C5CE7" : "#E8EBF0"}`,
          borderRadius: 16,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "#F0EEFF" : "#FAFBFC",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
        <p style={{ margin: 0, fontWeight: 600, color: "#1A1D23", fontSize: 14 }}>
          Glisse tes CVs ici ou clique pour sélectionner
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8892A4" }}>
          PDF ou Word (.docx) — plusieurs fichiers acceptés
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Progression */}
      {loading && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", background: "#F0EEFF", borderRadius: 12,
        }}>
          <div style={{
            width: 18, height: 18, border: "2px solid #6C5CE7",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6C5CE7" }}>
              Parsing IA en cours — Claude analyse les CVs...
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8B7CF6" }}>
              Traitement par lots de 3 · {progress.total} fichier{progress.total > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Résultats avec scroll */}
      {results.length > 0 && (
        <div>
          {/* Résumé */}
          <div style={{
            display: "flex", gap: 10, marginBottom: 8, fontSize: 12, fontWeight: 600,
          }}>
            {successCount > 0 && (
              <span style={{ color: "#38A169", background: "#F0FFF4", padding: "3px 10px", borderRadius: 20 }}>
                ✓ {successCount} importé{successCount > 1 ? "s" : ""}
              </span>
            )}
            {errorCount > 0 && (
              <span style={{ color: "#E53E3E", background: "#FFF5F5", padding: "3px 10px", borderRadius: 20 }}>
                ✗ {errorCount} échoué{errorCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Liste scrollable */}
          <div style={{
            maxHeight: 220,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            paddingRight: 4,
          }}>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 12px", borderRadius: 10, fontSize: 12,
                  background: r.status === "success" ? "#F0FFF4" : "#FFF5F5",
                  color: r.status === "success" ? "#276749" : "#C53030",
                  flexShrink: 0,
                }}
              >
                <span style={{ flexShrink: 0, fontWeight: 700 }}>
                  {r.status === "success" ? "✓" : "✗"}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.file}
                  </p>
                  {r.message && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.8, wordBreak: "break-word" }}>
                      {r.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
