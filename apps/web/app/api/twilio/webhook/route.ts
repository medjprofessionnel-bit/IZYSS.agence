import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Webhook Twilio — reçoit les réponses SMS/WhatsApp des candidats et des clients
// URL à configurer dans Twilio Console: https://izyss-v1.vercel.app/api/twilio/webhook
export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const from = formData.get("From") as string // numéro de l'expéditeur
  const body = formData.get("Body") as string // contenu du message
  const messageSid = formData.get("MessageSid") as string

  if (!from || !body) {
    return new NextResponse("Missing params", { status: 400 })
  }

  // Normaliser le numéro (retirer préfixe whatsapp: si présent)
  const phone = from.replace("whatsapp:", "").trim()
  const response = body.trim().toUpperCase()

  console.log(`[Twilio Webhook] From: ${phone} | Body: "${body}" | SID: ${messageSid}`)

  // Chercher si ce numéro correspond à un candidat dans un pipeline actif
  const candidate = await prisma.candidate.findFirst({
    where: { phone: { contains: phone.replace("+33", "0").replace("+", "") } },
    include: {
      pipelineCandidates: {
        where: { smsStatus: "SENT" },
        include: { pipeline: { include: { mission: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  if (candidate && candidate.pipelineCandidates.length > 0) {
    const pc = candidate.pipelineCandidates[0]
    const isYes = ["OUI", "O", "YES", "Y", "1", "OK"].includes(response)
    const isNo = ["NON", "N", "NO", "0", "NON MERCI"].includes(response)

    if (isYes) {
      await prisma.pipelineCandidate.update({
        where: { id: pc.id },
        data: { smsStatus: "ACCEPTED", response: body.trim() },
      })
      console.log(`✅ Candidat ${candidate.firstName} a accepté la mission "${pc.pipeline.mission.title}"`)
    } else if (isNo) {
      await prisma.pipelineCandidate.update({
        where: { id: pc.id },
        data: { smsStatus: "DECLINED", response: body.trim() },
      })
      console.log(`❌ Candidat ${candidate.firstName} a refusé la mission "${pc.pipeline.mission.title}"`)
    }

    revalidatePath("/agence/pipeline")

    // Réponse TwiML vide (Twilio attend du XML)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    )
  }

  // Chercher si c'est un client qui répond
  const client = await prisma.client.findFirst({
    where: { phone: { contains: phone.replace("+33", "0").replace("+", "") } },
    include: {
      missions: {
        include: {
          pipeline: {
            include: {
              candidates: {
                where: { proposedToClient: true, clientValidated: false },
                orderBy: { proposedAt: "desc" },
                take: 1,
              },
            },
          },
        },
        where: { pipeline: { status: "WAITING_CLIENT" } },
        take: 1,
      },
    },
  })

  if (client && client.missions.length > 0) {
    const mission = client.missions[0]
    const pipeline = mission.pipeline
    const isYes = ["OUI", "O", "YES", "Y", "1", "OK"].includes(response)

    if (isYes && pipeline && pipeline.candidates.length > 0) {
      const pc = pipeline.candidates[0]

      await prisma.pipelineCandidate.update({
        where: { id: pc.id },
        data: { clientValidated: true, selected: true },
      })

      // Vérifier si quota atteint
      const allCandidates = await prisma.pipelineCandidate.findMany({
        where: { pipelineId: pipeline.id },
      })
      const validatedCount = allCandidates.filter((c) => c.clientValidated).length
      const target = mission.targetCandidates ?? 1

      if (validatedCount >= target) {
        await prisma.pipeline.update({
          where: { id: pipeline.id },
          data: { status: "COMPLETED" },
        })
      }

      console.log(`✅ Client ${client.name} a validé un candidat pour "${mission.title}"`)
      revalidatePath("/agence/pipeline")
    }
  }

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  )
}
