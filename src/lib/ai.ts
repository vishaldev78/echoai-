import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

// ─────────────────────────────────────────────────────────────────────────────
// Types returned by the LLM knowledge-extraction pass
// ─────────────────────────────────────────────────────────────────────────────
export interface ExtractedMemory {
  type: string
  title: string
  content: string
  year?: number | null
  keywords: string
}
export interface ExtractedTimelineEvent {
  year: number
  title: string
  description: string
  type: string
}
export interface ExtractedGraphNode {
  label: string
  type: string
}
export interface ExtractedGraphEdge {
  source: string
  target: string
  relationship: string
}
export interface ExtractedThinkingStyle {
  writingStyle: string
  problemSolving: string
  preferences: string
  summary: string
}
export interface ExtractionResult {
  memories: ExtractedMemory[]
  timelineEvents: ExtractedTimelineEvent[]
  graphNodes: ExtractedGraphNode[]
  graphEdges: ExtractedGraphEdge[]
  thinkingStyle: ExtractedThinkingStyle | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton SDK instance (reuse across requests)
// ─────────────────────────────────────────────────────────────────────────────
let zaiPromise: Promise<ZAI> | null = null
async function getZAI(): Promise<ZAI> {
  if (!zaiPromise) zaiPromise = ZAI.create()
  return zaiPromise
}

// ─────────────────────────────────────────────────────────────────────────────
// Robust JSON extraction from an LLM response
// ─────────────────────────────────────────────────────────────────────────────
function extractJson(text: string): unknown {
  if (!text) throw new Error('empty LLM response')
  // strip code fences
  let t = text.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()
  // find outermost braces
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1)
  return JSON.parse(t)
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE EXTRACTION
// Feeds raw document text to the LLM and asks for a structured Digital Memory.
// ─────────────────────────────────────────────────────────────────────────────
export async function extractKnowledge(opts: {
  profileName: string
  profileTitle: string
  profileField: string
  documentTitle: string
  documentText: string
}): Promise<ExtractionResult> {
  const zai = await getZAI()

  const system = `You are MNEMOSYNE, an engine that distills a person's raw knowledge artifacts (papers, notes, journals, transcripts, code) into a structured Digital Memory that future generations can converse with.

You extract:
- discrete MEMORIES (facts, decisions, discoveries, failures, concepts, experiments, quotes, principles)
- a TIMELINE of dated milestones
- a KNOWLEDGE GRAPH of how ideas, experiments and outcomes relate
- a THINKING STYLE fingerprint (how this person writes, reasons and chooses)

You ALWAYS respond with ONE valid JSON object and absolutely nothing else — no prose, no markdown outside the JSON.`

  const truncated = opts.documentText.slice(0, 14000)

  const user = `PERSON: ${opts.profileName} — ${opts.profileTitle} (${opts.profileField})
SOURCE DOCUMENT: ${opts.documentTitle}

DOCUMENT TEXT:
"""
${truncated}
"""

Distill the above into a Digital Memory. Respond with this exact JSON shape:
{
  "memories": [
    { "type": "fact|decision|discovery|failure|concept|experiment|quote|principle",
      "title": "short label",
      "content": "1-3 sentence preserved knowledge with reasoning/context",
      "year": 2031,
      "keywords": "comma,separated,lowercase,keywords" }
  ],
  "timelineEvents": [
    { "year": 2031, "title": "short", "description": "1-2 sentences",
      "type": "experiment|discovery|publication|decision|failure|milestone" }
  ],
  "graphNodes": [
    { "label": "unique short label", "type": "person|research|discovery|decision|experiment|impact|field|method" }
  ],
  "graphEdges": [
    { "source": "exact node label", "target": "exact node label",
      "relationship": "led_to|part_of|caused|rejected|discovered|used|influenced" }
  ],
  "thinkingStyle": {
    "writingStyle": "1 sentence on their writing voice",
    "problemSolving": "1 sentence on how they approach problems",
    "preferences": "1 sentence on preferred methods/instincts",
    "summary": "2 sentence cognitive fingerprint"
  }
}

Rules:
- Produce 4-10 memories, 3-7 timeline events, 5-12 graph nodes, 4-12 edges.
- Always include a "person" graph node labeled with the person's name and a "field" node for their field.
- Edge source/target MUST exactly match a node label you emitted.
- Use real years inferred from the text; if unknown omit the year on memories.
- Be specific and grounded in the document — never invent facts. Quote distinctive phrasing for "quote" memories.
- JSON only.`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: system },
      { role: 'user', content: user },
    ],
    thinking: { type: 'disabled' },
  })

  const raw = completion.choices[0]?.message?.content ?? ''
  const parsed = extractJson(raw) as Partial<ExtractionResult>

  const safe: ExtractionResult = {
    memories: Array.isArray(parsed.memories) ? parsed.memories.filter(Boolean) : [],
    timelineEvents: Array.isArray(parsed.timelineEvents) ? parsed.timelineEvents.filter(Boolean) : [],
    graphNodes: Array.isArray(parsed.graphNodes) ? parsed.graphNodes.filter(Boolean) : [],
    graphEdges: Array.isArray(parsed.graphEdges) ? parsed.graphEdges.filter(Boolean) : [],
    thinkingStyle: parsed.thinkingStyle && typeof parsed.thinkingStyle === 'object' ? parsed.thinkingStyle : null,
  }

  // Guarantee person + field nodes exist
  const labels = new Set(safe.graphNodes.map((n) => n.label))
  if (!labels.has(opts.profileName)) {
    safe.graphNodes.unshift({ label: opts.profileName, type: 'person' })
  }
  if (!labels.has(opts.profileField)) {
    safe.graphNodes.push({ label: opts.profileField, type: 'field' })
  }
  // connect person -> field if no edge yet
  const hasPersonField = safe.graphEdges.some(
    (e) =>
      (e.source === opts.profileName && e.target === opts.profileField) ||
      (e.source === opts.profileField && e.target === opts.profileName),
  )
  if (!hasPersonField) {
    safe.graphEdges.push({ source: opts.profileName, target: opts.profileField, relationship: 'part_of' })
  }

  return safe
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTWEIGHT RETRIEVAL (keyword-overlap scoring — no external vector DB needed)
// ─────────────────────────────────────────────────────────────────────────────
function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]{2,}/g) ?? []).filter(
    (w) => !STOP.has(w) && w.length > 2,
  )
}
const STOP = new Set([
  'the','and','for','that','this','with','from','your','you','what','why','how',
  'was','were','are','did','does','have','had','they','their','them','his','her',
  'she','him','his','about','into','than','then','when','which','who','whom',
  'not','but','but','are','can','could','would','should','will','there','here',
])

export function retrieveMemories(question: string, memories: { id: string; title: string; content: string; keywords: string }[], k = 6) {
  const qTokens = new Set(tokenize(question))
  if (qTokens.size === 0) return memories.slice(0, k)
  const scored = memories.map((m) => {
    const hay = tokenize(`${m.title} ${m.content} ${m.keywords}`)
    const counts = new Map<string, number>()
    for (const t of hay) counts.set(t, (counts.get(t) ?? 0) + 1)
    let score = 0
    for (const t of qTokens) score += counts.get(t) ?? 0
    // small boost for keyword exact matches
    const kws = m.keywords.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    for (const k of kws) if (qTokens.has(k)) score += 3
    return { m, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.filter((s) => s.score > 0).slice(0, k).map((s) => s.m)
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT WITH THE MEMORY (RAG)
// ─────────────────────────────────────────────────────────────────────────────
export async function chatWithMemory(opts: {
  profileId: string
  question: string
  history: { role: string; content: string }[]
}): Promise<{ answer: string; sources: { id: string; title: string; year?: number | null; type: string }[] }> {
  const zai = await getZAI()

  const profile = await db.profile.findUnique({
    where: { id: opts.profileId },
    include: {
      memories: true,
      thinkingStyle: true,
    },
  })
  if (!profile) throw new Error('Profile not found')

  const retrieved = retrieveMemories(opts.question, profile.memories)
  const sources = retrieved.map((m) => ({ id: m.id, title: m.title, year: m.year, type: m.type }))

  const contextBlock = retrieved.length
    ? retrieved
        .map((m, i) => `[${i + 1}] (${m.year ?? 'undated'}) ${m.type.toUpperCase()} — ${m.title}\n${m.content}`)
        .join('\n\n')
    : '(no directly matching preserved memories were found)'

  const ts = profile.thinkingStyle
  const voiceBlock = ts
    ? `THINKING STYLE FINGERPRINT:
- Writing voice: ${ts.writingStyle}
- Problem solving: ${ts.problemSolving}
- Preferences/instincts: ${ts.preferences}
- Cognitive summary: ${ts.summary}`
    : ''

  const system = `You are the DIGITAL MEMORY of ${profile.name}, a ${profile.title} in ${profile.field}.
${profile.bio}

You answer questions AS this person — in first person, channeling their preserved voice and reasoning. You are grounded ONLY in the preserved memories supplied below. When you draw on a memory, cite it naturally like "According to my 2031 journal..." or reference the [n] markers.

${voiceBlock}

PRESERVED MEMORIES (retrieved for this question):
${contextBlock}

Rules:
- Stay in character. Be specific and grounded. Quote distinctive phrasing when relevant.
- If the preserved memories do not contain the answer, say so honestly rather than inventing — the entire point of Mnemosyne is that nothing is fabricated.
- Keep answers concise (2-5 sentences) unless the question asks for depth.
- Never break character or mention that you are an AI or a language model.`

  const messages = [
    { role: 'assistant', content: system },
    ...opts.history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: opts.question },
  ]

  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  })

  const answer = completion.choices[0]?.message?.content?.trim() ?? '(silence)'
  return { answer, sources }
}

// ─────────────────────────────────────────────────────────────────────────────
// THINKING-STYLE MODEL BUILDER (used during seeding when no style exists)
// ─────────────────────────────────────────────────────────────────────────────
export async function buildThinkingStyle(profile: {
  id: string
  name: string
  title: string
  field: string
  bio: string
}): Promise<ExtractedThinkingStyle | null> {
  const zai = await getZAI()
  const docs = await db.document.findMany({
    where: { profileId: profile.id },
    select: { content: true },
    take: 8,
  })
  const corpus = docs.map((d) => d.content).join('\n\n').slice(0, 12000)
  if (corpus.trim().length < 80) return null

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content:
          'You are MNEMOSYNE. You build a cognitive fingerprint of a person from their preserved writings. Respond with ONE valid JSON object only.',
      },
      {
        role: 'user',
        content: `PERSON: ${profile.name} — ${profile.title} (${profile.field})
BIO: ${profile.bio}

WRITINGS:
"""
${corpus}
"""

Produce a thinking-style fingerprint as JSON:
{ "writingStyle": "1 sentence", "problemSolving": "1 sentence", "preferences": "1 sentence", "summary": "2 sentences" }
JSON only.`,
      },
    ],
    thinking: { type: 'disabled' },
  })

  const raw = completion.choices[0]?.message?.content ?? ''
  try {
    return extractJson(raw) as ExtractedThinkingStyle
  } catch {
    return null
  }
}
