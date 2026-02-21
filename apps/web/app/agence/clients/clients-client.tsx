"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  createClient,
  updateClient,
  deleteClient,
  importClients,
  type ClientWithMissions,
  type ClientFormData,
  type ImportRow,
} from "./actions"

const SECTEURS = [
  "BTP",
  "Transport/Logistique",
  "Industrie",
  "Commerce/Distribution",
  "Santé",
  "Hôtellerie/Restauration",
  "IT/Tech",
  "Services",
  "Autre",
]

// ─── Styles communs ───────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #E8EBF0",
  borderRadius: 8,
  fontSize: 14,
  color: "#1A1D23",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6B7294",
  marginBottom: 4,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}

const btnPrimary: React.CSSProperties = {
  background: "#6C5CE7",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
}

const btnSecondary: React.CSSProperties = {
  background: "#fff",
  color: "#6B7294",
  border: "1.5px solid #E8EBF0",
  borderRadius: 8,
  padding: "9px 18px",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
}

const btnDanger: React.CSSProperties = {
  background: "#FFF0F0",
  color: "#E53E3E",
  border: "1.5px solid #FED7D7",
  borderRadius: 8,
  padding: "9px 18px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
}

// ─── Pill statut ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const isActive = status === "ACTIF"
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: isActive ? "#F0FFF4" : "#FFF5F5",
      color: isActive ? "#276749" : "#C53030",
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: isActive ? "#38A169" : "#E53E3E",
        display: "inline-block",
      }} />
      {isActive ? "Actif" : "Inactif"}
    </span>
  )
}

// ─── Formulaire client ────────────────────────────────────────────────────────
function ClientForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Partial<ClientFormData>
  onSubmit: (data: ClientFormData) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<ClientFormData>({
    name: initial?.name || "",
    contact: initial?.contact || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    address: initial?.address || "",
    siret: initial?.siret || "",
    city: initial?.city || "",
    postalCode: initial?.postalCode || "",
    sector: initial?.sector || "",
    status: initial?.status || "ACTIF",
    paymentConditions: initial?.paymentConditions || "",
    notes: initial?.notes || "",
  })

  const set = (field: keyof ClientFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  const row2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>Nom de l'entreprise *</label>
        <input style={inputStyle} value={form.name} onChange={set("name")} required placeholder="Ex : Groupe Martin BTP" />
      </div>

      <div style={row2}>
        <div>
          <label style={labelStyle}>SIRET</label>
          <input style={inputStyle} value={form.siret} onChange={set("siret")} placeholder="14 chiffres" maxLength={14} />
        </div>
        <div>
          <label style={labelStyle}>Secteur</label>
          <select style={inputStyle} value={form.sector} onChange={set("sector")}>
            <option value="">— Choisir —</option>
            {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Contact principal</label>
        <input style={inputStyle} value={form.contact} onChange={set("contact")} placeholder="Prénom Nom" />
      </div>

      <div style={row2}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={form.email} onChange={set("email")} placeholder="contact@entreprise.fr" />
        </div>
        <div>
          <label style={labelStyle}>Téléphone</label>
          <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="06 12 34 56 78" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Adresse</label>
        <input style={inputStyle} value={form.address} onChange={set("address")} placeholder="12 rue des Artisans" />
      </div>

      <div style={row2}>
        <div>
          <label style={labelStyle}>Ville</label>
          <input style={inputStyle} value={form.city} onChange={set("city")} placeholder="Lyon" />
        </div>
        <div>
          <label style={labelStyle}>Code postal</label>
          <input style={inputStyle} value={form.postalCode} onChange={set("postalCode")} placeholder="69001" maxLength={5} />
        </div>
      </div>

      <div style={row2}>
        <div>
          <label style={labelStyle}>Conditions de paiement</label>
          <input style={inputStyle} value={form.paymentConditions} onChange={set("paymentConditions")} placeholder="30 jours nets" />
        </div>
        <div>
          <label style={labelStyle}>Statut</label>
          <select style={inputStyle} value={form.status} onChange={set("status")}>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Notes internes</label>
        <textarea
          style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
          value={form.notes}
          onChange={set("notes")}
          placeholder="Informations complémentaires..."
        />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button type="button" style={btnSecondary} onClick={onCancel}>Annuler</button>
        <button type="submit" style={btnPrimary} disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,29,35,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: "min(560px, 95vw)", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1D23", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6B7294", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Drawer fiche client ──────────────────────────────────────────────────────
function ClientDrawer({
  client,
  onClose,
  onEdit,
}: {
  client: ClientWithMissions
  onClose: () => void
  onEdit: () => void
}) {
  const activeMissions = client.missions.filter((m) => m.status === "OPEN" || m.status === "IN_PROGRESS")

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null
    return (
      <div style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #F0F2F8" }}>
        <span style={{ width: 140, flexShrink: 0, fontSize: 12, color: "#8892A4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", paddingTop: 1 }}>{label}</span>
        <span style={{ fontSize: 14, color: "#1A1D23" }}>{value}</span>
      </div>
    )
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,29,35,0.35)",
      display: "flex", justifyContent: "flex-end", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        width: "min(560px, 100vw)", height: "100%", background: "#fff",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: "24px 28px",
          borderBottom: "1px solid #F0F2F8",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40,
                background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0,
              }}>
                {client.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1A1D23" }}>{client.name}</h2>
                <StatusPill status={client.status} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={btnPrimary} onClick={onEdit}>Modifier</button>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6B7294" }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", flex: 1 }}>
          {/* Infos générales */}
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8892A4", marginBottom: 12, marginTop: 0 }}>
            Informations
          </h3>
          <div style={{ marginBottom: 24 }}>
            <InfoRow label="SIRET" value={client.siret} />
            <InfoRow label="Secteur" value={client.sector} />
            <InfoRow label="Ville" value={client.city ? `${client.city}${client.postalCode ? ` ${client.postalCode}` : ""}` : null} />
            <InfoRow label="Adresse" value={client.address} />
            <InfoRow label="Contact" value={client.contact} />
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Téléphone" value={client.phone} />
            <InfoRow label="Paiement" value={client.paymentConditions} />
          </div>

          {/* Missions actives */}
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8892A4", marginBottom: 12 }}>
            Missions actives ({activeMissions.length})
          </h3>
          {activeMissions.length === 0 ? (
            <div style={{ fontSize: 14, color: "#B0B7C8", padding: "12px 0" }}>Aucune mission active</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
              {activeMissions.map((m) => (
                <div key={m.id} style={{
                  padding: "10px 14px",
                  background: "#F4F6FB",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#1A1D23",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span>Mission #{m.id.slice(-6)}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: m.status === "OPEN" ? "#EBF8FF" : "#FFF8E1",
                    color: m.status === "OPEN" ? "#2B6CB0" : "#D69E2E",
                  }}>
                    {m.status === "OPEN" ? "Ouverte" : "En cours"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8892A4", marginBottom: 12 }}>
                Notes
              </h3>
              <div style={{
                background: "#FFFBEB",
                border: "1px solid #F6E05E",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: 14,
                color: "#1A1D23",
                lineHeight: 1.6,
                marginBottom: 24,
                whiteSpace: "pre-wrap",
              }}>
                {client.notes}
              </div>
            </>
          )}

          {/* Historique */}
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8892A4", marginBottom: 12 }}>
            Historique
          </h3>
          <div style={{ fontSize: 13, color: "#6B7294", display: "flex", flexDirection: "column", gap: 6 }}>
            <div>Créé le {new Date(client.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div>
            <div>Modifié le {new Date(client.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Import CSV ─────────────────────────────────────────────────────────
function ImportModal({
  onClose,
  onImport,
  loading,
}: {
  onClose: () => void
  onImport: (rows: ImportRow[]) => void
  loading: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [parseError, setParseError] = useState("")
  const [fileName, setFileName] = useState("")

  const EXPECTED_COLS = [
    "nom_entreprise",
    "siret",
    "contact_principal_nom",
    "contact_principal_email",
    "contact_principal_telephone",
    "adresse",
    "ville",
    "code_postal",
    "secteur_activite",
    "statut",
  ] as const

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseError("")

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const lines = text.split(/\r?\n/).filter((l) => l.trim())
      if (lines.length < 2) {
        setParseError("Le fichier doit contenir au moins une ligne d'en-têtes et une ligne de données.")
        return
      }

      // Détecter le séparateur (virgule ou point-virgule)
      const separator = lines[0].includes(";") ? ";" : ","
      const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase().replace(/"/g, ""))

      const rows: ImportRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separator).map((v) => v.trim().replace(/^"|"$/g, ""))
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ""
        })
        if (row.nom_entreprise) {
          rows.push(row as ImportRow)
        }
      }

      if (rows.length === 0) {
        setParseError("Aucune ligne valide trouvée. Vérifiez que la colonne 'nom_entreprise' est présente.")
        return
      }

      setPreview(rows)
    }
    reader.readAsText(file, "UTF-8")
  }

  return (
    <Modal title="Importer des clients (CSV)" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Instructions */}
        <div style={{
          background: "#F4F6FB",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 13,
          color: "#4A5568",
          lineHeight: 1.6,
        }}>
          <strong>Colonnes attendues (séparateur virgule ou point-virgule) :</strong><br />
          <code style={{ fontSize: 12, color: "#6C5CE7" }}>
            {EXPECTED_COLS.join(", ")}
          </code>
          <br /><br />
          Seul <strong>nom_entreprise</strong> est obligatoire. Le SIRET doit être 14 chiffres.
        </div>

        {/* Upload */}
        <div>
          <label style={labelStyle}>Fichier CSV</label>
          <div
            style={{
              border: "2px dashed #E8EBF0",
              borderRadius: 8,
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              background: "#FAFBFC",
            }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleFile} />
            {fileName ? (
              <div style={{ fontSize: 14, color: "#6C5CE7", fontWeight: 600 }}>📄 {fileName}</div>
            ) : (
              <div style={{ fontSize: 14, color: "#B0B7C8" }}>Cliquer pour sélectionner un fichier CSV</div>
            )}
          </div>
        </div>

        {/* Erreur */}
        {parseError && (
          <div style={{ background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#C53030" }}>
            {parseError}
          </div>
        )}

        {/* Prévisualisation */}
        {preview.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1D23", marginBottom: 8 }}>
              Aperçu — {preview.length} ligne(s) détectée(s)
            </div>
            <div style={{ border: "1px solid #E8EBF0", borderRadius: 8, overflow: "auto", maxHeight: 200 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#F4F6FB" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6B7294", fontWeight: 600, borderBottom: "1px solid #E8EBF0" }}>Entreprise</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6B7294", fontWeight: 600, borderBottom: "1px solid #E8EBF0" }}>SIRET</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6B7294", fontWeight: 600, borderBottom: "1px solid #E8EBF0" }}>Secteur</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6B7294", fontWeight: 600, borderBottom: "1px solid #E8EBF0" }}>Ville</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F0F2F8" }}>
                      <td style={{ padding: "7px 12px", color: "#1A1D23" }}>{row.nom_entreprise}</td>
                      <td style={{ padding: "7px 12px", color: "#6B7294" }}>{row.siret || "—"}</td>
                      <td style={{ padding: "7px 12px", color: "#6B7294" }}>{row.secteur_activite || "—"}</td>
                      <td style={{ padding: "7px 12px", color: "#6B7294" }}>{row.ville || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <div style={{ padding: "8px 12px", fontSize: 12, color: "#8892A4", textAlign: "center" }}>
                  + {preview.length - 10} autres lignes…
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btnSecondary} onClick={onClose}>Annuler</button>
          <button
            style={{ ...btnPrimary, opacity: preview.length === 0 || loading ? 0.6 : 1 }}
            disabled={preview.length === 0 || loading}
            onClick={() => onImport(preview)}
          >
            {loading ? "Import en cours…" : `Importer ${preview.length} client(s)`}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function ClientsClient({ clients: initialClients }: { clients: ClientWithMissions[] }) {
  const [clients, setClients] = useState(initialClients)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Modals / drawers
  const [showAddModal, setShowAddModal] = useState(false)
  const [editClient, setEditClient] = useState<ClientWithMissions | null>(null)
  const [drawerClient, setDrawerClient] = useState<ClientWithMissions | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClientWithMissions | null>(null)
  const [showImport, setShowImport] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  // Filtres
  const [search, setSearch] = useState("")
  const [filterSector, setFilterSector] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  // Import result
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Filtrage
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.contact?.toLowerCase().includes(q) ?? false) ||
      (c.siret?.includes(q) ?? false) ||
      (c.city?.toLowerCase().includes(q) ?? false)
    const matchSector = !filterSector || c.sector === filterSector
    const matchStatus = !filterStatus || c.status === filterStatus
    return matchSearch && matchSector && matchStatus
  })

  // Handlers
  const handleCreate = (data: ClientFormData) => {
    startTransition(async () => {
      try {
        const newClient = await createClient(data)
        setClients((prev) => [...prev, { ...newClient, missions: [] }])
        setShowAddModal(false)
        showToast("Client ajouté avec succès")
      } catch {
        showToast("Erreur lors de la création", "error")
      }
    })
  }

  const handleUpdate = (data: ClientFormData) => {
    if (!editClient) return
    startTransition(async () => {
      try {
        const updated = await updateClient(editClient.id, data)
        setClients((prev) =>
          prev.map((c) => (c.id === editClient.id ? { ...c, ...updated } : c))
        )
        // Mettre à jour le drawer si ouvert
        if (drawerClient?.id === editClient.id) {
          setDrawerClient((prev) => prev ? { ...prev, ...updated } : null)
        }
        setEditClient(null)
        showToast("Client modifié avec succès")
      } catch {
        showToast("Erreur lors de la modification", "error")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      try {
        await deleteClient(deleteTarget.id)
        setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id))
        if (drawerClient?.id === deleteTarget.id) setDrawerClient(null)
        setDeleteTarget(null)
        showToast("Client supprimé")
      } catch (e) {
        setDeleteTarget(null)
        showToast((e as Error).message, "error")
      }
    })
  }

  const handleImport = (rows: ImportRow[]) => {
    startTransition(async () => {
      try {
        const result = await importClients(rows)
        setImportResult(result)
        setShowImport(false)
        router.refresh()
      } catch {
        showToast("Erreur lors de l'import", "error")
      }
    })
  }

  const activeMissionsCount = (c: ClientWithMissions) =>
    c.missions.filter((m) => m.status === "OPEN" || m.status === "IN_PROGRESS").length

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 9999,
          background: toast.type === "success" ? "#276749" : "#C53030",
          color: "#fff",
          padding: "14px 22px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "fadeIn 0.2s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Résultat import */}
      {importResult && (
        <div style={{
          background: "#F0FFF4",
          border: "1px solid #9AE6B4",
          borderRadius: 10,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
        }}>
          <div>
            ✅ Import terminé : <strong>{importResult.imported} importé(s)</strong>, {importResult.skipped} ignoré(s)
            {importResult.errors.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#C53030" }}>
                {importResult.errors.slice(0, 3).map((e, i) => <div key={i}>• {e}</div>)}
                {importResult.errors.length > 3 && <div>+ {importResult.errors.length - 3} autres erreurs</div>}
              </div>
            )}
          </div>
          <button onClick={() => setImportResult(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#276749" }}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1D23", margin: 0 }}>
            Clients 🏢
          </h1>
          <p style={{ fontSize: 14, color: "#8892A4", margin: "4px 0 0" }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnSecondary} onClick={() => setShowImport(true)}>
            ↑ Importer CSV
          </button>
          <button style={btnPrimary} onClick={() => setShowAddModal(true)}>
            + Ajouter un client
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: "#fff",
        border: "1px solid #E8EBF0",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 20,
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <input
          style={{ ...inputStyle, maxWidth: 280 }}
          placeholder="Rechercher par nom, contact, SIRET, ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={{ ...inputStyle, maxWidth: 200 }}
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
        >
          <option value="">Tous les secteurs</option>
          {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          style={{ ...inputStyle, maxWidth: 160 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
        </select>
        {(search || filterSector || filterStatus) && (
          <button
            style={{ ...btnSecondary, padding: "9px 14px", fontSize: 13 }}
            onClick={() => { setSearch(""); setFilterSector(""); setFilterStatus("") }}
          >
            Réinitialiser
          </button>
        )}
        {filtered.length !== clients.length && (
          <span style={{ fontSize: 13, color: "#8892A4", marginLeft: "auto" }}>
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: "#fff",
        border: "1px solid #E8EBF0",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F4F6FB" }}>
              {["Nom", "SIRET", "Contact", "Secteur", "Statut", "Missions actives", "Actions"].map((col) => (
                <th key={col} style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#8892A4",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  borderBottom: "1px solid #E8EBF0",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center", color: "#B0B7C8", fontSize: 14 }}>
                  {clients.length === 0
                    ? "Aucun client pour le moment. Ajoutez votre premier client !"
                    : "Aucun résultat pour ces filtres."}
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr
                  key={client.id}
                  style={{ borderBottom: "1px solid #F0F2F8", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  onClick={() => setDrawerClient(client)}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1A1D23" }}>{client.name}</div>
                    {client.city && (
                      <div style={{ fontSize: 12, color: "#8892A4", marginTop: 2 }}>
                        {client.city}{client.postalCode ? ` ${client.postalCode}` : ""}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B7294", fontFamily: "monospace" }}>
                    {client.siret || "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {client.contact ? (
                      <div>
                        <div style={{ fontSize: 13, color: "#1A1D23" }}>{client.contact}</div>
                        {client.phone && <div style={{ fontSize: 12, color: "#8892A4" }}>{client.phone}</div>}
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "#B0B7C8" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B7294" }}>
                    {client.sector || "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusPill status={client.status} />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {activeMissionsCount(client) > 0 ? (
                      <span style={{
                        background: "#EBF8FF",
                        color: "#2B6CB0",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {activeMissionsCount(client)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: "#B0B7C8" }}>0</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        style={{
                          background: "#F4F6FB",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6C5CE7",
                          cursor: "pointer",
                        }}
                        onClick={() => { setDrawerClient(null); setEditClient(client) }}
                      >
                        Modifier
                      </button>
                      <button
                        style={{
                          background: "#FFF5F5",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#C53030",
                          cursor: "pointer",
                        }}
                        onClick={() => setDeleteTarget(client)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout */}
      {showAddModal && (
        <Modal title="Ajouter un client" onClose={() => setShowAddModal(false)}>
          <ClientForm onSubmit={handleCreate} onCancel={() => setShowAddModal(false)} loading={isPending} />
        </Modal>
      )}

      {/* Modal Édition */}
      {editClient && (
        <Modal title={`Modifier — ${editClient.name}`} onClose={() => setEditClient(null)}>
          <ClientForm
            initial={{
              name: editClient.name,
              contact: editClient.contact ?? undefined,
              email: editClient.email ?? undefined,
              phone: editClient.phone ?? undefined,
              address: editClient.address ?? undefined,
              siret: editClient.siret ?? undefined,
              city: editClient.city ?? undefined,
              postalCode: editClient.postalCode ?? undefined,
              sector: editClient.sector ?? undefined,
              status: editClient.status,
              paymentConditions: editClient.paymentConditions ?? undefined,
              notes: editClient.notes ?? undefined,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditClient(null)}
            loading={isPending}
          />
        </Modal>
      )}

      {/* Modal Suppression */}
      {deleteTarget && (
        <Modal title="Supprimer le client" onClose={() => setDeleteTarget(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 14, color: "#4A5568", margin: 0 }}>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget.name}</strong> ?
              {activeMissionsCount(deleteTarget) > 0 && (
                <span style={{ color: "#C53030", display: "block", marginTop: 8, fontSize: 13 }}>
                  ⚠️ Ce client a {activeMissionsCount(deleteTarget)} mission(s) active(s). La suppression sera bloquée.
                </span>
              )}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={btnSecondary} onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button style={btnDanger} onClick={handleDelete} disabled={isPending}>
                {isPending ? "Suppression…" : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Drawer Fiche */}
      {drawerClient && (
        <ClientDrawer
          client={drawerClient}
          onClose={() => setDrawerClient(null)}
          onEdit={() => {
            setEditClient(drawerClient)
            setDrawerClient(null)
          }}
        />
      )}

      {/* Modal Import */}
      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} loading={isPending} />
      )}
    </div>
  )
}
