import { getClientPortalData } from "@/app/agence/portail/actions"
import { ClientPortalView } from "./client-portal-view"

export const dynamic = "force-dynamic"

export default async function ClientPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <InvalidAccess message="Lien invalide. Contactez votre agence." />
  }

  const client = await getClientPortalData(token)

  if (!client) {
    return <InvalidAccess message="Ce lien n'est plus valide. Contactez votre agence." />
  }

  return <ClientPortalView client={client} token={token} />
}

function InvalidAccess({ message }: { message: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#F4F6FB",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 40px",
        border: "1.5px solid #E8EBF0", textAlign: "center", maxWidth: 400,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1D23", marginBottom: 8 }}>Accès refusé</div>
        <p style={{ fontSize: 14, color: "#8892A4" }}>{message}</p>
      </div>
    </div>
  )
}
