import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// A rich, pre-built Digital Memory for the hackathon demo so judges can
// converse with a preserved scientist instantly — no upload wait needed.
// Subject: Dr. Aryan Rao, solid-state battery materials scientist.

const PROFILE = {
  name: 'Dr. Aryan Rao',
  title: 'Solid-State Battery Scientist',
  field: 'Materials Science & Energy Storage',
  bio: 'Pioneered sulfide-based solid electrolytes for next-generation batteries. Spent a decade chasing a single goal: an energy-dense, fire-safe cell that outlives the devices it powers. Believed the most valuable knowledge is the reasoning behind the failures, not the publications behind the successes.',
  birthYear: 1990,
  deathYear: 2033,
  avatarColor: 'amber',
  accent: 'emerald',
}

const MEMORIES = [
  {
    type: 'principle',
    title: 'Failures encode the real reasoning',
    content:
      'I insisted every lab notebook entry end with a "why" paragraph. A published paper hides the hundred dead ends; the notebook is where my actual thinking lived. Future students should read the failures before the discoveries.',
    year: 2026,
    keywords: 'failure, reasoning, notebook, methodology, lab culture',
  },
  {
    type: 'decision',
    title: 'Rejected lithium-metal anode for the 2028 prototype',
    content:
      'I rejected the lithium-metal anode design in 2028 because its thermal stability was insufficient — dendrite nucleation at 60°C created a runaway risk I was not willing to ship. The energy density gain (~15%) did not justify a cell that could ignite in a phone pocket.',
    year: 2028,
    keywords: 'lithium metal, anode, thermal stability, dendrite, safety, rejection, battery',
  },
  {
    type: 'failure',
    title: 'High-temperature degradation of the 2025 cell',
    content:
      'The 2025 prototype failed catastrophically: at 80°C the sulfide electrolyte decomposed and the cell lost 40% capacity in 50 cycles. Root cause was interfacial reaction between Li6PS5Cl and the lithium anode. It taught me that interface chemistry, not bulk conductivity, governs real-world life.',
    year: 2025,
    keywords: 'failure, high temperature, degradation, sulfide, interface, capacity loss, LPSCl',
  },
  {
    type: 'discovery',
    title: 'Argyrodite interfacial coating doubles cycle life',
    content:
      'By coating the Li6PS5Cl electrolyte with a 4nm LiNbO3 interlayer, interfacial resistance dropped from 1200 to 210 Ω·cm² and cycle life doubled to over 1000 cycles. The coating became the keystone of every later cell I built.',
    year: 2027,
    keywords: 'discovery, argyrodite, LiNbO3, coating, interface, cycle life, interlayer',
  },
  {
    type: 'experiment',
    title: 'Symmetric Li/Li cell cycling protocol',
    content:
      'I standardized on symmetric Li/Li cells at 0.5 mA/cm² for 1000h to screen electrolytes before full-cell assembly. It cut evaluation time from 3 months to 2 weeks and caught dendrite-prone chemistries early.',
    year: 2026,
    keywords: 'experiment, symmetric cell, protocol, screening, dendrite, current density',
  },
  {
    type: 'concept',
    title: 'Interface-first design philosophy',
    content:
      'Bulk ionic conductivity is a vanity metric. The interfaces — anode/electrolyte and cathode/electrolyte — determine whether a solid cell survives. I taught my group to design interfaces first and chemistry second.',
    year: 2027,
    keywords: 'concept, interface, design philosophy, conductivity, cathode, anode',
  },
  {
    type: 'quote',
    title: '"A battery that burns is not a battery, it is a liability."',
    content:
      'From my 2029 keynote on safety-first design. I refused to publish any cell that could not pass a 150°C nail-penetration test, regardless of its energy density headline.',
    year: 2029,
    keywords: 'quote, safety, nail penetration, fire, liability, keynote',
  },
  {
    type: 'fact',
    title: 'Target: 500 Wh/kg at 1000 cycles',
    content:
      'The moonshot metric I set for the lab in 2030: 500 Wh/kg gravimetric energy density sustained over 1000 cycles with under 10% fade. We hit 412 Wh/kg by 2032 — close, not enough.',
    year: 2030,
    keywords: 'target, energy density, wh/kg, cycles, goal, metric',
  },
  {
    type: 'discovery',
    title: 'Chlorine-rich argyrodite hits 12 mS/cm',
    content:
      'Tuning the chlorine stoichiometry in Li6PS5Cl toward Li6PS5.5Cl0.5 raised room-temperature ionic conductivity to 12 mS/cm — within reach of liquid electrolytes while remaining non-flammable.',
    year: 2031,
    keywords: 'discovery, chlorine, stoichiometry, conductivity, argyrodite, mS/cm',
  },
  {
    type: 'failure',
    title: 'Scale-up killed the 2031 cell',
    content:
      'The lab cell hit 1000 cycles; the pilot line made 60 before failure. Roll-to-roll calendaring introduced microcracks in the sulfide pellet. My mistake was optimizing the chemistry without owning the manufacturing process. Manufacturing IS the science at scale.',
    year: 2031,
    keywords: 'failure, scale-up, manufacturing, microcracks, calendaring, pilot line',
  },
  {
    type: 'decision',
    title: 'Open-sourced the interfacial coating recipe',
    content:
      'In 2032 I published the full LiNbO3 coating protocol under CC-BY. A locked-in safety breakthrough helps no one. I traded a patent for velocity across the field.',
    year: 2032,
    keywords: 'decision, open source, patent, CC-BY, coating, protocol, field velocity',
  },
  {
    type: 'principle',
    title: 'Own the process, not just the material',
    content:
      'My final lesson: a material that cannot be manufactured is a hypothesis, not a product. Every future researcher should spend at least one season on the production floor before claiming a breakthrough.',
    year: 2032,
    keywords: 'principle, manufacturing, process, production, hypothesis, lesson',
  },
]

const TIMELINE = [
  { year: 2025, title: 'First sulfide prototype fails at 80°C', description: 'Li6PS5Cl cell loses 40% capacity in 50 cycles — interfacial decomposition. The failure reframes my entire research direction toward interfaces.', type: 'failure' },
  { year: 2026, title: 'Standardized symmetric-cell screening', description: 'Adopted Li/Li symmetric cycling at 0.5 mA/cm² — evaluation time drops from 3 months to 2 weeks.', type: 'experiment' },
  { year: 2027, title: 'LiNbO3 interlayer doubles cycle life', description: '4nm coating cuts interfacial resistance 6× and pushes cycle life past 1000. The keystone discovery of my career.', type: 'discovery' },
  { year: 2028, title: 'Rejected lithium-metal anode for production', description: 'Thermal runaway risk at 60°C outweighs the 15% energy gain. Safety-first decision that defined my reputation.', type: 'decision' },
  { year: 2029, title: '"A battery that burns is a liability" keynote', description: 'Public commitment to 150°C nail-penetration survival as a publishing gate for the lab.', type: 'publication' },
  { year: 2030, title: 'Set the 500 Wh/kg × 1000 cycle moonshot', description: 'Defined the lab-defining target metric. Every cell after this is measured against it.', type: 'milestone' },
  { year: 2031, title: 'Chlorine-tuned argyrodite: 12 mS/cm', description: 'Stoichiometry push reaches liquid-electrolyte conductivity while staying non-flammable. Lab cell clears 1000 cycles.', type: 'discovery' },
  { year: 2031, title: 'Pilot-line scale-up fails at 60 cycles', description: 'Roll calendaring introduces microcracks. Hard lesson: manufacturing is the science at scale.', type: 'failure' },
  { year: 2032, title: 'Open-sourced the coating protocol (CC-BY)', description: 'Published the full LiNbO3 recipe rather than patenting it. Traded a patent for field-wide velocity.', type: 'decision' },
  { year: 2033, title: 'Final notebook: 412 Wh/kg, short of moonshot', description: 'Closed the lab notebook with 412/500 Wh/kg achieved. The gap, and the reasoning behind it, is the real inheritance.', type: 'milestone' },
]

const GRAPH_NODES = [
  { label: 'Dr. Aryan Rao', type: 'person' },
  { label: 'Materials Science & Energy Storage', type: 'field' },
  { label: 'Solid-State Batteries', type: 'research' },
  { label: 'Argyrodite Electrolyte', type: 'method' },
  { label: 'LiNbO3 Interlayer', type: 'discovery' },
  { label: 'Interface-First Design', type: 'concept' },
  { label: 'Lithium-Metal Anode', type: 'experiment' },
  { label: '2025 Thermal Failure', type: 'experiment' },
  { label: 'Symmetric Cell Screening', type: 'method' },
  { label: '500 Wh/kg Moonshot', type: 'impact' },
  { label: 'Pilot-Line Scale-Up', type: 'experiment' },
  { label: 'Open-Sourced Coating', type: 'decision' },
  { label: 'Safety-First Doctrine', type: 'principle' },
]

const GRAPH_EDGES = [
  { source: 'Dr. Aryan Rao', target: 'Materials Science & Energy Storage', relationship: 'part_of' },
  { source: 'Dr. Aryan Rao', target: 'Solid-State Batteries', relationship: 'used' },
  { source: 'Solid-State Batteries', target: 'Argyrodite Electrolyte', relationship: 'part_of' },
  { source: 'Argyrodite Electrolyte', target: '2025 Thermal Failure', relationship: 'caused' },
  { source: '2025 Thermal Failure', target: 'Interface-First Design', relationship: 'led_to' },
  { source: 'Interface-First Design', target: 'LiNbO3 Interlayer', relationship: 'led_to' },
  { source: 'LiNbO3 Interlayer', target: 'Solid-State Batteries', relationship: 'influenced' },
  { source: 'Dr. Aryan Rao', target: 'Lithium-Metal Anode', relationship: 'rejected' },
  { source: 'Lithium-Metal Anode', target: 'Safety-First Doctrine', relationship: 'led_to' },
  { source: 'Symmetric Cell Screening', target: 'Argyrodite Electrolyte', relationship: 'used' },
  { source: 'Argyrodite Electrolyte', target: '500 Wh/kg Moonshot', relationship: 'influenced' },
  { source: 'Argyrodite Electrolyte', target: 'Pilot-Line Scale-Up', relationship: 'led_to' },
  { source: 'Pilot-Line Scale-Up', target: 'Open-Sourced Coating', relationship: 'led_to' },
  { source: 'LiNbO3 Interlayer', target: 'Open-Sourced Coating', relationship: 'part_of' },
  { source: 'Safety-First Doctrine', target: 'Dr. Aryan Rao', relationship: 'influenced' },
]

const THINKING_STYLE = {
  writingStyle: 'Terse, first-person, engineered — favors concrete numbers (4nm, 12 mS/cm, 1000 cycles) over adjectives.',
  problemSolving: 'Reduces every problem to its governing interface; designs the failure mode first, then the chemistry.',
  preferences: 'Prefers symmetric-cell screening over full-cell heroics; will sacrifice energy density for safety without hesitation.',
  summary: 'A safety-first empiricist who treats failures as primary literature. Believes a material unmanufacturable is a hypothesis, not a product — and that the reasoning behind a rejection matters more than the discovery itself.',
}

const DEMO_DOCUMENTS = [
  {
    title: 'Lab Notebook 2025 — Thermal Failure Analysis',
    sourceType: 'note',
    content:
      'Date: 2025-11-03. Cell LPSCl-04 failed at 80°C after 50 cycles, capacity retention 58%. Post-mortem: XPS shows Li2S formation at the Li/Li6PS5Cl interface — the electrolyte is being reduced by the lithium metal. Bulk conductivity is fine (3.2 mS/cm); the interface is killing us. Why: I optimized for conductivity when I should have optimized for stability. Lesson: interface chemistry, not bulk conductivity, governs real-world life. Next: coat the interface. Idea: thin oxide interlayer (LiNbO3?) to block reduction. Why this over LiF? Oxide is mechanically stiffer, resists dendrite penetration too.',
  },
  {
    title: 'Keynote 2029 — Safety-First Battery Design',
    sourceType: 'note',
    content:
      'A battery that burns is not a battery, it is a liability. From today, no cell leaves this lab without surviving a 150°C nail-penetration test. I do not care if it is 500 Wh/kg — if it ignites under abuse, it does not ship. The lithium-metal anode we rejected in 2028? Still rejected. The 15% energy gain is not worth a phone that catches fire in a pocket. Safety is not a feature; it is the precondition for existence.',
  },
  {
    title: 'Final Notebook Entry 2033 — The Gap',
    sourceType: 'note',
    content:
      'We ended at 412 Wh/kg over 1000 cycles. Short of the 500 moonshot by 88 Wh/kg. Where did the gap live? Not in the electrolyte — we hit 12 mS/cm. Not in the coating — the interlayer held. The gap lived in manufacturing. The pilot line introduced microcracks the lab cell never saw. My final lesson, the one I most want preserved: own the process, not just the material. A material that cannot be manufactured is a hypothesis, not a product. Whoever reads this — spend a season on the production floor before you claim a breakthrough. The reasoning behind the gap is the real inheritance. The papers show 412. The notebook shows why it was not 500.',
  },
]

export async function POST() {
  // idempotent: remove any prior Dr. Aryan Rao profile, then rebuild
  const existing = await db.profile.findFirst({
    where: { name: PROFILE.name },
    select: { id: true },
  })
  if (existing) {
    await db.profile.delete({ where: { id: existing.id } })
  }

  const profile = await db.profile.create({ data: PROFILE })

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
