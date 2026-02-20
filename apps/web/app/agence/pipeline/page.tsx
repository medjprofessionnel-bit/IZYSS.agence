import { getPipelines, getPipelineStats } from "./actions"
import { PipelineClient } from "./pipeline-client"

export const dynamic = "force-dynamic"

export default async function PipelinePage() {
  const [pipelines, stats] = await Promise.all([getPipelines(), getPipelineStats()])
  return <PipelineClient pipelines={pipelines} stats={stats} />
}
