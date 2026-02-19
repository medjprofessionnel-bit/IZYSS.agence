import { AgenceSidebar } from "./sidebar"
import { prisma } from "@/lib/prisma"

async function getCandidateCount() {
  const agency = await prisma.agency.findFirst()
  if (!agency) return 0
  return prisma.candidate.count({ where: { agencyId: agency.id } })
}

export default async function AgenceLayout({ children }: { children: React.ReactNode }) {
  const candidateCount = await getCandidateCount()

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FB" }}>
      <AgenceSidebar candidateCount={candidateCount} />
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  )
}
