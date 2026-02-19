import { getCandidates } from "./actions"
import { CvthequeClient } from "./cvtheque-client"

export default async function CandidatsPage() {
  const candidates = await getCandidates()
  return <CvthequeClient candidates={candidates} />
}
