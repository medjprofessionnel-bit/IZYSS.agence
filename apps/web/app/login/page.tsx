"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim() || loading) return
    setLoading(true)
    setError("")

    const result = await signIn.email({ email, password })

    if (result.error) {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
      return
    }

    // Redirect based on role stored in session user
    const user = result.data?.user as { role?: string } | undefined
    const role = user?.role ?? "agency_admin"
    router.push(role === "client" ? "/portail" : "/agence/dashboard")
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F4F6FB 0%, #EEF0FF 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
      padding: 24,
    }}>
      {/* Carte login */}
      <div style={{
        background: "#fff", borderRadius: 24,
        border: "1.5px solid #E8EBF0",
        boxShadow: "0 20px 60px rgba(108,92,231,0.10)",
        padding: "48px 44px",
        width: "100%", maxWidth: 420,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{
            width: 44, height: 44,
            background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            borderRadius: 13,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: "var(--font-space-mono), monospace",
            fontWeight: 700, fontSize: 16,
            boxShadow: "0 4px 16px rgba(108,92,231,0.3)",
          }}>IZ</div>
          <span style={{
            fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #6C5CE7, #4A90D9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>IZYSS</span>
        </div>

        {/* Titre */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1D23", margin: 0 }}>
            Connexion
          </h1>
          <p style={{ fontSize: 13, color: "#8892A4", marginTop: 6 }}>
            Accédez à votre espace de recrutement
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 600,
              color: "#6B7294", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="imane@mcm-mulhouse.fr"
              required
              style={{
                width: "100%", padding: "12px 14px",
                border: `1.5px solid ${error ? "#E74C3C" : "#E8EBF0"}`,
                borderRadius: 10, fontSize: 14,
                fontFamily: "inherit", color: "#1A1D23",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#6C5CE7")}
              onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#E74C3C" : "#E8EBF0")}
            />
          </div>

          <div>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 600,
              color: "#6B7294", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "12px 14px",
                border: `1.5px solid ${error ? "#E74C3C" : "#E8EBF0"}`,
                borderRadius: 10, fontSize: 14,
                fontFamily: "inherit", color: "#1A1D23",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#6C5CE7")}
              onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#E74C3C" : "#E8EBF0")}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "#FFF5F5",
              border: "1px solid #FED7D7", borderRadius: 8,
              fontSize: 13, color: "#E74C3C", fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: "13px 0",
              background: loading ? "#E8EBF0" : "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
              color: loading ? "#B0B7C8" : "#fff",
              border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 4px 16px rgba(108,92,231,0.3)",
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16, height: 16,
                  border: "2px solid #B0B7C8", borderTopColor: "transparent",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
                Connexion...
              </>
            ) : "Se connecter"}
          </button>
        </form>

        {/* Footer */}
        <p style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "#B0B7C8" }}>
          Propulsé par <strong style={{ color: "#6C5CE7" }}>IZYSS</strong> — IA au service de l&apos;intérim
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
