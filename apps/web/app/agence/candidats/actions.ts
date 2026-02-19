"use server"

import Anthropic from "@anthropic-ai/sdk"
import { createAdminClient } from "@/lib/supabase/admin"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Extrait le texte d'un Word (.docx) via mammoth
async function extractWordText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

// Parse un CV avec Claude et retourne les infos structurées
async function parseCvWithClaude(content: string | Buffer, mimeType: string) {
  let messageContent: Anthropic.MessageParam["content"]

  if (mimeType === "application/pdf") {
    // PDF : envoi en base64
    const base64 = (content as Buffer).toString("base64")
    messageContent = [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      },
      {
        type: "text",
        text: `Analyse ce CV et extrais les informations suivantes en JSON strict.
Réponds UNIQUEMENT avec le JSON, sans texte autour.

{
  "firstName": "prénom",
  "lastName": "nom de famille",
  "email": "email ou null",
  "phone": "téléphone ou null",
  "address": "adresse ou null",
  "city": "ville ou null",
  "skills": ["compétence1", "compétence2"],
  "experience": <nombre années expérience totale comme entier>,
  "previousCompanies": ["entreprise1", "entreprise2"],
  "education": ["formation1", "formation2"],
  "certifications": ["certification1"],
  "languages": ["Français", "Anglais"]
}`,
      },
    ]
  } else {
    // Word : texte extrait
    const text = content as string
    messageContent = [
      {
        type: "text",
        text: `Voici le contenu d'un CV. Extrais les informations en JSON strict.
Réponds UNIQUEMENT avec le JSON, sans texte autour.

CV:
${text}

JSON attendu:
{
  "firstName": "prénom",
  "lastName": "nom de famille",
  "email": "email ou null",
  "phone": "téléphone ou null",
  "address": "adresse ou null",
  "city": "ville ou null",
  "skills": ["compétence1", "compétence2"],
  "experience": <nombre années expérience totale comme entier>,
  "previousCompanies": ["entreprise1", "entreprise2"],
  "education": ["formation1", "formation2"],
  "certifications": ["certification1"],
  "languages": ["Français", "Anglais"]
}`,
      },
    ]
  }

  const response = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: messageContent }],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""
  // Nettoie le JSON si Claude ajoute des backticks
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(cleaned)
}

// Normalise un nom de fichier : retire accents, espaces, caractères spéciaux
function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-zA-Z0-9._-]/g, "_") // remplace tout sauf alphanum/._- par _
    .replace(/_+/g, "_") // évite les __ consécutifs
}

// Traite un batch de fichiers en parallèle
async function processBatch(
  files: File[],
  supabase: ReturnType<typeof createAdminClient>,
  agencyId: string
) {
  return Promise.allSettled(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const mimeType = file.type
      const isPdf = mimeType === "application/pdf"
      const isWord =
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword"

      if (!isPdf && !isWord)
        return { file: file.name, status: "error", message: "Format non supporté" }

      // 1. Upload Supabase Storage
      const safeName = sanitizeFileName(file.name)
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from("Cvs")
        .upload(fileName, buffer, { contentType: mimeType })
      if (uploadError) throw new Error(uploadError.message)

      // 2. Parsing Claude
      let content: string | Buffer = buffer
      if (isWord) content = await extractWordText(buffer)
      const parsed = await parseCvWithClaude(content, isPdf ? "application/pdf" : "text")

      // 3. Sauvegarde BDD
      await prisma.candidate.create({
        data: {
          firstName: parsed.firstName || "Inconnu",
          lastName: parsed.lastName || "Inconnu",
          email: parsed.email || null,
          phone: parsed.phone || null,
          address: parsed.address || null,
          city: parsed.city || null,
          skills: parsed.skills || [],
          experience: parsed.experience || null,
          cvUrl: fileName,
          agencyId,
        },
      })

      return { file: file.name, status: "success" }
    })
  )
}

export async function uploadCvs(formData: FormData) {
  const supabase = createAdminClient()
  const files = formData.getAll("files") as File[]

  // Récupère ou crée l'agence une seule fois
  let agency = await prisma.agency.findFirst()
  if (!agency) {
    agency = await prisma.agency.create({ data: { name: "MCM Mulhouse" } })
  }
  const agencyId = agency.id

  // Traitement par batches de 3 — évite le rate limit Anthropic (30k tokens/min)
  const BATCH_SIZE = 3
  const allResults: PromiseSettledResult<{ file: string; status: string; message?: string }>[] = []

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    const batchResults = await processBatch(batch, supabase, agencyId)
    allResults.push(...batchResults)
    // Pause 2s entre batches pour respecter le rate limit
    if (i + BATCH_SIZE < files.length) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  revalidatePath("/agence/candidats")

  return allResults.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { file: files[i].name, status: "error", message: r.reason?.message || "Erreur inconnue" }
  )
}

export async function deleteCandidates(ids: string[]) {
  const supabase = createAdminClient()

  const candidates = await prisma.candidate.findMany({
    where: { id: { in: ids } },
    select: { id: true, cvUrl: true },
  })

  const filesToDelete = candidates.map((c) => c.cvUrl).filter(Boolean) as string[]
  if (filesToDelete.length > 0) {
    await supabase.storage.from("Cvs").remove(filesToDelete)
  }

  await prisma.candidate.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/agence/candidats")
}

export async function deleteCandidate(id: string) {
  const supabase = createAdminClient()

  const candidate = await prisma.candidate.findUnique({ where: { id } })
  if (!candidate) throw new Error("Candidat introuvable")

  if (candidate.cvUrl) {
    await supabase.storage.from("Cvs").remove([candidate.cvUrl])
  }

  await prisma.candidate.delete({ where: { id } })
  revalidatePath("/agence/candidats")
}

export async function getCvSignedUrl(cvUrl: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from("Cvs")
    .createSignedUrl(cvUrl, 3600) // valable 1h
  if (error) throw new Error(error.message)
  return data.signedUrl
}

export async function getCandidates() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return []

  return prisma.candidate.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: "desc" },
  })
}
