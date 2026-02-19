"use server"

import { prisma } from "@/lib/prisma"
import { CriteriaConfig } from "./actions"

export type ScoringPresetRecord = {
  id: string
  name: string
  jobType: string | null
  isDefault: boolean
  criteria: CriteriaConfig
  agencyId: string
  createdAt: Date
}

export async function getPresets(): Promise<ScoringPresetRecord[]> {
  const agency = await prisma.agency.findFirst()
  if (!agency) return []

  const presets = await prisma.scoringPreset.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: "asc" },
  })

  return presets.map((p) => ({
    ...p,
    criteria: p.criteria as CriteriaConfig,
  }))
}

export async function savePreset(
  name: string,
  jobType: string | null,
  criteria: CriteriaConfig,
  presetId?: string
): Promise<ScoringPresetRecord> {
  const agency = await prisma.agency.findFirst()
  if (!agency) throw new Error("Agency not found")

  const data = {
    name,
    jobType: jobType || null,
    criteria: criteria as object,
    agencyId: agency.id,
  }

  let preset
  if (presetId) {
    preset = await prisma.scoringPreset.update({
      where: { id: presetId },
      data,
    })
  } else {
    preset = await prisma.scoringPreset.create({ data })
  }

  return { ...preset, criteria: preset.criteria as CriteriaConfig }
}

export async function deletePreset(id: string): Promise<void> {
  await prisma.scoringPreset.delete({ where: { id } })
}

export async function setDefaultPreset(id: string): Promise<void> {
  const preset = await prisma.scoringPreset.findUnique({ where: { id } })
  if (!preset) return

  // Unset all other defaults for this agency
  await prisma.scoringPreset.updateMany({
    where: { agencyId: preset.agencyId, isDefault: true },
    data: { isDefault: false },
  })

  await prisma.scoringPreset.update({
    where: { id },
    data: { isDefault: true },
  })
}

export async function getDefaultPreset(): Promise<ScoringPresetRecord | null> {
  const agency = await prisma.agency.findFirst()
  if (!agency) return null

  const preset = await prisma.scoringPreset.findFirst({
    where: { agencyId: agency.id, isDefault: true },
  })

  if (!preset) return null
  return { ...preset, criteria: preset.criteria as CriteriaConfig }
}
