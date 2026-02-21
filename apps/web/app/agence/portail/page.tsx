import { getPortalAgenceData } from "./actions"
import { getCandidates } from "@/app/agence/candidats/actions"
import { PortailAgenceClient } from "./portail-agence-client"

export const dynamic = "force-dynamic"

export default async function PortailAgencePage() {
  const [{ clients }, candidates] = await Promise.all([
    getPortalAgenceData(),
    getCandidates(),
  ])
  return <PortailAgenceClient clients={clients} candidates={candidates} />
}
