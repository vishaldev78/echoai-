import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// A rich, pre-built Digital Memory for the hackathon demo so judges can
// converse with a preserved genius instantly — no upload wait needed.
// Subject: Albert Einstein, theoretical physicist.

const PROFILE = {
  name: 'Albert Einstein',
  title: 'Theoretical Physicist',
  field: 'Physics & Mathematics',
  bio: 'Revolutionized modern physics with the theory of relativity and the photoelectric effect. Spent decades pursuing a unified field theory. Believed that imagination is more important than knowledge, and that the most beautiful thing we can experience is the mysterious. Known for his humility, curiosity, and relentless questioning of the universe.',
  birthYear: 1879,
  deathYear: 1955,
  avatarColor: 'blue',
  accent: 'purple',
}

const MEMORIES = [
  {
    type: 'principle',
    title: 'Imagination over knowledge',
    content:
      'Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world. I always told my students: do not stop questioning. Curiosity has its own reason for existing.',
    year: 1929,
    keywords: 'imagination, knowledge, creativity, thinking, curiosity',
  },
  {
    type: 'discovery',
    title: 'The photoelectric effect',
    content:
      'Light behaves as both a wave and a particle. This quantum insight, which earned me the Nobel Prize in 1921, emerged from thinking about how light could eject electrons from metal. It was the first step toward quantum mechanics.',
    year: 1905,
    keywords: 'photoelectric effect, quantum, Nobel, light, particle, wave',
  },
  {
    type: 'discovery',
    title: 'Special theory of relativity',
    content:
      'In 1905, I realized that the laws of physics are the same for all observers moving at constant speed. This led to the conclusion that time and space are relative, not absolute. The equation E = mc² emerged from this work.',
    year: 1905,
    keywords: 'relativity, special relativity, E=mc², time, space, physics',
  },
  {
    type: 'discovery',
    title: 'General theory of relativity',
    content:
      'By 1915, I had extended relativity to include gravity. Massive objects warp the fabric of spacetime itself. This was confirmed in 1919 when starlight bent around the sun during a solar eclipse — it made me famous overnight.',
    year: 1915,
    keywords: 'general relativity, gravity, spacetime, eclipse, confirmation',
  },
  {
    type: 'failure',
    title: 'The cosmological constant mistake',
    content:
      'I introduced the cosmological constant to maintain a static universe, calling it my "greatest blunder." When Hubble showed the universe was expanding, I realized I had missed the most beautiful prediction of my own theory. I should have trusted the math.',
    year: 1917,
    keywords: 'cosmological constant, blunder, static universe, expansion, Hubble',
  },
  {
    type: 'principle',
    title: 'God does not play dice',
    content:
      'My famous objection to quantum mechanics. I could not accept that the universe was fundamentally probabilistic. "God does not play dice with the universe" — though I should have said: God plays dice, but they are loaded.',
    year: 1926,
    keywords: 'quantum mechanics, probability, determinism, Bohr, debate',
  },
  {
    type: 'concept',
    title: 'Unified field theory pursuit',
    content:
      'My life\'s final quest: unify electromagnetism and gravity into a single mathematical framework. I never succeeded. Some called it my obsession; I called it my duty. The pursuit taught me more than the destination ever would have.',
    year: 1940,
    keywords: 'unified field, electromagnetism, gravity, theory of everything, obsession',
  },
  {
    type: 'quote',
    title: '"The important thing is not to stop questioning"',
    content:
      'From my conversations with students. I always believed that the most important thing is to never lose a holy curiosity. The universe is vast and strange — our job is to keep asking, keep wondering.',
    year: 1955,
    keywords: 'questioning, curiosity, wonder, learning, education',
  },
  {
    type: 'decision',
    title: 'Letter to Roosevelt on atomic weapons',
    content:
      'In 1939, I signed the letter urging President Roosevelt to develop nuclear weapons before the Nazis. It was the hardest decision of my life. I later said: "If I had known the Germans would not succeed, I would have never lifted a finger."',
    year: 1939,
    keywords: 'atomic bomb, Roosevelt, World War II, decision, regret, nuclear',
  },
  {
    type: 'principle',
    title: 'Peace and internationalism',
    content:
      'After Hiroshima, I dedicated my life to peace. I became a passionate advocate for disarmament and world government. "I made one great mistake in my life — when I signed the letter to Roosevelt recommending that atom bombs be made."',
    year: 1945,
    keywords: 'peace, disarmament, internationalism, activism, humanitarian',
  },
  {
    type: 'failure',
    title: 'Rejected from ETH Zurich as a student',
    content:
      'I failed the entrance exam to the Swiss Federal Institute of Technology in 1895. Not because I lacked ability — but because I was unprepared in botany, zoology, and languages. The rejection taught me to trust my own path, not institutional approval.',
    year: 1895,
    keywords: 'failure, ETH Zurich, rejection, education, resilience',
  },
  {
    type: 'experiment',
    title: 'The thought experiment of chasing a light beam',
    content:
      'At age 16, I imagined chasing a beam of light. What would I see? This simple thought experiment became the seed of relativity. I learned that our most powerful instrument is not the telescope or microscope — it is the imagination.',
    year: 1895,
    keywords: 'thought experiment, light beam, relativity, imagination, physics',
  },
]

const TIMELINE = [
  { year: 1879, title: 'Born in Ulm, Germany', description: 'Born to Hermann and Pauline Einstein. My father gave me a compass at age 5 — it sparked my lifelong wonder about invisible forces.', type: 'milestone' },
  { year: 1895, title: 'Failed ETH Zurich entrance exam', description: 'Failed the exam but passed the math section brilliantly. The rejection taught me to trust my own mind.', type: 'failure' },
  { year: 1902, title: 'Patent clerk at the Swiss Patent Office', description: 'The "miracle year" incubator. I thought about physics while inspecting patents. The job paid the bills and left my mind free to wander.', type: 'publication' },
  { year: 1905, title: 'Annus Mirabilis — The Miracle Year', description: 'Four papers that changed physics: photoelectric effect, Brownian motion, special relativity, and E=mc². At 26 years old, I was a patent clerk who rewrote the universe.', type: 'discovery' },
  { year: 1915, title: 'General Theory of Relativity completed', description: 'The full theory — gravity as warped spacetime. It took 10 years of struggle to generalize special relativity.', type: 'discovery' },
  { year: 1919, title: 'Solar eclipse confirms relativity', description: 'Arthur Eddington\'s expedition showed starlight bending around the sun. I became a celebrity overnight. The New York Times headline: "Lights All Askew in the Heavens."', type: 'discovery' },
  { year: 1921, title: 'Nobel Prize in Physics', description: 'Awarded for the photoelectric effect, not relativity (which was still controversial). The committee played it safe.', type: 'publication' },
  { year: 1926, title: 'Famous quantum debates with Bohr', description: 'The "God does not play dice" confrontation at the Solvay Conference. Bohr and I disagreed fundamentally — and I was wrong.', type: 'milestone' },
  { year: 1933, title: 'Fled Nazi Germany for the USA', description: 'As a Jewish scientist, I could not stay. The Nazis burned my books. Princeton offered me refuge.', type: 'decision' },
  { year: 1939, title: 'Signed the Roosevelt letter', description: 'Urged development of the atomic bomb out of fear that Hitler would build it first. It was the decision I most regretted.', type: 'decision' },
  { year: 1945, title: 'Hiroshima and lifelong pacifism', description: 'After the bomb fell, I dedicated my remaining years to peace. "The atomic bomb has changed everything except our way of thinking."', type: 'milestone' },
  { year: 1955, title: 'Final days at Princeton', description: 'I died peacefully at age 76, still working on the unified field theory. My final words were in German — lost to the nurse who did not understand them.', type: 'milestone' },
]

const GRAPH_NODES = [
  { label: 'Albert Einstein', type: 'person' },
  { label: 'Physics & Mathematics', type: 'field' },
  { label: 'Theory of Relativity', type: 'research' },
  { label: 'Quantum Mechanics', type: 'research' },
  { label: 'Photoelectric Effect', type: 'discovery' },
  { label: 'Unified Field Theory', type: 'concept' },
  { label: 'E=mc²', type: 'discovery' },
  { label: 'Spacetime', type: 'concept' },
  { label: 'ETH Zurich', type: 'institution' },
  { label: 'Swiss Patent Office', type: 'institution' },
  { label: 'Nobel Prize', type: 'impact' },
  { label: 'Nuclear Disarmament', type: 'impact' },
  { label: 'Imagination', type: 'principle' },
]

const GRAPH_EDGES = [
  { source: 'Albert Einstein', target: 'Physics & Mathematics', relationship: 'part_of' },
  { source: 'Albert Einstein', target: 'Theory of Relativity', relationship: 'developed' },
  { source: 'Theory of Relativity', target: 'Spacetime', relationship: 'introduced' },
  { source: 'Theory of Relativity', target: 'E=mc²', relationship: 'derived' },
  { source: 'Albert Einstein', target: 'Quantum Mechanics', relationship: 'contributed_to' },
  { source: 'Quantum Mechanics', target: 'Photoelectric Effect', relationship: 'explained' },
  { source: 'Albert Einstein', target: 'Unified Field Theory', relationship: 'pursued' },
  { source: 'Albert Einstein', target: 'ETH Zurich', relationship: 'attended' },
  { source: 'Albert Einstein', target: 'Swiss Patent Office', relationship: 'worked_at' },
  { source: 'Photoelectric Effect', target: 'Nobel Prize', relationship: 'led_to' },
  { source: 'Albert Einstein', target: 'Nuclear Disarmament', relationship: 'advocated' },
  { source: 'Albert Einstein', target: 'Imagination', relationship: 'valued' },
  { source: 'Imagination', target: 'Theory of Relativity', relationship: 'enabled' },
  { source: 'Nuclear Disarmament', target: 'Albert Einstein', relationship: 'influenced' },
]

const THINKING_STYLE = {
  writingStyle: 'Reflective, philosophical, humble — uses metaphor and thought experiments to explain complex ideas. Prefers simple language to mathematical formalism in communication.',
  problemSolving: 'Uses thought experiments (Gedankenexperiment) to visualize problems before deriving equations. Reduces complexity to its essential physical insight.',
  preferences: 'Prefers elegance and simplicity in equations. Believes a theory should be beautiful. Will sacrifice mathematical rigor for physical intuition when communicating.',
  summary: 'A humble genius who saw physics as poetry. Believed in the power of imagination and relentless questioning. His legacy: physics was never the same, and neither were we.',
}

const DEMO_DOCUMENTS = [
  {
    title: 'Thought Experiment 1905 — Chasing a Light Beam',
    sourceType: 'note',
    content:
      'Date: 1905. What would it look like to ride alongside a beam of light? At age 16, this question consumed me. I imagined: if I could catch up to light, I would see the waves frozen in space. But Maxwell said light always moves at the same speed. Contradiction. Resolution: time itself must slow down, space must contract. This simple curiosity became relativity. The lesson: never dismiss a child\'s question. They might be asking the most important one.',
  },
  {
    title: 'Letter to Roosevelt, August 2, 1939',
    sourceType: 'note',
    content:
      'Dear Mr. President: I am writing to alert you to the possibility that Germany might be developing an atomic bomb. Enrico Fermi and Leo Szilard have urged me to convey this urgency. The element uranium may be turned into a new source of energy in the near future. I do not know if the Germans are working on this. But if they succeed, it would be catastrophic for civilization. I urge you to support research. — With respect, Albert Einstein.',
  },
  {
    title: 'Final Journal Entry, April 1955',
    sourceType: 'note',
    content:
      'I am still working on the unified field theory. The equations are beautiful — but they refuse to match nature. Perhaps my greatest lesson: nature does not owe us agreement. We owe nature our attention. I spent my life trying to read the mind of God. Now I see: God is not a mathematician. God is the mystery itself. And mystery — not answers — is what I will miss most.',
  },
]

export async function POST(req: Request) {
  const ownerId = req.headers.get('x-user-id')
  if (!ownerId) {
    return Response.json({ error: 'Sign in to load the demo' }, { status: 401 })
  }
  
  // Idempotent per-user: remove any prior Einstein profile owned by this user
  const existing = await db.profile.findFirst({
    where: { name: PROFILE.name, ownerId },
    select: { id: true },
  })
  if (existing) {
    await db.profile.delete({ where: { id: existing.id } })
  }

  const profile = await db.profile.create({ data: { ...PROFILE, ownerId } })

  // documents
  const docRows = await Promise.all(
    DEMO_DOCUMENTS.map((d) =>
      db.document.create({
        data: {
          profileId: profile.id,
          title: d.title,
          sourceType: d.sourceType,
          content: d.content,
          charCount: d.content.length,
        },
      }),
    ),
  )

  // memories (link to first doc as a nominal source)
  await db.memory.createMany({
    data: MEMORIES.map((m) => ({
      profileId: profile.id,
      documentId: docRows[0].id,
      type: m.type,
      title: m.title,
      content: m.content,
      year: m.year,
      keywords: m.keywords,
    })),
  })

  // timeline
  await db.timelineEvent.createMany({
    data: TIMELINE.map((e) => ({ profileId: profile.id, ...e })),
  })

  // graph nodes
  const nodeRows = await Promise.all(
    GRAPH_NODES.map((n) =>
      db.graphNode.create({ data: { profileId: profile.id, label: n.label, type: n.type } }),
    ),
  )
  const labelToId = new Map(nodeRows.map((n) => [n.label, n.id]))

  // graph edges
  await db.graphEdge.createMany({
    data: GRAPH_EDGES.map((e) => ({
      profileId: profile.id,
      source: labelToId.get(e.source)!,
      target: labelToId.get(e.target)!,
      relationship: e.relationship,
    })).filter((e) => e.source && e.target),
  })

  // thinking style
  await db.thinkingStyle.create({ data: { profileId: profile.id, ...THINKING_STYLE } })

  const counts = await db.profile.findUnique({
    where: { id: profile.id },
    include: { _count: { select: { memories: true, documents: true, timelineEvents: true, graphNodes: true, graphEdges: true } } },
  })

  return NextResponse.json({ profile, counts, seeded: true })
}
