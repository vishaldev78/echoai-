// lib/ai.ts - UPDATED with LLM7 API

import { db } from '@/lib/db'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
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
// TEXT UTILITIES
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

function tokenize(text: string): string[] {
  let cleaned = text
    .toLowerCase()
    .replace(/[²³]/g, '2')
    .replace(/[=+]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  const tokens = cleaned.split(' ').filter(w => w.length > 1 && !STOP_WORDS.has(w))
  
  const expanded = []
  for (const t of tokens) {
    expanded.push(t)
    if (t.includes('mc2') || t.includes('emc2')) {
      expanded.push('mc2', 'emc2', 'e=mc2', 'mc')
    }
    if (t.includes('relativity')) {
      expanded.push('relativity', 'relativ')
    }
    if (t.includes('photoelectric')) {
      expanded.push('photoelectric', 'photo')
    }
    if (t.includes('newton')) {
      expanded.push('newton', 'newtons')
    }
    if (t.includes('gravity')) {
      expanded.push('gravity', 'gravitation')
    }
    if (t.includes('tesla')) {
      expanded.push('tesla', 'ac', 'alternating')
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
// TYPE DETECTION
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_PATTERNS: { type: string; pattern: RegExp; label: string }[] = [
  { type: 'failure', pattern: /\b(fail|failed|failure|reject|rejected|wrong|error|bug|crash|broke|loss|lost|dead end|dead-end|mistake|lesson|blunder)\b/i, label: 'Failure' },
  { type: 'discovery', pattern: /\b(discover|discovered|found|breakthrough|realiz|insight|revealed|unlock|novel|key finding|emerged|invent|invented|created)\b/i, label: 'Discovery' },
  { type: 'decision', pattern: /\b(decid|decided|chose|chosen|choose|reject|rejected|adopt|adopted|switch|switched|select|selected|conclud|concluded)\b/i, label: 'Decision' },
  { type: 'experiment', pattern: /\b(experiment|test|tested|trial|prototype|measure|measured|evaluat|built|run|ran|cycl|thought experiment)\b/i, label: 'Experiment' },
  { type: 'principle', pattern: /\b(believe|principle|philosophy|always|never|must|should|rule|doctrine|fundamental|core|important)\b/i, label: 'Principle' },
  { type: 'quote', pattern: /["""].+?["""]/, label: 'Quote' },
  { type: 'fact', pattern: /\b(is|are|was|were|has|have|contains|consists|comprises|equals|approximately|about|known for)\b/i, label: 'Fact' },
  { type: 'concept', pattern: /\b(concept|theory|idea|hypothesis|approach|method|model|framework|design|architecture|pursuit|law)\b/i, label: 'Concept' },
]

function classifySentence(sentence: string): string {
  for (const { type, pattern } of TYPE_PATTERNS) {
    if (pattern.test(sentence)) return type
  }
  return 'note'
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE EXTRACTION (Local - No API needed)
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
  for (const sentence of sentences.slice(0, 25)) {
    const type = classifySentence(sentence)
    const sentenceYears = extractYears(sentence)
    const year = sentenceYears[0] || years[0] || null
    const keywords = topKeywords(sentence, 5).join(', ')

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

  const allKeywords = topKeywords(text, 10)
  for (const kw of allKeywords) {
    if (!graphNodes.some((n) => n.label.toLowerCase() === kw)) {
      graphNodes.push({ label: kw, type: 'method' })
    }
  }

  for (const m of memories.slice(0, 5)) {
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

  for (const m of memories.slice(0, 5)) {
    if (m.type === 'discovery') {
      graphEdges.push({ source: opts.profileName, target: m.title.slice(0, 30), relationship: 'discovered' })
    } else if (m.type === 'failure') {
      graphEdges.push({ source: opts.profileName, target: m.title.slice(0, 30), relationship: 'caused' })
    }
  }

  for (const kw of allKeywords.slice(0, 5)) {
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
// RETRIEVE MEMORIES (Local - No API needed)
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
    
    for (const t of qTokens) {
      score += (counts.get(t) ?? 0) * 2
    }
    
    const kws = m.keywords.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    for (const kw of kws) {
      const kwClean = kw.replace(/[^a-z0-9]/g, '')
      for (const t of qTokens) {
        if (kwClean.includes(t) || t.includes(kwClean)) {
          score += 3
        }
        if ((kwClean === 'emc2' || kwClean === 'e=mc2') && (t === 'mc2' || t === 'emc2' || t === 'e=mc2')) {
          score += 10
        }
        if (kwClean.includes('relativity') && t.includes('relativity')) {
          score += 8
        }
        if (kwClean.includes('photoelectric') && t.includes('photoelectric')) {
          score += 8
        }
        if (kwClean.includes('newton') && t.includes('newton')) {
          score += 8
        }
        if (kwClean.includes('gravity') && t.includes('gravity')) {
          score += 8
        }
        if (kwClean.includes('tesla') && t.includes('tesla')) {
          score += 8
        }
      }
    }
    
    const titleTokens = tokenize(m.title)
    for (const t of qTokens) {
      if (titleTokens.includes(t)) score += 4
    }
    
    const yearMatch = question.match(/\b(19|20|18|17)\d{2}\b/)
    if (yearMatch && m.year === parseInt(yearMatch[0])) {
      score += 5
    }
    
    const q = question.toLowerCase()
    if (q.includes('who is') || q.includes('who was') || q.includes('about') || q.includes('biography')) {
      if (m.keywords.toLowerCase().includes('biography') || 
          m.keywords.toLowerCase().includes('who is') ||
          m.title.toLowerCase().includes('biography')) {
        score += 20
      }
    }
    
    return { m, score }
  })
  
  scored.sort((a, b) => b.score - a.score)
  
  const results = scored.filter((s) => s.score > 0).slice(0, k).map((s) => s.m)
  
  return results.length > 0 ? results : memories.slice(0, 3)
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 CHAT WITH MEMORY - Using LLM7 API (FREE)
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

  // 🔥 If no memories, return fallback
  if (allMemories.length === 0) {
    return {
      answer: `I don't have any preserved memories yet. Please upload some knowledge about ${profile.name}.`,
      sources: []
    }
  }

  // 🔥 If no relevant memories found, return fallback
  if (retrieved.length === 0) {
    const fallback = allMemories.slice(0, 2)
    return {
      answer: `I don't have a specific memory matching that question. Here's what I know:\n\n${fallback
        .map((m, i) => `${i + 1}. (${m.year || 'undated'}) ${m.title}`)
        .join('\n\n')}`,
      sources: []
    }
  }

  try {
    // 🔥 Use LLM7 API for intelligent response
    const response = await generateAIResponse({
      question: opts.question,
      memories: retrieved,
      profile,
    })

    return {
      answer: response,
      sources
    }

  } catch (error) {
    console.error('LLM7 API error:', error)
    
    // 🔥 FALLBACK: Return a composed answer without AI
    const fallbackAnswer = composeFallbackAnswer(opts.question, retrieved, profile)
    return {
      answer: fallbackAnswer,
      sources
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 GENERATE AI RESPONSE USING LLM7 API
// ─────────────────────────────────────────────────────────────────────────────
async function generateAIResponse({
  question,
  memories,
  profile,
}: {
  question: string
  memories: any[]
  profile: any
}): Promise<string> {
  const apiKey = process.env.LLM7_API_KEY
  const baseUrl = process.env.LLM7_BASE_URL || 'https://api.llm7.io/v1'

  if (!apiKey) {
    console.warn('⚠️ LLM7_API_KEY not found, using fallback')
    return composeFallbackAnswer(question, memories, profile)
  }

  // Build context from memories
  const memoryContext = memories.map((m) => 
    `[${m.year || 'Unknown year'}] ${m.title}: ${m.content}`
  ).join('\n\n')

  // Build system prompt
  const systemPrompt = `You are ${profile.name}, a ${profile.title} in ${profile.field}.

About you: ${profile.bio}

Your thinking style:
- Writing: ${profile.thinkingStyle?.writingStyle || 'Clear and precise'}
- Problem solving: ${profile.thinkingStyle?.problemSolving || 'Analytical'}
- Preferences: ${profile.thinkingStyle?.preferences || 'Evidence-based'}

IMPORTANT RULES:
1. ONLY use the provided memories to answer
2. If a memory doesn't contain the answer, say "I don't have a specific memory about that"
3. Reference specific memories by year or title
4. Stay in character as ${profile.name}
5. Be concise but informative
6. Answer in FIRST PERSON as if you are ${profile.name}

Here are your relevant memories:
${memoryContext}

Remember: Answer as ${profile.name} using ONLY the memories above.`

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // or 'gpt-3.5-turbo', 'claude-3-haiku', etc.
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LLM7 API error:', response.status, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || composeFallbackAnswer(question, memories, profile)

  } catch (error) {
    console.error('LLM7 API call failed:', error)
    return composeFallbackAnswer(question, memories, profile)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 FALLBACK: Compose answer without AI (for when API fails)
// ─────────────────────────────────────────────────────────────────────────────
function composeFallbackAnswer(
  question: string,
  memories: any[],
  profile: any
): string {
  const q = question.toLowerCase()
  
  // Special handling for common question types
  if (q.includes('who is') || q.includes('who was') || q.includes('about')) {
    return `I am ${profile.name}, a ${profile.title} in ${profile.field}. ${profile.bio}`
  }

  if (q.includes('e=mc2') || q.includes('mc2') || q.includes('e mc2') || q.includes('emc2')) {
    const emc = memories.find(m => 
      m.keywords.toLowerCase().includes('e=mc2') || 
      m.keywords.toLowerCase().includes('emc2')
    )
    if (emc) {
      return `The equation E = mc² means energy (E) equals mass (m) times the speed of light (c) squared. It shows that mass and energy are interchangeable.\n\n${emc.content}`
    }
  }

  // Return top memory
  const top = memories[0]
  let prefix = ''
  if (q.includes('why')) prefix = 'Based on my preserved notes, '
  else if (q.includes('how')) prefix = "Here's how I approached it: "
  else if (q.includes('what') && (q.includes('failure') || q.includes('mistake'))) prefix = 'My biggest challenge was this: '
  else if (q.includes('what') && (q.includes('discover') || q.includes('key'))) prefix = 'My key finding was: '
  else if (q.includes('when')) prefix = 'According to my records, '
  else prefix = 'From my preserved memory: '

  const yearTag = top.year ? ` (${top.year})` : ''
  return `${prefix}${top.content}${yearTag}`
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
