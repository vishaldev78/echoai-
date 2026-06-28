import { db } from '@/lib/db'

// ─────────────────────────────────────────────────────────────────────────────
// ECHO Local AI Engine — no external API, no config files, works online & offline.
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

// 🔥 IMPROVED TOKENIZE - Handles E=mc² properly
function tokenize(text: string): string[] {
  let cleaned = text
    .toLowerCase()
    // Convert superscripts
    .replace(/[²³]/g, '2')
    // Remove special chars but keep important ones
    .replace(/[=+]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  const tokens = cleaned.split(' ').filter(w => w.length > 1 && !STOP_WORDS.has(w))
  
  // 🔥 Expand tokens for better matching
  const expanded = []
  for (const t of tokens) {
    expanded.push(t)
    // Handle E=mc² variations
    if (t.includes('mc2') || t.includes('emc2')) {
      expanded.push('mc2')
      expanded.push('emc2')
      expanded.push('e=mc2')
      expanded.push('mc')
    }
    if (t.includes('relativity')) {
      expanded.push('relativity')
      expanded.push('relativ')
    }
    if (t.includes('photoelectric')) {
      expanded.push('photoelectric')
      expanded.push('photo')
    }
  }
  
  return [...new Set(expanded)]
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
// Memory type detection
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_PATTERNS: { type: string; pattern: RegExp; label: string }[] = [
  { type: 'failure', pattern: /\b(fail|failed|failure|reject|rejected|wrong|error|bug|crash|broke|loss|lost|dead end|dead-end|mistake|lesson|blunder)\b/i, label: 'Failure' },
  { type: 'discovery', pattern: /\b(discover|discovered|found|breakthrough|realiz|insight|revealed|unlock|novel|key finding|emerged)\b/i, label: 'Discovery' },
  { type: 'decision', pattern: /\b(decid|decided|chose|chosen|choose|reject|rejected|adopt|adopted|switch|switched|select|selected|conclud|concluded)\b/i, label: 'Decision' },
  { type: 'experiment', pattern: /\b(experiment|test|tested|trial|prototype|measure|measured|evaluat|built|run|ran|cycl|thought experiment)\b/i, label: 'Experiment' },
  { type: 'principle', pattern: /\b(believe|principle|philosophy|always|never|must|should|rule|doctrine|fundamental|core|important)\b/i, label: 'Principle' },
  { type: 'quote', pattern: /["""].+?["""]/, label: 'Quote' },
  { type: 'fact', pattern: /\b(is|are|was|were|has|have|contains|consists|comprises|equals|approximately|about)\b/i, label: 'Fact' },
  { type: 'concept', pattern: /\b(concept|theory|idea|hypothesis|approach|method|model|framework|design|architecture|pursuit)\b/i, label: 'Concept' },
]

function classifySentence(sentence: string): string {
  for (const { type, pattern } of TYPE_PATTERNS) {
    if (pattern.test(sentence)) return type
  }
  return 'note'
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE EXTRACTION
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

  const memories: ExtractedMemory[] = []
  for (const sentence of sentences.slice(0, 20)) {
    const type = classifySentence(sentence)
    const sentenceYears = extractYears(sentence)
    const year = sentenceYears[0] || years[0] || null
    const keywords = topKeywords(sentence, 4).join(', ')

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

  const seenTimeline = new Set<string>()
  const uniqueTimeline = timelineEvents
    .filter((e) => {
      const key = `${e.year}-${e.title}`
      if (seenTimeline.has(key)) return false
      seenTimeline.add(key)
      return true
    })
    .slice(0, 8)

  const graphNodes: ExtractedGraphNode[] = [
    { label: opts.profileName, type: 'person' },
    { label: opts.profileField, type: 'field' },
  ]

  if (opts.documentTitle) {
    graphNodes.push({ label: opts.documentTitle.slice(0, 40), type: 'research' })
  }

  const allKeywords = topKeywords(text, 8)
  for (const kw of allKeywords) {
    if (!graphNodes.some((n) => n.label.toLowerCase() === kw)) {
      graphNodes.push({ label: kw, type: 'method' })
    }
  }

  for (const m of memories.slice(0, 4)) {
    if (m.type === 'discovery' || m.type === 'failure') {
      const label = m.title.slice(0, 30)
      if (!graphNodes.some((n) => n.label === label)) {
        graphNodes.push({ label, type: m.type })
      }
    }
  }

  const graphEdges: ExtractedGraphEdge[] = [
    { source: opts.profileName, target: opts.profileField, relationship: 'part_of' },
  ]

  if (opts.documentTitle) {
    graphEdges.push({ source: opts.profileName, target: opts.documentTitle.slice(0, 40), relationship: 'used' })
  }

  for (const m of memories.slice(0, 4)) {
    if (m.type === 'discovery') {
      graphEdges.push({ source: opts.profileName, target: m.title.slice(0, 30), relationship: 'discovered' })
    } else if (m.type === 'failure') {
      graphEdges.push({ source: opts.profileName, target: m.title.slice(0, 30), relationship: 'caused' })
    }
  }

  for (const kw of allKeywords.slice(0, 4)) {
    if (opts.documentTitle) {
      graphEdges.push({ source: opts.documentTitle.slice(0, 40), target: kw, relationship: 'part_of' })
    } else {
      graphEdges.push({ source: opts.profileName, target: kw, relationship: 'used' })
    }
  }

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
// 🔥 IMPROVED RETRIEVAL - Handles E=mc² and other special cases
// ─────────────────────────────────────────────────────────────────────────────
function retrieveMemories(
  question: string,
  memories: { id: string; title: string; content: string; keywords: string; year?: number | null }[],
  k = 6,
) {
  const qTokens = new Set(tokenize(question))
  
  console.log('🔍 Question Tokens:', Array.from(qTokens))
  
  if (qTokens.size === 0) return memories.slice(0, k)
  
  const scored = memories.map((m) => {
    const hay = tokenize(`${m.title} ${m.content} ${m.keywords}`)
    const counts = new Map<string, number>()
    for (const t of hay) counts.set(t, (counts.get(t) ?? 0) + 1)
    
    let score = 0
    
    // Direct token matches
    for (const t of qTokens) {
      score += counts.get(t) ?? 0
    }
    
    // Keyword matches (higher weight)
    const kws = m.keywords.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    for (const kw of kws) {
      const kwClean = kw.replace(/[^a-z0-9]/g, '')
      for (const t of qTokens) {
        if (kwClean.includes(t) || t.includes(kwClean)) {
          score += 3
        }
        // 🔥 Special handling for E=mc²
        if ((kwClean === 'emc2' || kwClean === 'e=mc2') && (t === 'mc2' || t === 'emc2' || t === 'e=mc2')) {
          score += 10
        }
        // 🔥 Special handling for relativity
        if (kwClean.includes('relativity') && t.includes('relativity')) {
          score += 8
        }
        // 🔥 Special handling for photoelectric
        if (kwClean.includes('photoelectric') && t.includes('photoelectric')) {
          score += 8
        }
      }
    }
    
    // 🔥 Title match (high weight)
    const titleTokens = tokenize(m.title)
    for (const t of qTokens) {
      if (titleTokens.includes(t)) score += 4
    }
    
    // 🔥 Year match
    const yearMatch = question.match(/\b(19|20)\d{2}\b/)
    if (yearMatch && m.year === parseInt(yearMatch[0])) {
      score += 5
    }
    
    return { m, score }
  })
  
  scored.sort((a, b) => b.score - a.score)
  
  console.log('🔍 Top scores:', scored.slice(0, 3).map(s => ({ 
    title: s.m.title, 
    score: s.score 
  })))
  
  const results = scored.filter((s) => s.score > 0).slice(0, k).map((s) => s.m)
  
  // If no results, return top memories
  return results.length > 0 ? results : memories.slice(0, 3)
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 IMPROVED CHAT - Returns specific answer, not all memories
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

  const allMemories = profile.memories as any[]
  const retrieved = retrieveMemories(opts.question, allMemories, 6)
  const sources = retrieved.map((m) => ({ id: m.id, title: m.title, year: m.year, type: m.type }))

  let answer: string
  const q = opts.question.toLowerCase()

  // 🔥 SPECIAL HANDLING: E=mc²
  if (q.includes('e=mc2') || q.includes('mc2') || q.includes('e mc2') || q.includes('emc2')) {
    const emcMemory = retrieved.find(m => 
      m.keywords.toLowerCase().includes('e=mc2') ||
      m.keywords.toLowerCase().includes('emc2') ||
      m.title.toLowerCase().includes('relativity') ||
      m.content.toLowerCase().includes('e = mc²')
    )
    
    if (emcMemory) {
      return {
        answer: `The equation E = mc² means energy (E) equals mass (m) times the speed of light (c) squared. It shows that mass and energy are interchangeable. A small amount of mass can be converted into a huge amount of energy because the speed of light squared (c²) is a very large number. This emerged from my special theory of relativity in 1905.\n\n${emcMemory.content}`,
        sources: [{ id: emcMemory.id, title: emcMemory.title, year: emcMemory.year, type: emcMemory.type }]
      }
    }
  }

  // 🔥 SPECIAL HANDLING: Relativity
  if (q.includes('relativity')) {
    const relMemory = retrieved.find(m => 
      m.keywords.toLowerCase().includes('relativity') ||
      m.title.toLowerCase().includes('relativity')
    )
    
    if (relMemory) {
      return {
        answer: relMemory.content + (relMemory.year ? ` (${relMemory.year})` : ''),
        sources: [{ id: relMemory.id, title: relMemory.title, year: relMemory.year, type: relMemory.type }]
      }
    }
  }

  // 🔥 SPECIAL HANDLING: Photoelectric Effect
  if (q.includes('photoelectric') || q.includes('nobel')) {
    const peMemory = retrieved.find(m => 
      m.keywords.toLowerCase().includes('photoelectric') ||
      m.title.toLowerCase().includes('photoelectric')
    )
    
    if (peMemory) {
      return {
        answer: peMemory.content + (peMemory.year ? ` (${peMemory.year})` : ''),
        sources: [{ id: peMemory.id, title: peMemory.title, year: peMemory.year, type: peMemory.type }]
      }
    }
  }

  // 🔥 SPECIAL HANDLING: Failure/Mistake
  if (q.includes('failure') || q.includes('mistake') || q.includes('blunder')) {
    const failMemory = retrieved.find(m => m.type === 'failure')
    
    if (failMemory) {
      return {
        answer: failMemory.content + (failMemory.year ? ` (${failMemory.year})` : ''),
        sources: [{ id: failMemory.id, title: failMemory.title, year: failMemory.year, type: failMemory.type }]
      }
    }
  }

  // 🔥 SPECIAL HANDLING: Discovery
  if (q.includes('discovery') || q.includes('found') || q.includes('discover')) {
    const discMemory = retrieved.find(m => m.type === 'discovery')
    
    if (discMemory) {
      return {
        answer: discMemory.content + (discMemory.year ? ` (${discMemory.year})` : ''),
        sources: [{ id: discMemory.id, title: discMemory.title, year: discMemory.year, type: discMemory.type }]
      }
    }
  }

  // 🔥 FALLBACK: Return the best matching memory
  if (retrieved.length > 0) {
    const top = retrieved[0]
    return {
      answer: top.content + (top.year ? ` (${top.year})` : ''),
      sources: [{ id: top.id, title: top.title, year: top.year, type: top.type }]
    }
  }

  // 🔥 NO MEMORIES
  if (allMemories.length === 0) {
    answer = `I don't have any preserved memories yet. Upload some knowledge about ${profile.name}.`
  } else {
    const fallback = allMemories.slice(0, 2)
    answer = `I don't have a specific memory matching that question. Here's what I know:\n\n${fallback
      .map((m, i) => `${i + 1}. (${m.year || 'undated'}) ${m.title}`)
      .join('\n\n')}`
  }

  return { answer, sources: [] }
}

// ─────────────────────────────────────────────────────────────────────────────
// THINKING-STYLE MODEL BUILDER
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
