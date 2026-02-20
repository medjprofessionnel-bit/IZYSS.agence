import { getPortalAgenceData } from "./actions"
import { PortailAgenceClient } from "./portail-agence-client"

export const dynamic = "force-dynamic"

export default async function PortailAgencePage() {
  const { clients } = await getPortalAgenceData()
  return <PortailAgenceClient clients={clients} />
}
