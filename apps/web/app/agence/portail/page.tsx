import { getPortalAgenceData, getCandidatesForPortal } from "./actions"
import { PortailAgenceClient } from "./portail-agence-client"

export const dynamic = "force-dynamic"

export default async function PortailAgencePage() {
  const [{ clients }, candidates] = await Promise.all([
    getPortalAgenceData(),
    getCandidatesForPortal(),
  ])
  return <PortailAgenceClient clients={clients} candidates={candidates} />
}
