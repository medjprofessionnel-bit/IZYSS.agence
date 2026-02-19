"use server"

import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/prisma"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export type ScoredCandidate = {
  id: string
  firstName: string
  lastName: string
  city: string | null
  experience: number | null
  availability: string
  skills: string[]
  cvUrl: string | null
  score: number
  breakdown: {
    competences: number
    experience: number
    disponibilite: number
    localisation: number
  }
  reason: string
}

export type CriterionConfig = { weight: number; enabled: boolean }
export type CriteriaConfig = {
  competences: CriterionConfig
  experience: CriterionConfig
  disponibilite: CriterionConfig
  localisation: CriterionConfig
}

// Legacy type kept for any existing references
export type Criteria = {
  competences: number
  experience: number
  disponibilite: number
  localisation: number
}

export async function scoreCandidates(
  jobDescription: string,
  criteria: CriteriaConfig
): Promise<ScoredCandidate[]> {
  const agency = await prisma.agency.findFirst()
  if (!agency) return []

  const candidates = await prisma.candidate.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: "desc" },
  })

  if (candidates.length === 0) return []

  const candidateData = candidates.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    city: c.city || "Non renseignée",
    skills: c.skills,
    experience: c.experience || 0,
    availability: c.availability,
  }))

  // Only include enabled criteria
  const activeCriteria = (Object.entries(criteria) as [keyof CriteriaConfig, CriterionConfig][])
    .filter(([, cfg]) => cfg.enabled)

  const criteriaLines = activeCriteria.map(([key, cfg]) => {
    const labels: Record<keyof CriteriaConfig, string> = {
      competences: "Compétences et savoir-faire",
      experience: "Expérience",
      disponibilite: "Disponibilité (AVAILABLE = max, BUSY = 50%, UNAVAILABLE = 0)",
      localisation: "Localisation / proximité géographique",
    }
    return `- ${labels[key]}: ${cfg.weight} pts max`
  }).join("\n")

  const activeKeys = activeCriteria.map(([key]) => key)
  const totalMax = activeCriteria.reduce((sum, [, cfg]) => sum + cfg.weight, 0)

  const breakdownFields = activeKeys.map((k) => `      "${k}": <number>`).join(",\n")

  const prompt = `Tu es un expert en recrutement d'intérim français. Analyse et score ces candidats pour le poste décrit.

POSTE À POURVOIR:
${jobDescription}

CRITÈRES ET POIDS MAXIMAUX (total: ${totalMax} pts):
${criteriaLines}

CANDIDATS À SCORER:
${JSON.stringify(candidateData, null, 2)}

Réponds UNIQUEMENT avec un tableau JSON valide. Chaque objet doit avoir exactement ces champs:
[
  {
    "id": "id_du_candidat",
    "score": <nombre entre 0 et ${totalMax}>,
    "breakdown": {
${breakdownFields}
    },
    "reason": "Correspondance excellente grâce à ses compétences en X et Y"
  }
]

Assure-toi que score = somme des valeurs de breakdown.
Ne dépasse jamais le max de chaque critère.
N'inclus dans breakdown QUE les critères listés ci-dessus.`

  const response = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : "[]"
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const scored: { id: string; score: number; breakdown: Record<string, number>; reason: string }[] = JSON.parse(cleaned)

  // Fusionne les scores avec les données candidats
  const result: ScoredCandidate[] = scored.map((s) => {
    const c = candidates.find((c) => c.id === s.id)!
    // Build full breakdown (0 for disabled criteria)
    const breakdown = {
      competences: s.breakdown.competences ?? 0,
      experience: s.breakdown.experience ?? 0,
      disponibilite: s.breakdown.disponibilite ?? 0,
      localisation: s.breakdown.localisation ?? 0,
    }
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      city: c.city,
      experience: c.experience,
      availability: c.availability,
      skills: c.skills,
      cvUrl: c.cvUrl,
      score: s.score,
      breakdown,
      reason: s.reason,
    }
  })

  // Trie par score décroissant
  return result.sort((a, b) => b.score - a.score)
}
