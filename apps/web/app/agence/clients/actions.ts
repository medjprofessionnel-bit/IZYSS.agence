"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getOrCreateAgency() {
  let agency = await prisma.agency.findFirst()
  if (!agency) {
    agency = await prisma.agency.create({ data: { name: "MCM Mulhouse" } })
  }
  return agency
}

export type ClientWithMissions = Awaited<ReturnType<typeof getClients>>[number]

export async function getClients() {
  const agency = await getOrCreateAgency()

  return prisma.client.findMany({
    where: { agencyId: agency.id },
    include: {
      missions: {
        select: { id: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  })
}

export type ClientFormData = {
  name: string
  contact?: string
  email?: string
  phone?: string
  address?: string
  siret?: string
  city?: string
  postalCode?: string
  sector?: string
  status?: string
  paymentConditions?: string
  notes?: string
}

export async function createClient(data: ClientFormData) {
  const agency = await getOrCreateAgency()

  const client = await prisma.client.create({
    data: {
      name: data.name,
      contact: data.contact || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      siret: data.siret || null,
      city: data.city || null,
      postalCode: data.postalCode || null,
      sector: data.sector || null,
      status: data.status || "ACTIF",
      paymentConditions: data.paymentConditions || null,
      notes: data.notes || null,
      agencyId: agency.id,
    },
  })

  revalidatePath("/agence/clients")
  return client
}

export async function updateClient(id: string, data: ClientFormData) {
  const client = await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      contact: data.contact || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      siret: data.siret || null,
      city: data.city || null,
      postalCode: data.postalCode || null,
      sector: data.sector || null,
      status: data.status || "ACTIF",
      paymentConditions: data.paymentConditions || null,
      notes: data.notes || null,
    },
  })

  revalidatePath("/agence/clients")
  return client
}

export async function deleteClient(id: string) {
  const activeMissions = await prisma.mission.count({
    where: { clientId: id, status: { in: ["OPEN", "IN_PROGRESS"] } },
  })

  if (activeMissions > 0) {
    throw new Error(`Impossible de supprimer : ${activeMissions} mission(s) active(s) liée(s) à ce client.`)
  }

  await prisma.client.delete({ where: { id } })
  revalidatePath("/agence/clients")
}

export type ImportRow = {
  nom_entreprise: string
  siret?: string
  contact_principal_nom?: string
  contact_principal_email?: string
  contact_principal_telephone?: string
  adresse?: string
  ville?: string
  code_postal?: string
  secteur_activite?: string
  statut?: string
}

export async function importClients(rows: ImportRow[]) {
  const agency = await getOrCreateAgency()

  // Charger tous les clients existants pour la déduplication
  const existingClients = await prisma.client.findMany({
    where: { agencyId: agency.id },
    select: { name: true, siret: true },
  })

  const existingNames = new Set(existingClients.map((c) => c.name.toLowerCase().trim()))
  const existingSirets = new Set(
    existingClients.map((c) => c.siret).filter(Boolean) as string[]
  )

  const results: { imported: number; skipped: number; errors: string[] } = {
    imported: 0,
    skipped: 0,
    errors: [],
  }

  for (const row of rows) {
    const nom = row.nom_entreprise?.trim()

    if (!nom) {
      results.errors.push(`Ligne ignorée : nom_entreprise manquant`)
      results.skipped++
      continue
    }

    // Validation SIRET
    const siret = row.siret?.replace(/\s/g, "")
    if (siret && !/^\d{14}$/.test(siret)) {
      results.errors.push(`"${nom}" : SIRET invalide (${siret}) — doit être 14 chiffres`)
      results.skipped++
      continue
    }

    // Validation email
    const email = row.contact_principal_email?.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.errors.push(`"${nom}" : email invalide (${email})`)
      results.skipped++
      continue
    }

    // Déduplication par SIRET ou nom
    if (siret && existingSirets.has(siret)) {
      results.skipped++
      continue
    }
    if (existingNames.has(nom.toLowerCase())) {
      results.skipped++
      continue
    }

    try {
      await prisma.client.create({
        data: {
          name: nom,
          contact: row.contact_principal_nom?.trim() || null,
          email: email || null,
          phone: row.contact_principal_telephone?.trim() || null,
          address: row.adresse?.trim() || null,
          siret: siret || null,
          city: row.ville?.trim() || null,
          postalCode: row.code_postal?.trim() || null,
          sector: row.secteur_activite?.trim() || null,
          status: row.statut?.toUpperCase() === "INACTIF" ? "INACTIF" : "ACTIF",
          agencyId: agency.id,
        },
      })

      // Mettre à jour les sets pour les doublons intra-fichier
      existingNames.add(nom.toLowerCase())
      if (siret) existingSirets.add(siret)
      results.imported++
    } catch {
      results.errors.push(`"${nom}" : erreur lors de l'import`)
      results.skipped++
    }
  }

  revalidatePath("/agence/clients")
  return results
}
