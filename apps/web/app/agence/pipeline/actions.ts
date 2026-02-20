"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Anthropic from "@anthropic-ai/sdk"
import { sendSms, sendWhatsApp, buildCandidateSmsMessage, buildCandidateWhatsAppMessage } from "@/lib/twilio"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Channel = "SMS" | "WHATSAPP" | "EMAIL" | "PORTAL"

export type CreateMissionInput = {
  title: string
  clientName: string
  location: string
  startDate?: string
  endDate?: string
  targetCandidates: number
  requiredSkills: string[]
  channels: Channel[]
  description?: string
}

// ─── CRÉER MISSION + PIPELINE ─────────────────────────────────────────────────

export async function createMissionWithPipeline(input: CreateMissionInput) {
  const agency = await prisma.agency.findFirst()
  if (!agency) throw new Error("Agence introuvable")

  // Trouver ou créer le client
  let client = await prisma.client.findFirst({
    where: { name: { contains: input.clientName, mode: "insensitive" }, agencyId: agency.id },
  })
  if (!client) {
    client = await prisma.client.create({
      data: { name: input.clientName, agencyId: agency.id },
    })
  }

  // Créer la mission
  const mission = await prisma.mission.create({
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      targetCandidates: input.targetCandidates,
      requiredSkills: input.requiredSkills,
      channels: input.channels,
      clientId: client.id,
      agencyId: agency.id,
      status: "OPEN",
      source: "MANUAL",
    },
  })

  // Créer le pipeline associé (en attente de lancement)
  const pipeline = await prisma.pipeline.create({
    data: {
      missionId: mission.id,
      status: "WAITING_AGENCY",
    },
  })

  revalidatePath("/agence/pipeline")
  return { mission, pipeline }
}

// ─── LANCER LE PIPELINE (Matching IA + envoi SMS/WhatsApp) ───────────────────

export async function launchPipeline(pipelineId: string) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
    include: {
      mission: { include: { agency: true } },
      candidates: true,
    },
  })
  if (!pipeline) throw new Error("Pipeline introuvable")

  const mission = pipeline.mission
  const agency = mission.agency

  // 1. Matching IA : récupérer les candidats disponibles et scorer avec Claude
  const candidates = await prisma.candidate.findMany({
    where: { agencyId: agency.id, availability: "AVAILABLE" },
  })

  if (candidates.length === 0) {
    await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: "ALERT" },
    })
    revalidatePath("/agence/pipeline")
    return { matched: [], sent: 0 }
  }

  // Demander à Claude de scorer les candidats
  const candidatesList = candidates
    .map((c, i) => `${i + 1}. ${c.firstName} ${c.lastName} | Compétences: ${c.skills.join(", ")} | Expérience: ${c.experience ?? 0}ans | Ville: ${c.city ?? "NC"}`)
    .join("\n")

  const prompt = `Tu es un recruteur expert. Voici une mission et des candidats. Retourne UNIQUEMENT un JSON valide.

Mission: "${mission.title}"
Lieu: ${mission.location ?? "NC"}
Compétences requises: ${mission.requiredSkills.join(", ")}
Nombre de candidats recherchés: ${mission.targetCandidates ?? 3}

Candidats disponibles:
${candidatesList}

Sélectionne les ${Math.min((mission.targetCandidates ?? 3) * 2, candidates.length)} meilleurs candidats (en surtension pour avoir du choix).
Réponds UNIQUEMENT avec ce JSON:
{"selected": [<numéros 1-based des candidats, ex: [1,3,5]>]}`

  let selectedIndices: number[] = []
  try {
    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    })
    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(cleaned)
    selectedIndices = parsed.selected || []
  } catch {
    // Fallback : prendre les N premiers si Claude échoue
    selectedIndices = candidates.slice(0, (mission.targetCandidates ?? 3) * 2).map((_, i) => i + 1)
  }

  const matchedCandidates = selectedIndices
    .filter((i) => i >= 1 && i <= candidates.length)
    .map((i) => candidates[i - 1])

  // 2. Créer les PipelineCandidate et envoyer SMS/WhatsApp
  const channels = mission.channels as Channel[]
  let sentCount = 0

  for (const candidate of matchedCandidates) {
    // Éviter les doublons si le pipeline a déjà des candidats
    const existing = pipeline.candidates.find((pc) => pc.candidateId === candidate.id)
    if (existing) continue

    await prisma.pipelineCandidate.create({
      data: {
        pipelineId,
        candidateId: candidate.id,
        smsStatus: "SENT",
      },
    })

    // Envoi SMS
    if (channels.includes("SMS") && candidate.phone) {
      try {
        const msg = buildCandidateSmsMessage(mission.title, agency.name)
        await sendSms(candidate.phone, msg)
        sentCount++
      } catch (err) {
        console.error(`SMS failed for ${candidate.firstName}:`, err)
      }
    }

    // Envoi WhatsApp
    if (channels.includes("WHATSAPP") && candidate.phone) {
      try {
        const msg = buildCandidateWhatsAppMessage(mission.title, agency.name)
        await sendWhatsApp(candidate.phone, msg)
        sentCount++
      } catch (err) {
        console.error(`WhatsApp failed for ${candidate.firstName}:`, err)
      }
    }
  }

  // 3. Mettre à jour le statut pipeline
  await prisma.pipeline.update({
    where: { id: pipelineId },
    data: { status: "RUNNING" },
  })

  revalidatePath("/agence/pipeline")
  return { matched: matchedCandidates, sent: sentCount }
}

// ─── PROPOSER UN CANDIDAT AU CLIENT ──────────────────────────────────────────

export async function proposeToClient(pipelineCandidateId: string) {
  const pc = await prisma.pipelineCandidate.findUnique({
    where: { id: pipelineCandidateId },
    include: {
      pipeline: { include: { mission: { include: { client: true, agency: true } } } },
      candidate: true,
    },
  })
  if (!pc) throw new Error("Candidat pipeline introuvable")

  const mission = pc.pipeline.mission
  const channels = mission.channels as Channel[]
  const client = mission.client
  const candidate = pc.candidate

  // Marquer comme proposé
  await prisma.pipelineCandidate.update({
    where: { id: pipelineCandidateId },
    data: { proposedToClient: true, proposedAt: new Date() },
  })

  // Mettre à jour le statut pipeline
  await prisma.pipeline.update({
    where: { id: pc.pipelineId },
    data: { status: "WAITING_CLIENT" },
  })

  // Profil anonymisé
  const anonProfile = `Profil anonymisé — Mission: ${mission.title}
Compétences: ${candidate.skills.join(", ")}
Expérience: ${candidate.experience ?? "NC"} ans
Localisation: ${candidate.city ?? "NC"}`

  // Envoi selon les canaux configurés
  if (channels.includes("SMS") && client.phone) {
    try {
      await sendSms(client.phone, `${mission.agency.name} vous propose un profil pour "${mission.title}". ${anonProfile} — Répondez OUI pour valider.`)
    } catch (err) {
      console.error("SMS client failed:", err)
    }
  }

  if (channels.includes("WHATSAPP") && client.phone) {
    try {
      await sendWhatsApp(client.phone, `✅ *Profil proposé pour "${mission.title}"*\n\n${anonProfile}\n\nRépondez *OUI* pour valider ce profil.`)
    } catch (err) {
      console.error("WhatsApp client failed:", err)
    }
  }

  // Pour PORTAL : le profil est visible dans le portail client IZYSS (via proposedToClient=true)

  revalidatePath("/agence/pipeline")
  return { success: true }
}

// ─── VALIDER UN CANDIDAT (côté client) ───────────────────────────────────────

export async function validateCandidate(pipelineCandidateId: string) {
  const pc = await prisma.pipelineCandidate.update({
    where: { id: pipelineCandidateId },
    data: { clientValidated: true, selected: true },
    include: {
      pipeline: {
        include: {
          mission: true,
          candidates: true,
        },
      },
    },
  })

  // Vérifier si le quota est atteint
  const validatedCount = pc.pipeline.candidates.filter((c) => c.clientValidated).length
  const target = pc.pipeline.mission.targetCandidates ?? 1

  if (validatedCount >= target) {
    await prisma.pipeline.update({
      where: { id: pc.pipelineId },
      data: { status: "COMPLETED" },
    })
  }

  revalidatePath("/agence/pipeline")
  return { success: true, completed: validatedCount >= target }
}

// ─── RÉCUPÉRER LES PIPELINES ─────────────────────────────────────────────────

export async function getPipelines() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return []

  return prisma.pipeline.findMany({
    where: { mission: { agencyId: agency.id } },
    include: {
      mission: { include: { client: true } },
      candidates: { include: { candidate: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPipelineStats() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return { active: 0, smsSent: 0, pending: 0, validated: 0 }

  const pipelines = await prisma.pipeline.findMany({
    where: { mission: { agencyId: agency.id } },
    include: { candidates: true },
  })

  const active = pipelines.filter((p) => ["RUNNING", "WAITING_CLIENT", "WAITING_AGENCY"].includes(p.status)).length
  const smsSent = pipelines.reduce((acc, p) => acc + p.candidates.length, 0)
  const pending = pipelines.reduce(
    (acc, p) => acc + p.candidates.filter((c) => c.smsStatus === "SENT").length,
    0
  )
  const validated = pipelines.reduce(
    (acc, p) => acc + p.candidates.filter((c) => c.clientValidated).length,
    0
  )

  return { active, smsSent, pending, validated }
}
