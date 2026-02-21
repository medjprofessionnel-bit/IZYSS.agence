"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

// ─── TOUS LES CANDIDATS POUR LA MODAL PORTAIL ─────────────────────────────────

export async function getCandidatesForPortal() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return []
  return prisma.candidate.findMany({
    where: { agencyId: agency.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      city: true,
      skills: true,
      experience: true,
      availability: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

// ─── PROPOSER UN CANDIDAT AU PORTAIL CLIENT ────────────────────────────────────

export async function proposeToPortalAction(candidateId: string, missionId: string) {
  let pipeline = await prisma.pipeline.findUnique({ where: { missionId } })
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: { missionId, status: "RUNNING" },
    })
  }

  const existing = await prisma.pipelineCandidate.findFirst({
    where: { pipelineId: pipeline.id, candidateId },
  })

  if (existing) {
    if (!existing.proposedToClient) {
      await prisma.pipelineCandidate.update({
        where: { id: existing.id },
        data: { proposedToClient: true, proposedAt: new Date(), portalVisibility: "PARTIAL" },
      })
    }
  } else {
    await prisma.pipelineCandidate.create({
      data: {
        pipelineId: pipeline.id,
        candidateId,
        proposedToClient: true,
        proposedAt: new Date(),
        portalVisibility: "PARTIAL",
      },
    })
  }

  revalidatePath("/agence/portail")
  return { success: true }
}

// ─── GÉNÉRER / RÉCUPÉRER LE TOKEN PORTAIL D'UN CLIENT ─────────────────────────

export async function getOrCreatePortalToken(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) throw new Error("Client introuvable")

  if (client.portalToken) return client.portalToken

  const token = randomBytes(24).toString("hex")
  await prisma.client.update({
    where: { id: clientId },
    data: { portalToken: token },
  })
  return token
}

// ─── DONNÉES PORTAIL AGENCE ────────────────────────────────────────────────────

export async function getPortalAgenceData() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return { clients: [] }

  const clients = await prisma.client.findMany({
    where: { agencyId: agency.id },
    include: {
      missions: {
        include: {
          pipeline: {
            include: {
              candidates: {
                where: { proposedToClient: true },
                include: { candidate: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return { clients }
}

// ─── CHANGER LA VISIBILITÉ D'UN CANDIDAT ──────────────────────────────────────

export async function setPortalVisibility(
  pipelineCandidateId: string,
  visibility: "FULL" | "PARTIAL" | "ANONYMOUS"
) {
  await prisma.pipelineCandidate.update({
    where: { id: pipelineCandidateId },
    data: { portalVisibility: visibility },
  })
  revalidatePath("/agence/portail")
}

// ─── DONNÉES PORTAIL CLIENT (via token) ───────────────────────────────────────

export async function getClientPortalData(token: string) {
  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    include: {
      missions: {
        include: {
          pipeline: {
            include: {
              candidates: {
                where: { proposedToClient: true },
                include: { candidate: true },
                orderBy: { proposedAt: "desc" },
              },
            },
          },
        },
        where: {
          pipeline: {
            candidates: {
              some: { proposedToClient: true },
            },
          },
        },
      },
    },
  })

  if (!client) return null
  return client
}

// ─── CLIENT VALIDE UN CANDIDAT ────────────────────────────────────────────────

export async function clientValidate(token: string, pipelineCandidateId: string) {
  // Vérifier que le token correspond bien à ce candidat
  const pc = await prisma.pipelineCandidate.findUnique({
    where: { id: pipelineCandidateId },
    include: {
      pipeline: {
        include: {
          mission: { include: { client: true } },
          candidates: true,
        },
      },
    },
  })

  if (!pc || pc.pipeline.mission.client.portalToken !== token) {
    throw new Error("Accès non autorisé")
  }

  await prisma.pipelineCandidate.update({
    where: { id: pipelineCandidateId },
    data: { clientValidated: true, selected: true },
  })

  // Vérifier si quota atteint
  const validatedCount = pc.pipeline.candidates.filter(
    (c) => c.clientValidated || c.id === pipelineCandidateId
  ).length
  const target = pc.pipeline.mission.targetCandidates ?? 1

  if (validatedCount >= target) {
    await prisma.pipeline.update({
      where: { id: pc.pipelineId },
      data: { status: "COMPLETED" },
    })
  }

  revalidatePath("/agence/portail")
  revalidatePath("/agence/pipeline")
  return { success: true }
}

// ─── CLIENT COMMENTE UN CANDIDAT ──────────────────────────────────────────────

export async function clientComment(token: string, pipelineCandidateId: string, comment: string) {
  const pc = await prisma.pipelineCandidate.findUnique({
    where: { id: pipelineCandidateId },
    include: {
      pipeline: { include: { mission: { include: { client: true } } } },
    },
  })

  if (!pc || pc.pipeline.mission.client.portalToken !== token) {
    throw new Error("Accès non autorisé")
  }

  await prisma.pipelineCandidate.update({
    where: { id: pipelineCandidateId },
    data: { clientComment: comment },
  })

  revalidatePath("/agence/portail")
  return { success: true }
}

// ─── CLIENT REFUSE UN CANDIDAT ────────────────────────────────────────────────

export async function clientRefuse(token: string, pipelineCandidateId: string) {
  const pc = await prisma.pipelineCandidate.findUnique({
    where: { id: pipelineCandidateId },
    include: {
      pipeline: { include: { mission: { include: { client: true } } } },
    },
  })

  if (!pc || pc.pipeline.mission.client.portalToken !== token) {
    throw new Error("Accès non autorisé")
  }

  await prisma.pipelineCandidate.update({
    where: { id: pipelineCandidateId },
    data: { clientRefused: true },
  })

  revalidatePath("/agence/portail")
  return { success: true }
}
