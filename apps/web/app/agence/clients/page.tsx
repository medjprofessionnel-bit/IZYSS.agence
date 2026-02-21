export const dynamic = "force-dynamic"

import { getClients } from "./actions"
import { ClientsClient } from "./clients-client"

export default async function ClientsPage() {
  const clients = await getClients()
  return <ClientsClient clients={clients} />
}
