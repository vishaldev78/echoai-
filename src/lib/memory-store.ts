import { db } from '@/lib/db'
import { extractKnowledge, buildThinkingStyle, type ExtractionResult } from '@/lib/ai'

/**
 * Persist an LLM extraction result against a profile, linking back to the
 * source document. Graph edges (label-based) are resolved to node ids.
 */
export async function persistExtraction(
  profileId: string,
  documentId: string,
  result: ExtractionResult,
) {
  // 1. Memories
  const memoryRows = result.memories.map((m) => ({
    profileId,
    documentId,
    type: (m.type || 'fact').toString(),
    title: (m.title || 'Untitled memory').toString().slice(0, 200),
    content: (m.content || '').toString(),
    year: typeof m.year === 'number' ? m.year : null,
    keywords: (m.keywords || '').toString(),
  }))
  if (memoryRows.length) {
    await db.memory.createMany({ data: memoryRows })
  }

  // 2. Timeline events
  const timelineRows = result.timelineEvents
    .filter((e) => typeof e.year === 'number')
    .map((e) => ({
      profileId,
      year: Number(e.year),
      title: (e.title || 'Event').toString().slice(0, 200),
      description: (e.description || '').toString(),
      type: (e.type || 'milestone').toString(),
    }))
  if (timelineRows.length) {
    await db.timelineEvent.createMany({ data: timelineRows })
  }

  // 3. Graph nodes (dedupe by label within this batch + existing)
  const existingLabels = new Set(
    (await db.graphNode.findMany({ where: { profileId }, select: { label: true } })).map(
      (n) => n.label,
    ),
  )
  const nodeRows = []
  const labelToId = new Map<string, string>()
  // ensure person + field present
  for (const n of result.graphNodes) {
    const label = (n.label || '').trim()
    if (!label) continue
    if (existingLabels.has(label)) continue
    existingLabels.add(label)
    const id = `${label}::${profileId}::${nodeRows.length}`
    labelToId.set(label, id)
    nodeRows.push({ id, profileId, label, type: (n.type || 'concept').toString() })
  }
  if (nodeRows.length) {
    await db.graphNode.createMany({ data: nodeRows })
  }
  // load any pre-existing nodes so edges can reference them
  const allNodes = await db.graphNode.findMany({ where: { profileId }, select: { id: true, label: true } })
  for (const n of allNodes) {
    if (!labelToId.has(n.label)) labelToId.set(n.label, n.id)
  }

  // 4. Graph edges (resolve labels → ids), dedupe
  const existingEdgeKeys = new Set(
    (await db.graphEdge.findMany({ where: { profileId }, select: { source: true, target: true, relationship: true } })).map(
      (e) => `${e.source}|${e.target}|${e.relationship}`,
    ),
  )
  const edgeRows = []
  for (const e of result.graphEdges) {
    const s = labelToId.get((e.source || '').trim())
    const t = labelToId.get((e.target || '').trim())
    if (!s || !t || s === t) continue
    const rel = (e.relationship || 'related').toString()
    const key = `${s}|${t}|${rel}`
    if (existingEdgeKeys.has(key)) continue
    existingEdgeKeys.add(key)
    edgeRows.push({ profileId, source: s, target: t, relationship: rel })
  }
  if (edgeRows.length) {
    await db.graphEdge.createMany({ data: edgeRows })
  }

  // 5. Thinking style (upsert — only set if we got one)
  if (result.thinkingStyle && result.thinkingStyle.summary) {
    await db.thinkingStyle.upsert({
      where: { profileId },
      create: {
        profileId,
        writingStyle: result.thinkingStyle.writingStyle || '',
        problemSolving: result.thinkingStyle.problemSolving || '',
        preferences: result.thinkingStyle.preferences || '',
        summary: result.thinkingStyle.summary || '',
      },
      update: {
        writingStyle: result.thinkingStyle.writingStyle || undefined,
        problemSolving: result.thinkingStyle.problemSolving || undefined,
        preferences: result.thinkingStyle.preferences || undefined,
        summary: result.thinkingStyle.summary || undefined,
      },
    })
  }

  return { memories: memoryRows.length, timeline: timelineRows.length, nodes: nodeRows.length, edges: edgeRows.length }
}

/** Run extraction + persistence end-to-end for a freshly uploaded document. */
export async function ingestDocument(opts: {
  profileId: string
  documentId: string
  documentTitle: string
  documentText: string
}) {
  const profile = await db.profile.findUnique({ where: { id: opts.profileId } })
  if (!profile) throw new Error('Profile not found')

  const result = await extractKnowledge({
    profileName: profile.name,
    profileTitle: profile.title,
    profileField: profile.field,
    documentTitle: opts.documentTitle,
    documentText: opts.documentText,
  })

  const counts = await persistExtraction(opts.profileId, opts.documentId, result)

  // If no thinking style emerged from extraction, build one from the corpus.
  const hasStyle = await db.thinkingStyle.findUnique({ where: { profileId: opts.profileId } })
  if (!hasStyle) {
    const style = await buildThinkingStyle({
      id: opts.profileId,
      name: profile.name,
      title: profile.title,
      field: profile.field,
      bio: profile.bio,
    })
    if (style) {
      await db.thinkingStyle.create({
        data: {
          profileId: opts.profileId,
          writingStyle: style.writingStyle,
          problemSolving: style.problemSolving,
          preferences: style.preferences,
          summary: style.summary,
        },
      })
    }
  }

  return { result, counts }
}
