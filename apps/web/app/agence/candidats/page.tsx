import { getCandidates, getClientsWithMissions } from "./actions"
import { CvthequeClient } from "./cvtheque-client"

export default async function CandidatsPage() {
  const [candidates, clients] = await Promise.all([
    getCandidates(),
    getClientsWithMissions(),
  ])
  return <CvthequeClient candidates={candidates} clients={clients} />
}
