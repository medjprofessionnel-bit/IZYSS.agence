import { prisma } from "@/lib/prisma"
import { ScoringClient } from "./scoring-client"
import { getPresets } from "./preset-actions"

async function getCandidateCount() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return 0
  return prisma.candidate.count({ where: { agencyId: agency.id } })
}

export default async function ScoringPage() {
  const [candidateCount, presets] = await Promise.all([
    getCandidateCount(),
    getPresets(),
  ])
  return <ScoringClient candidateCount={candidateCount} presets={presets} />
}
