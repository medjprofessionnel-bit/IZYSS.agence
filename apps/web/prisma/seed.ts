import { PrismaClient } from "@prisma/client"
import { auth } from "../lib/auth"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // 1. Créer l'agence MCM Mulhouse
  let agency = await prisma.agency.findFirst({ where: { name: "MCM Mulhouse" } })
  if (!agency) {
    agency = await prisma.agency.create({
      data: { name: "MCM Mulhouse" },
    })
    console.log("✅ Agence MCM Mulhouse créée")
  } else {
    console.log("ℹ️  Agence MCM Mulhouse déjà existante")
  }

  // 2. Créer l'utilisateur admin Imane via Better Auth
  const existingUser = await prisma.user.findUnique({
    where: { email: "imane@mcm-mulhouse.fr" },
  })

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: {
        email: "imane@mcm-mulhouse.fr",
        password: "izyss2024!",
        name: "Imane",
      },
    })

    // Récupérer l'user créé et lui assigner l'agence + rôle
    await prisma.user.update({
      where: { email: "imane@mcm-mulhouse.fr" },
      data: {
        role: "agency_admin",
        agencyId: agency.id,
      },
    })

    console.log("✅ Utilisateur Imane créé (imane@mcm-mulhouse.fr / izyss2024!)")
  } else {
    // S'assurer que l'agencyId est bien mis à jour
    await prisma.user.update({
      where: { email: "imane@mcm-mulhouse.fr" },
      data: { agencyId: agency.id, role: "agency_admin" },
    })
    console.log("ℹ️  Utilisateur Imane déjà existant — mis à jour")
  }

  console.log("🎉 Seed terminé !")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
