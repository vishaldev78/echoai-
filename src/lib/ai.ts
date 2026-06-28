import { db } from '@/lib/db'

// ─────────────────────────────────────────────────────────────────────────────
// ECHO Local AI Engine — no external API, no config files, works online & offline.
//
// This module provides:
//   1. extractKnowledge() — rule-based extraction of memories, timeline, graph,
//      and a thinking-style fingerprint from raw document text.
//   2. chatWithMemory() — local RAG: retrieves relevant memories via keyword
//      overlap and composes a grounded answer (no LLM needed).
//
// The extraction uses linguistic heuristics (sentence splitting, keyword
// detection, year regex, relationship inference) — it's not as sophisticated
// as a large language model, but it is:
//   • 100% free (no API keys, no usage limits)
//   • Works offline (no network calls)
//   • Deploys anywhere (no .z-ai-config needed)
//   • Instant (no API latency)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Types returned by the extraction pass
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
// Text utilities
// ─────────────────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'shall', 'can', 'need', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
  'he', 'she', 'it', 'they', 'them', 'this', 'that', 'these', 'those', 'as', 'if',
  'then', 'than', 'so', 'not', 'no', 'yes', 'all', 'any', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'too',
  'very', 'just', 'now', 'here', 'there', 'when', 'where', 'why', 'how', 'what',
  'which', 'who', 'whom', 'because', 'while', 'also',
])

function splitSentences(text: string): string[] {
  // Split on sentence boundaries, keeping meaningful chunks
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15)
}

function extractYears(text: string): number[] {
  const matches = text.match(/\b(19|20)\d{2}\b/g) || []
  return [...new Set(matches.map(Number))].sort()
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter(
    (w) => !STOP_WORDS.has(w) && w.length > 2,
  )
}

function topKeywords(text: string, k = 5): string[] {
  const tokens = tokenize(text)
  const freq = new Map<string, number>()
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1)
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([w]) => w)
}

// ─────────────────────────────────────────────────────────────────────────────
// Memory type detection — keyword-based classification
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_PATTERNS: { type: string; pattern: RegExp; label: string }[] = [
  { type: 'failure', pattern: /\b(fail|failed|failure|reject|rejected|wrong|error|bug|crash|broke|loss|lost|dead end|dead-end|mistake|lesson)\b/i, label: 'Failure' },
  { type: 'discovery', pattern: /\b(discover|discovered|found|breakthrough|realiz|insight|revealed|unlock|novel|key finding)\b/i, label: 'Discovery' },
  { type: 'decision', pattern: /\b(decid|decided|chose|chosen|choose|reject|rejected|adopt|adopted|switch|switched|select|selected|conclud|concluded)\b/i, label: 'Decision' },
  { type: 'experiment', pattern: /\b(experiment|test|tested|trial|prototype|measure|measured|evaluat|built|run|ran|cycl)\b/i, label: 'Experiment' },
  { type: 'principle', pattern: /\b(believe|principle|philosophy|always|never|must|should|rule|doctrine|fundamental|core)\b/i, label: 'Principle' },
  { type: 'quote', pattern: /["""].+?["""]/, label: 'Quote' },
  { type: 'fact', pattern: /\b(is|are|was|were|has|have|contains|consists|comprises|equals|approximately|about)\b/i, label: 'Fact' },
  { type: 'concept', pattern: /\b(concept|theory|idea|hypothesis|approach|method|model|framework|design|architecture)\b/i, label: 'Concept' },
]

function classifySentence(sentence: string): string {
  for (const { type, pattern } of TYPE_PATTERNS) {
    if (pattern.test(sentence)) return type
  }
  return 'note'
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE EXTRACTION (local, rule-based)
// ─────────────────────────────────────────────────────────────────────────────
export async function extractKnowledge(opts: {
  profileName: string
  profileTitle: string
  profileField: string
  documentTitle: string
  documentText: string
}): Promise<ExtractionResult> {
  const text = opts.documentText
  const sentences = splitSentences(text)
  const years = extractYears(text)

  // 1. Extract memories — each meaningful sentence becomes a memory
  const memories: ExtractedMemory[] = []
  for (const sentence of sentences.slice(0, 20)) {
    const type = classifySentence(sentence)
    const sentenceYears = extractYears(sentence)
    const year = sentenceYears[0] || years[0] || null
    const keywords = topKeywords(sentence, 4).join(', ')

    // Generate a short title (first 6-8 words)
    const words = sentence.split(/\s+/).slice(0, 7).join(' ')
    const title = words.length > 60 ? words.slice(0, 57) + '...' : words

    memories.push({
      type,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      content: sentence,
      year,
      keywords,
    })
  }

  // 2. Extract timeline events — sentences with years
  const timelineEvents: ExtractedTimelineEvent[] = []
  for (const sentence of sentences) {
    const sentenceYears = extractYears(sentence)
    if (sentenceYears.length > 0) {
      const year = sentenceYears[0]
      const type = classifySentence(sentence)
      const words = sentence.split(/\s+/).slice(0, 8).join(' ')
      timelineEvents.push({
        year,
        title: words.length > 60 ? words.slice(0, 57) + '...' : words,
        description: sentence,
        type: ['experiment', 'discovery', 'failure', 'decision', 'publication', 'milestone'].includes(type)
          ? type
          : 'milestone',
      })
    }
  }
  // Dedupe timeline by year+title, limit to 8
  const seenTimeline = new Set<string>()
  const uniqueTimeline = timelineEvents
    .filter((e) => {
      const key = `${e.year}-${e.title}`
      if (seenTimeline.has(key)) return false
      seenTimeline.add(key)
      return true
    })
    .slice(0, 8)

  // 3. Build graph nodes
  const graphNodes: ExtractedGraphNode[] = [
    { label: opts.profileName, type: 'person' },
    { label: opts.profileField, type: 'field' },
  ]

  // Add document title as a research node
  if (opts.documentTitle) {
    graphNodes.push({ label: opts.documentTitle.slice(0, 40), type: 'research' })
  }

  // Extract key concepts as nodes
  const allKeywords = topKeywords(text, 8)
  for (const kw of allKeywords) {
    if (!graphNodes.some((n) => n.label.toLowerCase() === kw)) {
      graphNodes.push({ label: kw, type: 'method' })
    }
  }

  // Add memory-type-based nodes (discoveries, failures)
  for (const m of memories.slice(0, 4)) {
    if (m.type === 'discovery' || m.type === 'failure') {
      const label = m.title.slice(0, 30)
      if (!graphNodes.some((n) => n.label === label)) {
        graphNodes.push({ label, type: m.type })
      }
    }
  }

  // 4. Build graph edges
  const graphEdges: ExtractedGraphEdge[] = [
    { source: opts.profileName, target: opts.profileField, relationship: 'part_of' },
  ]

  if (opts.documentTitle) {
    graphEdges.push({ source: opts.profileName, target: opts.documentTitle.slice(0, 40), relationship: 'used' })
  }

  // Connect person to discoveries and failures
  for (const m of memories.slice(0, 4)) {
    if (m.type === 'discovery') {
      graphEdges.push({ source: opts.profileName, target: m.title.slice(0, 30), relationship: 'discovered' })
    } else if (m.type === 'failure') {
      graphEdges.push({ source: opts.profileName, target: m.title.slice(0, 30), relationship: 'caused' })
    }
  }

  // Connect keywords to research
  for (const kw of allKeywords.slice(0, 4)) {
    if (opts.documentTitle) {
      graphEdges.push({ source: opts.documentTitle.slice(0, 40), target: kw, relationship: 'part_of' })
    } else {
      graphEdges.push({ source: opts.profileName, target: kw, relationship: 'used' })
    }
  }

  // 5. Build thinking style (based on text characteristics)
  const avgSentenceLength = sentences.length > 0
    ? Math.round(sentences.reduce((a, s) => a + s.split(/\s+/).length, 0) / sentences.length)
    : 0
  const hasNumbers = /\d/.test(text)
  const hasFirstPerson = /\b(i|my|me|we|our)\b/i.test(text)
  const failureCount = memories.filter((m) => m.type === 'failure').length
  const discoveryCount = memories.filter((m) => m.type === 'discovery').length

  const thinkingStyle: ExtractedThinkingStyle = {
    writingStyle: `${avgSentenceLength > 20 ? 'Detailed, thorough' : 'Concise, direct'} ${hasFirstPerson ? 'first-person' : 'objective'} voice${hasNumbers ? ' with frequent use of specific numbers and data' : ''}.`,
    problemSolving: `${discoveryCount > failureCount ? 'Discovery-driven' : 'Iterative, learning from failures'} approach${failureCount > 0 ? ' that treats failures as primary learning material' : ''}.`,
    preferences: `Prefers ${hasNumbers ? 'quantitative, evidence-based' : 'qualitative, narrative'} reasoning and ${memories.some((m) => m.type === 'experiment') ? 'experimental validation' : 'conceptual analysis'}.`,
    summary: `${opts.profileName} reasons in ${hasFirstPerson ? 'a personal, experiential' : 'an analytical'} style, extracting ${failureCount > 0 ? 'lessons from both successes and failures' : 'insights from observations'}. ${discoveryCount > 0 ? 'A discovery-oriented mind that values breakthroughs.' : 'A methodical thinker who builds understanding step by step.'}`,
  }

  return {
    memories,
    timelineEvents: uniqueTimeline,
    graphNodes,
    graphEdges,
    thinkingStyle,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTWEIGHT RETRIEVAL (keyword-overlap scoring — local, no embeddings)
// ─────────────────────────────────────────────────────────────────────────────
function retrieveMemories(
  question: string,
  memories: { id: string; title: string; content: string; keywords: string; year?: number | null }[],
  k = 6,
) {
  const qTokens = new Set(tokenize(question))
  if (qTokens.size === 0) return memories.slice(0, k)
  const scored = memories.map((m) => {
    const hay = tokenize(`${m.title} ${m.content} ${m.keywords}`)
    const counts = new Map<string, number>()
    for (const t of hay) counts.set(t, (counts.get(t) ?? 0) + 1)
    let score = 0
    for (const t of qTokens) score += counts.get(t) ?? 0
    const kws = m.keywords.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    for (const kw of kws) if (qTokens.has(kw)) score += 3
    return { m, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.filter((s) => s.score > 0).slice(0, k).map((s) => s.m)
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT WITH THE MEMORY (local RAG — no LLM, composes answer from retrieved memories)
// ─────────────────────────────────────────────────────────────────────────────
export async function chatWithMemory(opts: {
  profileId: string
  question: string
  history: { role: string; content: string }[]
}): Promise<{ answer: string; sources: { id: string; title: string; year?: number | null; type: string }[] }> {
  const profile = await db.profile.findUnique({
    where: { id: opts.profileId },
    include: { memories: true, thinkingStyle: true },
  })
  if (!profile) throw new Error('Profile not found')

  const retrieved = retrieveMemories(opts.question, profile.memories as any)
  const sources = retrieved.map((m) => ({ id: m.id, title: m.title, year: m.year, type: m.type }))

  // Compose a grounded answer from the retrieved memories.
  // This is a template-based composition (not an LLM) — it presents the
  // relevant memories in the person's voice with proper citations.
  let answer: string

  if (retrieved.length === 0) {
    // No matching memories — check if there are any memories at all
    if (profile.memories.length === 0) {
      answer = `I don't have any preserved memories yet. Upload some knowledge (notes, papers, journals) about ${profile.name} and I'll be able to answer questions about their work.`
    } else {
      // Fall back to showing a few memories as context
      const fallback = profile.memories.slice(0, 3)
      answer = `I don't have a specific memory matching that question. Here's what I do know about ${profile.name}:\n\n${fallback
        .map((m, i) => `${i + 1}. (${m.year || 'undated'}) ${m.title}: ${m.content}`)
        .join('\n\n')}`
    }
  } else {
    // Detect question type for a natural response prefix
    const q = opts.question.toLowerCase()
    let prefix = ''
    if (q.includes('why')) prefix = `Based on my preserved notes, `
    else if (q.includes('how')) prefix = `Here's how I approached it: `
    else if (q.includes('what') && (q.includes('failure') || q.includes('mistake'))) prefix = `My biggest challenge was this: `
    else if (q.includes('what') && (q.includes('discover') || q.includes('key'))) prefix = `My key finding was: `
    else if (q.includes('when')) prefix = `According to my records, `
    else prefix = `From my preserved memory: `

    const body = retrieved
      .map((m, i) => {
        const yearTag = m.year ? ` (in ${m.year})` : ''
        return `${m.content}${yearTag}`
      })
      .join('\n\n')

    answer = `${prefix}${body}`

    // Add thinking-style flavor if available
    if (profile.thinkingStyle && retrieved.length > 0) {
      const ts = profile.thinkingStyle
      // Add a reflective closing in their voice
      if (q.includes('failure') || q.includes('mistake')) {
        answer += `\n\n${ts.summary}`
      }
    }
  }

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
  const docs = await db.document.findMany({
    where: { profileId: profile.id },
    select: { content: true },
    take: 8,
  })
  const corpus = docs.map((d) => d.content).join('\n\n').slice(0, 12000)
  if (corpus.trim().length < 80) return null

  const sentences = splitSentences(corpus)
  const avgLen = sentences.length > 0
    ? Math.round(sentences.reduce((a, s) => a + s.split(/\s+/).length, 0) / sentences.length)
    : 0
  const hasNumbers = /\d/.test(corpus)
  const hasFirstPerson = /\b(i|my|me|we|our)\b/i.test(corpus)

  return {
    writingStyle: `${avgLen > 20 ? 'Detailed, thorough' : 'Concise, direct'} ${hasFirstPerson ? 'first-person' : 'objective'} voice${hasNumbers ? ' with specific data' : ''}.`,
    problemSolving: `Analytical, evidence-based approach to ${profile.field}.`,
    preferences: `Prefers ${hasNumbers ? 'quantitative' : 'qualitative'} reasoning.`,
    summary: `${profile.name} reasons in a ${hasFirstPerson ? 'personal, experiential' : 'analytical'} style, building understanding through documented observations.`,
  }
}
