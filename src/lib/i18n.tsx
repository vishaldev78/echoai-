'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type Lang = 'en' | 'hi'

// ─────────────────────────────────────────────────────────────────────────────
// Dictionary — every user-facing string in the app, in English + Hindi.
// ─────────────────────────────────────────────────────────────────────────────
const en = {
  // nav
  'nav.home': 'Home',
  'nav.memories': 'Memories',
  'nav.vision': 'Vision',
  'nav.theme.toggle': 'Toggle theme',
  'nav.language': 'Language',

  // footer
  'footer.tagline': 'Books preserved what humans knew. ECHO preserves how humans thought — a digital memory layer for humanity.',
  'footer.built': 'Built with \u2665 for the generations who come next.',

  // landing — hero
  'landing.badge': 'A Digital Memory Layer for Humanity',
  'landing.title1': 'Preserving human intelligence',
  'landing.title2': 'beyond human lifespan.',
  'landing.subtitle': 'When a great scientist dies, their reasoning disappears with them — the papers survive, but the why does not. ECHO distills a person\u2019s writings, notes and failures into a living knowledge graph you can converse with, forever.',
  'landing.cta.demo': "Explore Albert Einstein Memory",
  'landing.cta.demoLoading': 'Awakening\u2026',
  'landing.cta.preserve': 'Preserve a Memory',
  'landing.signup': 'No signup. Try the live demo of a solid-state battery scientist\u2019s preserved mind.',

  'landing.stat.knowledge': 'Knowledge',
  'landing.stat.extracted': 'Extracted',
  'landing.stat.reasoning': 'Reasoning',
  'landing.stat.preserved': 'Preserved',
  'landing.stat.failures': 'Failures',
  'landing.stat.firstClass': 'First-class',
  'landing.stat.answers': 'Answers',
  'landing.stat.grounded': 'Grounded',

  // landing — problem
  'landing.problem.label': 'The problem',
  'landing.problem.title1': 'A scientist publishes 100 papers.',
  'landing.problem.title2': 'Then dies — and the reasoning vanishes.',
  'landing.problem.body': 'Human knowledge lives fragmented across papers, emails, notebooks and code. The published record hides a hundred dead ends. After death, nobody knows why a method was chosen, what failures shaped it, or what intuition guided the breakthroughs. Future generations cannot ask a single question.',
  'landing.problem.1': 'Information is fragmented across formats',
  'landing.problem.2': 'Context & decision-making process disappears',
  'landing.problem.3': 'Failures are never published',
  'landing.problem.4': 'You cannot ask the dead a question',
  'landing.problem.survives': 'What survives today',
  'landing.problem.theWhat': 'the what',
  'landing.problem.theResult': 'the result',
  'landing.problem.theHow': 'the how',
  'landing.problem.theAnecdote': 'the anecdote',
  'landing.problem.whyGone': 'But the why? Gone.',

  // landing — solution
  'landing.solution.label': 'The solution',
  'landing.solution.title': 'From scattered artifacts to a mind you can talk to.',
  'landing.solution.body': "ECHO reads everything a person left behind and weaves it into a structured Digital Memory — knowledge units, a reasoning graph, a timeline, and a thinking-style fingerprint. Then it answers questions in their voice, grounded only in what they actually wrote.",
  'landing.solution.1.title': 'Upload knowledge',
  'landing.solution.1.desc': 'PDFs, notes, markdown, transcripts, code. The raw footprint of a mind.',
  'landing.solution.2.title': 'AI extraction',
  'landing.solution.2.desc': 'Facts, decisions, discoveries, failures and principles — pulled into structured memory.',
  'landing.solution.3.title': 'Memory graph',
  'landing.solution.3.desc': 'A living graph of how ideas, experiments and outcomes connect and influence each other.',
  'landing.solution.4.title': 'Ask the memory',
  'landing.solution.4.desc': 'Converse in their voice. Grounded answers, cited to the exact preserved memory.',

  // landing — features
  'landing.features.label': 'Core capabilities',
  'landing.features.title': 'Six layers of a preserved mind.',
  'landing.features.1.title': 'Knowledge Upload',
  'landing.features.1.desc': 'Ingest PDF, TXT, Markdown and transcripts. Every artifact becomes a source node in the memory.',
  'landing.features.2.title': 'AI Knowledge Extraction',
  'landing.features.2.desc': "Distills facts, concepts, relationships, decisions and the timeline of a life's work.",
  'landing.features.3.title': 'Memory Graph',
  'landing.features.3.desc': 'Person \u2192 research \u2192 discovery \u2192 decision \u2192 impact. Navigate the topology of reasoning.',
  'landing.features.4.title': 'Ask The Memory',
  'landing.features.4.desc': '\u201CWhy did you reject the lithium design?\u201D \u2014 answered from the 2028 notes, in their voice.',
  'landing.features.5.title': 'Thinking Style Model',
  'landing.features.5.desc': 'Learns writing voice, problem-solving approach and preferences to channel the person.',
  'landing.features.6.title': 'Timeline Memory',
  'landing.features.6.desc': 'Every experiment, failure, discovery and publication plotted across the years.',

  // landing — moonshot
  'landing.moonshot.label': 'Why this is a moonshot',
  'landing.moonshot.title1': 'Current AI stores information.',
  'landing.moonshot.title2': 'ECHO stores how humans thought.',
  'landing.moonshot.body': 'Imagine an Einstein Memory. A Newton Memory. The memories of every scientist, doctor, engineer and teacher who shaped our world \u2014 queryable, in their own voice, by anyone who comes after. A collective intelligence network, built one preserved mind at a time.',
  'landing.moonshot.quote': '\u201CBooks preserved what humans knew. ECHO preserves how humans thought.\u201D',
  'landing.moonshot.pitch': '\u2014 The pitch',
  'landing.moonshot.cta': 'Converse with a preserved mind',

  // profiles view
  'profiles.title': 'Preserved Memories',
  'profiles.subtitle': "Each memory is a person's knowledge, reasoning and experience — distilled into a mind you can converse with.",
  'profiles.loadDemo': 'Load demo',
  'profiles.create': 'Create memory',
  'profiles.loading': 'Loading memories\u2026',
  'profiles.empty.title': 'No memories preserved yet',
  'profiles.empty.body': "Create a digital memory from someone's writings, or load the live demo of Dr. Aryan Rao — a solid-state battery scientist whose reasoning lives on here.",
  'profiles.empty.loadDemo': 'Load Dr. Aryan demo',
  'profiles.card.converse': 'Converse with memory',
  'profiles.card.docs': 'docs',
  'profiles.card.memories': 'memories',
  'profiles.card.events': 'events',
  'profiles.delete.title': 'Release this memory?',
  'profiles.delete.body': 'This permanently deletes {name}\'s preserved memory, documents and conversations. This cannot be undone.',
  'profiles.delete.confirm': 'Release memory',
  'profiles.delete.cancel': 'Cancel',
  'profiles.delete.success': 'Memory released.',

  // create dialog
  'create.title': 'Create a digital memory',
  'create.subtitle': 'Define whose intelligence you are preserving. You\u2019ll upload their knowledge next.',
  'create.name': 'Full name *',
  'create.name.ph': 'Dr. Aryan Rao',
  'create.titleField': 'Title *',
  'create.titleField.ph': 'Solid-State Battery Scientist',
  'create.field': 'Field *',
  'create.field.ph': 'Materials Science & Energy Storage',
  'create.bio': 'Bio *',
  'create.bio.ph': 'A short biography capturing who they were and what they devoted their life to.',
  'create.birthYear': 'Birth year',
  'create.deathYear': 'Death year (optional)',
  'create.submit': 'Create memory',
  'creating': 'Creating\u2026',
  'create.success': 'Memory profile created.',
  'create.error': 'Name, title, field and bio are required.',

  // profile detail
  'profile.back': 'All memories',
  'profile.tab.overview': 'Overview',
  'profile.tab.upload': 'Upload',
  'profile.tab.memories': 'Memories',
  'profile.tab.graph': 'Graph',
  'profile.tab.timeline': 'Timeline',
  'profile.tab.ask': 'Ask',
  'profile.stat.memories': 'memories',
  'profile.stat.documents': 'documents',
  'profile.stat.events': 'events',
  'profile.loading': 'Awakening the memory\u2026',
  'profile.fingerprint': 'Thinking fingerprint',

  // overview panel
  'overview.featured': 'Featured memories',
  'overview.all': 'All',
  'overview.graphTitle': 'Memory graph',
  'overview.explore': 'Explore',
  'overview.askTitle': 'Ask the memory',
  'overview.askBody': 'Converse in {name}\'s voice. Answers are grounded only in preserved memories.',
  'overview.askCta': 'Start conversation',
  'overview.recentTimeline': 'Recent timeline',
  'overview.noMemories': 'No memories extracted yet.',
  'overview.uploadKb': 'Upload knowledge',
  'overview.noTimeline': 'No timeline yet.',
  'overview.fingerprint.writing': 'Writing voice',
  'overview.fingerprint.solving': 'Problem solving',
  'overview.fingerprint.prefs': 'Preferences',

  // upload panel
  'upload.title': 'Upload knowledge',
  'upload.subtitle': "Feed {name}'s writings, papers, notes or transcripts. The AI will extract memories, weave the graph and extend the timeline.",
  'upload.docTitle': 'Document title',
  'upload.docTitlePh': 'Lab Notebook 2025 — Thermal Failure Analysis',
  'upload.sourceType': 'Source type',
  'upload.content': 'Content',
  'upload.contentPh': 'Paste a paper, notebook entry, journal, transcript or code here. The richer the reasoning, the richer the memory.',
  'upload.paste': 'Paste',
  'upload.openFile': 'Open file',
  'upload.preserve': 'Preserve & extract',
  'upload.distilling': 'Distilling knowledge\u2026',
  'upload.preserving': 'Preserving\u2026',
  'upload.extractingToast': 'Distilling knowledge with AI\u2026',
  'upload.success': 'Preserved {memories} memories, {timeline} events, {nodes} graph nodes.',
  'upload.error': 'Add a title and some content to preserve.',
  'upload.whatExtracts': 'What the AI extracts',
  'upload.sourceDocs': 'Source documents',
  'upload.noDocs': 'No documents uploaded yet.',
  'upload.source.pdf': 'PDF',
  'upload.source.txt': 'Text',
  'upload.source.md': 'Markdown',
  'upload.source.audio': 'Audio transcript',
  'upload.source.note': 'Note',

  // memories panel
  'memories.title': 'Extracted memories',
  'memories.subtitle': 'Each card is a unit of preserved knowledge or reasoning — the atoms of the digital memory.',
  'memories.search': 'Search memories\u2026',
  'memories.all': 'All',
  'memories.loading': 'Loading memories\u2026',
  'memories.empty': 'No memories match. Try a different search or type.',

  // graph panel
  'graph.title': 'Knowledge graph',
  'graph.subtitle': "How {name}'s ideas, experiments, decisions and outcomes connect. Hover a node for detail; hover an edge for the relationship.",
  'graph.loading': 'Weaving the graph\u2026',

  // timeline panel
  'timeline.title': 'The journey',
  'timeline.subtitle': 'Experiments, discoveries, failures, decisions and milestones — the arc of {name}\'s preserved work across the years.',
  'timeline.loading': 'Tracing the journey\u2026',

  // chat panel
  'chat.active': 'Digital memory active',
  'chat.you': 'You',
  'chat.clear': 'Clear',
  'chat.cleared': 'Conversation cleared.',
  'chat.placeholder': 'Ask {name} anything — in their voice\u2026',
  'chat.disclaimer': 'Answers are grounded only in preserved memories.',
  'chat.toSend': 'to send',
  'chat.grounded': 'Grounded in:',
  'chat.loading': 'Loading conversation\u2026',
  'chat.silent': 'The memory fell silent.',
  'chat.welcome.title': "Speak with {name}'s preserved memory",
  'chat.welcome.body': 'Ask about their work in {field}. Responses are grounded in what {name} actually wrote — nothing is invented.',
  'chat.suggest.1': 'What was your biggest failure?',
  'chat.suggest.2': 'Why did you reject the lithium-metal design?',
  'chat.suggest.3': 'How would you approach a new battery problem?',
  'chat.suggest.4': 'What was your key discovery?',

  // toasts
  'toast.demo.loading': "Awakening Dr. Aryan Rao's preserved memory\u2026",
  'toast.demo.ready': 'Digital memory ready.',
  'toast.demo.fail': 'Failed to seed demo',
  'toast.loadFail': 'Failed to load',
  'toast.deleteFail': 'Failed to delete',
  'toast.extractFail': 'Extraction failed',
  'toast.clipEmpty': 'Clipboard is empty',
  'toast.clipPasted': 'Pasted from clipboard',
  'toast.clipDenied': 'Clipboard access denied',
  'toast.fileLoaded': 'Loaded {name} ({count} chars)',
  'toast.fileFail': 'Could not read file',

  // bottom nav
  'nav.home': 'Home',
  'nav.history': 'History',
  'nav.settings': 'Settings',
  'nav.profile': 'Profile',

  // splash
  'splash.tagline': 'A Digital Memory Layer for Humanity',
  'splash.loading': 'Awakening memories\u2026',

  // login
  'login.welcome': 'Welcome',
  'login.subtitle': 'Enter your name and age to begin preserving and conversing with human intelligence.',
  'login.name': 'Name',
  'login.namePh': 'Your name',
  'login.age': 'Age',
  'login.agePh': 'Your age',
  'login.submit': 'Enter ECHO',
  'login.submitting': 'Entering\u2026',
  'login.error': 'Please enter your name and a valid age.',
  'login.fail': 'Could not sign in. Please try again.',
  'login.privacy': 'Your details stay on this device. No password needed.',
  'login.brand': 'Preserving human intelligence beyond human lifespan.',

  // settings
  'settings.title': 'Settings',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.theme.dark': 'Dark',
  'settings.theme.light': 'Light',
  'settings.language': 'Language',
  'settings.account': 'Account',
  'settings.account.name': 'Name',
  'settings.account.age': 'Age',
  'settings.logout': 'Log out',
  'settings.logoutConfirm': 'Log out of ECHO?',
  'settings.logoutConfirmBody': 'You will return to the login screen. Your preserved memories stay safe.',
  'settings.logoutCancel': 'Cancel',
  'settings.about': 'About',
  'settings.about.body': 'ECHO preserves how humans thought — not just what they knew. Built so the reasoning of every scientist, doctor and teacher outlives them, queryable in their own voice.',
  'settings.about.version': 'Version',
  'settings.danger': 'Danger zone',
  'settings.clearLocal': 'Clear local data',
  'settings.clearLocalBody': 'Clears your login and language preference on this device. Preserved memories in the cloud are unaffected.',
  'settings.clearLocalConfirm': 'Clear',
  'settings.cleared': 'Local data cleared.',

  // history
  'history.title': 'Conversation history',
  'history.subtitle': 'Every question you have asked a preserved memory, across all conversations.',
  'history.empty.title': 'No conversations yet',
  'history.empty.body': 'Ask a preserved memory a question and it will appear here.',
  'history.empty.cta': 'Browse memories',
  'history.messages': 'messages',
  'history.continue': 'Continue',
  'history.loading': 'Loading history\u2026',
  'history.fail': 'Failed to load history',
}

// Hindi translations
const hi: Record<string, string> = {
  'nav.home': '\u0930\u0947\u0939\u0930\u0941\u092e',
  'nav.memories': '\u0930\u094b\u0925 \u0906\u0924\u094d\u092e',
  'nav.vision': '\u0926\u0943\u0937\u094d\u091f\u093f',
  'nav.theme.toggle': '\u0925\u0940\u092e \u091f\u0949\u0917\u0932',
  'nav.language': '\u092d\u093e\u0937\u093e',

  'footer.tagline': '\u0915\u0947 \u0935\u093f\u0938\u094d\u0924\u0943\u0924 \u0925\u0947 \u092e\u0928\u0941\u0937\u094d\u092f \u0915\u093e \u092a\u0930\u093f\u091a\u092f \u092f\u0926\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0924\u093e \u0939\u0948\u0964 \u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u0935\u0939 \u0930\u0916\u0924\u093e \u0939\u0948 \u091c\u094b \u092e\u0928\u0941\u0937\u094d\u092f \u0915\u0947 \u0935\u093f\u091a\u093e\u0930 \u0915\u0930\u0924\u0947 \u0925\u0947 \u2014 \u092e\u093e\u0928\u0935\u0924\u093e \u0915\u0947 \u0932\u093f\u090f \u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u092a\u0930\u0924.',
  'footer.built': '\u0906\u0928\u0947 \u0935\u093e\u0932\u0940 \u092a\u0940\u0922\u093c\u093f\u092f\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u2665 \u0938\u0947 \u092c\u0928\u093e\u092f\u093e \u0917\u092f\u093e\u0964',

  'landing.badge': '\u092e\u093e\u0928\u0935\u0924\u093e \u0915\u0947 \u0932\u093f\u090f \u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u092a\u0930\u0924',
  'landing.title1': '\u092e\u093e\u0928\u0935 \u092c\u0941\u0926\u094d\u0927\u093f \u0915\u093e \u0938\u0902\u0930\u0915\u094d\u0937\u0923',
  'landing.title2': '\u092e\u093e\u0928\u0935 \u0906\u092f\u0941 \u0938\u0947 \u092a\u0930\u0947\u0964',
  'landing.subtitle': '\u091c\u092c \u0915\u094b\u0908 \u092e\u0939\u093e\u0928 \u0935\u0948\u091c\u094d\u091e\u093e\u0928\u093f\u0915 \u092e\u093f\u0930 \u091c\u093e\u0924\u093e \u0939\u0948, \u0924\u094b \u0909\u0938\u0915\u093e \u0924\u0930\u094d\u0915 \u092d\u0940 \u0938\u093e\u0925 \u0932\u0947\u0924\u093e \u091a\u0932\u093e \u091c\u093e\u0924\u093e \u0939\u0948 \u2014 \u092a\u0924\u094d\u0930 \u092c\u091a \u091c\u093e\u0924\u0947 \u0939\u0948\u0902, \u092a\u0930 \u2018\u0915\u094d\u092f\u094b\u0902\u2019 \u0928\u0939\u0940\u0902\u0964 \u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u0915\u093f\u0938\u0940 \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0915\u0947 \u0932\u0947\u0916, \u0928\u094b\u091f\u094d\u0938 \u0914\u0930 \u0935\u093f\u092b\u0932\u0924\u093e\u0913\u0902 \u0915\u094b \u092f\u0915 \u091c\u0940\u0935\u0928\u094d\u0924 \u091c\u094d\u091e\u093e\u0928 \u0917\u094d\u0930\u093e\u092b \u092e\u0947\u0902 \u0915\u0924\u0930\u0924\u093e \u0939\u0948 \u091c\u093f\u0938\u0938\u0947 \u0906\u092a \u0939\u092e\u0947\u0936\u093e \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964',
  'landing.cta.demo': '\u0926\u0943\u0937\u094d\u091f\u093e\u0902\u0924 \u0930\u093e\u0935 \u0915\u0940 \u0938\u094d\u092e\u0943\u0924\u093f \u0926\u0947\u0916\u0947\u0902',
  'landing.cta.demoLoading': '\u091c\u093e\u0917 \u0930\u0939\u093e \u0939\u0948\u2026',
  'landing.cta.preserve': '\u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u092c\u0928\u093e\u090f\u0902',
  'landing.signup': '\u0915\u094b\u0908 \u0938\u093e\u0768\u0928-\u0905\u092a \u0928\u0939\u0940\u0902\u0964 \u0920\u094b\u0938 \u0930\u093e\u0935 \u0915\u0940 \u091c\u0940\u0935\u0928\u094d\u0924 \u0938\u094d\u092e\u0943\u0924\u093f \u0915\u093e \u0932\u093e\u0907\u0935 \u0921\u0947\u092e\u094b \u0906\u091c\u092e\u093e\u0907\u090f\u0964',

  'landing.stat.knowledge': '\u091c\u094d\u091e\u093e\u0928',
  'landing.stat.extracted': '\u0928\u093f\u0937\u094d\u0915\u0930\u094d\u0937\u093f\u0924',
  'landing.stat.reasoning': '\u0924\u0930\u094d\u0915',
  'landing.stat.preserved': '\u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924',
  'landing.stat.failures': '\u0935\u093f\u092b\u0932\u0924\u093e\u090f\u0902',
  'landing.stat.firstClass': '\u092a\u094d\u0930\u092e\u0941\u0916',
  'landing.stat.answers': '\u0909\u0924\u094d\u0924\u0930',
  'landing.stat.grounded': '\u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924',

  'landing.problem.label': '\u0938\u092e\u0938\u094d\u092f\u093e',
  'landing.problem.title1': '\u090f\u0915 \u0935\u0948\u091c\u094d\u091e\u093e\u0928\u093f\u0915 100 \u092a\u0924\u094d\u0930 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0930\u0924\u093e \u0939\u0948\u0964',
  'landing.problem.title2': '\u092b\u093f\u0930 \u092e\u093f\u0930 \u091c\u093e\u0924\u093e \u0939\u0948 \u2014 \u0914\u0930 \u0924\u0930\u094d\u0915 \u0932\u0941\u092a\u094d\u0924 \u0939\u094b \u091c\u093e\u0924\u093e \u0939\u0948\u0964',
  'landing.problem.body': '\u092e\u093e\u0928\u0935 \u091c\u094d\u091e\u093e\u0928 \u092a\u0924\u094d\u0930, \u0908\u092e\u0947\u0932, \u0928\u094b\u091f\u092c\u0941\u0915 \u0914\u0930 \u0915\u094b\u0921 \u092e\u0947\u0902 \u0935\u093f\u0916\u0930\u093f\u0924 \u0930\u0939\u0924\u093e \u0939\u0948\u0964 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0938\u0948\u0915\u0921\u093c\u094b\u0902 \u092e\u0943\u0924 \u0938\u093f\u0930\u094b\u0902 \u0915\u094b \u091b\u093f\u092a\u093e\u0924\u093e \u0939\u0948\u0964 \u092e\u0943\u0924\u094d\u092f\u0941 \u0915\u0947 \u092c\u093e\u0926, \u0915\u093f\u0938\u0940 \u0915\u094b \u0928\u0939\u0940\u0902 \u092a\u0924\u093e \u0915\u093f \u0915\u094b\u0908 \u0935\u093f\u0927\u093f \u0915\u094d\u092f\u094b\u0902 \u091a\u0941\u0928\u0940 \u0917\u0908, \u0915\u093f\u0928 \u0935\u093f\u092b\u0932\u0924\u093e\u0913\u0902 \u0928\u0947 \u0907\u0938\u0947 \u0906\u0915\u093e\u0930 \u0926\u093f\u092f\u093e, \u092f\u093e \u0915\u093f\u0928 \u0905\u0902\u0924\u0930\u094d\u0926\u0943\u0937\u094d\u091f\u093f \u0928\u0947 \u0938\u092b\u0932\u0924\u093e \u0915\u093e \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0915\u093f\u092f\u093e\u0964 \u092d\u0935\u093f\u0937\u094d\u092f \u0915\u0940 \u092a\u0940\u0922\u093c\u093f\u092f\u093e\u0901 \u090f\u0915 \u092d\u0940 \u092a\u094d\u0930\u0936\u094d\u0928 \u0928\u0939\u0940\u0902 \u092a\u0942\u091b \u0938\u0915\u0924\u0940\u0902\u0964',
  'landing.problem.1': '\u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0935\u093f\u092d\u093f\u0928\u094d\u0928 \u0930\u0942\u092a\u094b\u0902 \u092e\u0947\u0902 \u0935\u093f\u0916\u0930\u093f\u0924',
  'landing.problem.2': '\u0938\u0902\u0926\u0930\u094d\u092d \u0914\u0930 \u0928\u093f\u0930\u094d\u0923\u092f \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0932\u0941\u092a\u094d\u0924 \u0939\u094b \u091c\u093e\u0924\u0940 \u0939\u0948',
  'landing.problem.3': '\u0935\u093f\u092b\u0932\u0924\u093e\u090f\u0901 \u0915\u092d\u0940 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0928\u0939\u0940\u0902 \u0939\u094b\u0924\u0940\u0902',
  'landing.problem.4': '\u0906\u092a \u092e\u0943\u0924 \u0938\u0947 \u0915\u094b\u0908 \u092a\u094d\u0930\u0936\u094d\u0928 \u0928\u0939\u0940\u0902 \u092a\u0942\u091b \u0938\u0915\u0924\u0947',
  'landing.problem.survives': '\u0906\u091c \u0915\u094d\u092f\u093e \u092c\u091a\u0924\u093e \u0939\u0948',
  'landing.problem.theWhat': '\u0915\u094d\u092f\u093e',
  'landing.problem.theResult': '\u092a\u0930\u093f\u0923\u093e\u092e',
  'landing.problem.theHow': '\u0915\u0948\u0938\u0947',
  'landing.problem.theAnecdote': '\u0915\u093f\u0938\u094d\u0938\u093e',
  'landing.problem.whyGone': '\u092a\u0930 \u2018\u0915\u094d\u092f\u094b\u0902\u2019? \u0917\u093e\u092f\u092c\u0964',

  'landing.solution.label': '\u0938\u092e\u093e\u0927\u093e\u0928',
  'landing.solution.title': '\u092c\u093f\u0916\u0947\u0930\u0947 \u0932\u0947\u0916\u094b\u0902 \u0938\u0947 \u0932\u0947\u0915\u0930 \u090f\u0915 \u0910\u0938\u0947 \u092e\u0928 \u0924\u0915 \u091c\u093f\u0938\u0938\u0947 \u0906\u092a \u092c\u093e\u0924 \u0915\u0930 \u0938\u0915\u0947\u0902\u0964',
  'landing.solution.body': '\u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u0915\u093f\u0938\u0940 \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0915\u0947 \u092a\u0940\u091b\u0947 \u091b\u094b\u0921\u093c \u0917\u0908 \u0939\u0930 \u091a\u0940\u091c\u093c \u0915\u094b \u092a\u0922\u093c\u0924\u093e \u0939\u0948 \u0914\u0930 \u0909\u0938\u0947 \u090f\u0915 \u0938\u0902\u0930\u091a\u093f\u0924 \u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u092e\u0947\u0902 \u092c\u0941\u0928\u093e\u0924\u093e \u0939\u0948 \u2014 \u091c\u094d\u091e\u093e\u0928 \u0907\u0915\u093e\u0907\u092f\u093e\u0901, \u0924\u0930\u094d\u0915 \u0917\u094d\u0930\u093e\u092b, \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928, \u0914\u0930 \u0935\u093f\u091a\u093e\u0930-\u0936\u0948\u0932\u0940 \u092b\u093f\u0902\u0917\u0930\u092a\u094d\u0930\u093f\u0902\u091f\u0964 \u092b\u093f\u0930 \u092f\u0939 \u0909\u0928\u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u092e\u0947\u0902 \u092a\u094d\u0930\u0936\u094d\u0928\u094b\u0902 \u0915\u0947 \u0909\u0924\u094d\u0924\u0930 \u0926\u0947\u0924\u093e \u0939\u0948, \u0915\u0947\u0935\u0932 \u0909\u0938 \u0915\u0947 \u0906\u0927\u093e\u0930 \u092a\u0930 \u091c\u094b \u0909\u0928\u094d\u0939\u0947\u0902\u0902 \u0935\u093e\u0938\u094d\u0924\u0935 \u092e\u0947\u0902 \u0932\u093f\u0916\u093e\u0964',
  'landing.solution.1.title': '\u091c\u094d\u091e\u093e\u0928 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902',
  'landing.solution.1.desc': 'PDF, \u0928\u094b\u091f\u094d\u0938, \u092e\u093e\u0930\u094d\u0915\u0921\u093e\u0909\u0928, \u091f\u094d\u0930\u093e\u0902\u0938\u0915\u094d\u0930\u093f\u092a\u094d\u091f, \u0915\u094b\u0921\u0964 \u090f\u0915 \u0926\u093f\u092e\u093e\u0917 \u0915\u093e \u0915\u091a\u094d\u091a\u093e \u092a\u094d\u0930\u092d\u093e\u0935\u0964',
  'landing.solution.2.title': 'AI \u0928\u093f\u0937\u094d\u0915\u0930\u094d\u0937\u0923',
  'landing.solution.2.desc': '\u0924\u0925\u094d\u092f, \u0928\u093f\u0930\u094d\u0923\u092f, \u0916\u094b\u091c, \u0935\u093f\u092b\u0932\u0924\u093e\u090f\u0901 \u0914\u0930 \u0938\u093f\u0926\u094d\u0927\u093e\u0902\u0924 \u2014 \u0938\u0902\u0930\u091a\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f \u092e\u0947\u0902 \u0928\u093f\u0937\u094d\u0915\u0930\u094d\u0937\u093f\u0924\u0964',
  'landing.solution.3.title': '\u0930\u094b\u0925 \u0917\u094d\u0930\u093e\u092b',
  'landing.solution.3.desc': '\u0935\u093f\u091a\u093e\u0930, \u092a\u094d\u0930\u092f\u094b\u0917 \u0914\u0930 \u092a\u0930\u093f\u0923\u093e\u092e \u0915\u0948\u0938\u0947 \u091c\u0941\u0921\u093c\u0924\u0947 \u0914\u0930 \u090f\u0915-\u0926\u0942\u0938\u0930\u0947 \u0915\u094b \u092a\u094d\u0930\u092d\u093e\u0935\u093f\u0924 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902 \u2014 \u0915\u093e \u091c\u0940\u0935\u0928\u094d\u0924 \u0917\u094d\u0930\u093e\u092b\u0964',
  'landing.solution.4.title': '\u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0947 \u092a\u0942\u091b\u0947\u0902',
  'landing.solution.4.desc': '\u0909\u0928\u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u092e\u0947\u0902 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0915\u0930\u0947\u0902\u0964 \u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924 \u0909\u0924\u094d\u0924\u0930, \u0938\u091f\u0940\u0915 \u0938\u094d\u092e\u0943\u0924\u093f \u0915\u093e \u0938\u0902\u0926\u0930\u094d\u092d \u0926\u0947\u0924\u0947 \u0939\u0941\u090f\u0964',

  'landing.features.label': '\u092e\u0941\u0916\u094d\u092f \u0915\u094d\u0937\u092e\u0924\u093e\u090f\u0901',
  'landing.features.title': '\u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u092e\u0928 \u0915\u0940 \u091b\u0939 \u092a\u0930\u0924\u0947\u0902\u0964',
  'landing.features.1.title': '\u091c\u094d\u091e\u093e\u0928 \u0905\u092a\u0932\u094b\u0921',
  'landing.features.1.desc': 'PDF, TXT, \u092e\u093e\u0930\u094d\u0915\u0921\u093e\u0909\u0928 \u0914\u0930 \u091f\u094d\u0930\u093e\u0902\u0938\u0915\u094d\u0930\u093f\u092a\u094d\u091f \u0936\u093e\u092e\u093f\u0932 \u0915\u0930\u0947\u0902\u0964 \u0939\u0930 \u0932\u0947\u0916 \u0938\u094d\u092e\u0943\u0924\u093f \u092e\u0947\u0902 \u090f\u0915 \u0938\u094d\u0930\u094b\u0924 \u0928\u094b\u0921 \u092c\u0928\u0924\u093e \u0939\u0948\u0964',
  'landing.features.2.title': 'AI \u091c\u094d\u091e\u093e\u0928 \u0928\u093f\u0937\u094d\u0915\u0930\u094d\u0937\u0923',
  'landing.features.2.desc': '\u0924\u0925\u094d\u092f, \u0916\u094d\u092f\u093e\u0932, \u0938\u0902\u092c\u0902\u0927, \u0928\u093f\u0930\u094d\u0923\u092f \u0914\u0930 \u091c\u0940\u0935\u0928 \u0915\u0947 \u0915\u093e\u0930\u094d\u092f \u0915\u0940 \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928 \u0928\u093f\u0915\u093e\u0932\u0924\u093e \u0939\u0948\u0964',
  'landing.features.3.title': '\u0930\u094b\u0925 \u0917\u094d\u0930\u093e\u092b',
  'landing.features.3.desc': '\u0935\u094d\u092f\u0915\u094d\u0924\u093f \u2192 \u0936\u094b\u0927 \u2192 \u0916\u094b\u091c \u2192 \u0928\u093f\u0930\u094d\u0923\u092f \u2192 \u092a\u094d\u0930\u092d\u093e\u0935\u0964 \u0924\u0930\u094d\u0915 \u0915\u0940 \u0938\u094d\u0925\u093f\u0930\u0924\u093f \u092a\u0930 \u0928\u0947\u0935\u093f\u0917\u0947\u091f \u0915\u0930\u0947\u0902\u0964',
  'landing.features.4.title': '\u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0947 \u092a\u0942\u091b\u0947\u0902',
  'landing.features.4.desc': '\u201C\u0924\u0941\u092e\u0928\u0947 \u0932\u093f\u0925\u093f\u092f\u092e \u0921\u093f\u091c\u093e\u0907\u0928 \u0915\u094d\u092f\u094b\u0902 \u0905\u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0915\u093f\u092f\u093e?\u201D \u2014 2028 \u0915\u0947 \u0928\u094b\u091f\u094d\u0938 \u0938\u0947, \u0909\u0928\u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u092e\u0947\u0902\u0964',
  'landing.features.5.title': '\u0935\u093f\u091a\u093e\u0930 \u0936\u0948\u0932\u0940 \u092e\u0949\u0921\u0932',
  'landing.features.5.desc': '\u0932\u0947\u0916\u0928 \u0906\u0935\u093e\u091c\u093c, \u0938\u092e\u0938\u094d\u092f\u093e-\u0938\u092e\u093e\u0927\u093e\u0928 \u0926\u0943\u0937\u094d\u091f\u093f\u0915\u094b\u0923 \u0914\u0930 \u092a\u0938\u0902\u0926 \u0938\u0940\u0916\u0924\u093e \u0939\u0948 \u0924\u093e\u0915\u093f \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0915\u094b \u0905\u092d\u093f\u0928\u0940\u0924 \u0915\u0930 \u0938\u0915\u0947\u0964',
  'landing.features.6.title': '\u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928 \u0938\u094d\u092e\u0943\u0924\u093f',
  'landing.features.6.desc': '\u0939\u0930 \u092a\u094d\u0930\u092f\u094b\u0917, \u0935\u093f\u092b\u0932\u0924\u093e, \u0916\u094b\u091c \u0914\u0930 \u092a\u094d\u0930\u0915\u093e\u0936\u0928 \u0935\u0930\u094d\u0937\u094b\u0902 \u092e\u0947\u0902 \u0926\u0930\u094d\u0936\u093e\u092f\u093e \u0917\u092f\u093e\u0964',

  'landing.moonshot.label': '\u092f\u0939 \u092e\u0942\u0928\u0936\u0949\u091f \u0915\u094d\u092f\u094b\u0902 \u0939\u0948',
  'landing.moonshot.title1': '\u0935\u0930\u094d\u0924\u092e\u093e\u0928 AI \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0938\u0902\u0917\u094d\u0930\u0939\u0940\u0924 \u0915\u0930\u0924\u093e \u0939\u0948\u0964',
  'landing.moonshot.title2': '\u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u092e\u0928\u0941\u0937\u094d\u092f \u0915\u0947 \u0935\u093f\u091a\u093e\u0930 \u0930\u0916\u0924\u093e \u0939\u0948\u0964',
  'landing.moonshot.body': '\u0915\u0932\u094d\u092a\u0928\u093e \u0915\u0930\u0947\u0902 \u2014 \u090f\u0915 \u0906\u0907\u0902\u0938\u094d\u091f\u093e\u0907\u0928 \u0938\u094d\u092e\u0943\u0924\u093f\u0964 \u090f\u0915 \u0928\u094d\u092f\u0942\u091f\u0928 \u0938\u094d\u092e\u0943\u0924\u093f\u0964 \u0939\u0930 \u0909\u0938 \u0935\u0948\u091c\u094d\u091e\u093e\u0928\u093f\u0915, \u0921\u0949\u0915\u094d\u091f\u0930, \u0907\u0902\u091c\u0940\u0928\u093f\u092f\u0930 \u0914\u0930 \u0936\u093f\u0915\u094d\u0937\u0915 \u0915\u0940 \u0938\u094d\u092e\u0943\u0924\u093f \u091c\u093f\u0928\u094d\u0939\u094b\u0902\u0928\u0947 \u0939\u092e\u093e\u0930\u0940 \u0926\u0941\u0928\u093f\u092f\u093e \u0915\u094b \u0906\u0915\u093e\u0930 \u0926\u093f\u092f\u093e \u2014 \u0915\u093f\u0938\u0940 \u092d\u0940 \u0926\u094d\u0935\u093e\u0930\u093e, \u0909\u0928\u0915\u0940 \u0905\u092a\u0928\u0940 \u0906\u0935\u093e\u091c\u093c \u092e\u0947\u0902, \u092a\u0942\u091b\u0940 \u091c\u093e \u0938\u0915\u0924\u0940 \u0939\u0948\u0964 \u090f\u0915 \u0938\u093e\u092e\u0942\u0939\u093f\u0915 \u092c\u0941\u0926\u094d\u0927\u093f \u0938\u0902\u091c\u093e\u0932, \u090f\u0915-\u0926\u0947\u0930 \u0938\u094d\u0925\u093e\u092a\u093f\u0924 \u092e\u0928 \u0938\u0947 \u092c\u0928\u0924\u093e \u0939\u0948\u0964',
  'landing.moonshot.quote': '\u201C\u092a\u0941\u0938\u094d\u0924\u0915\u094b\u0902 \u0928\u0947 \u092e\u0928\u0941\u0937\u094d\u092f \u0915\u093e \u091c\u094d\u091e\u093e\u0928 \u0938\u0901\u091a\u093e \u0925\u093e\u0964 \u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u0935\u0939 \u0930\u0916\u0924\u093e \u0939\u0948 \u091c\u094b \u092e\u0928\u0941\u0937\u094d\u092f \u0935\u093f\u091a\u093e\u0930 \u0915\u0930\u0924\u0947 \u0925\u0947\u0964\u201D',
  'landing.moonshot.pitch': '\u2014 \u092a\u093f\u091a',
  'landing.moonshot.cta': '\u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u092e\u0928 \u0938\u0947 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0915\u0930\u0947\u0902',

  'profiles.title': '\u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901',
  'profiles.subtitle': '\u0939\u0930 \u0938\u094d\u092e\u0943\u0924\u093f \u0915\u093f\u0938\u0940 \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0915\u093e \u091c\u094d\u091e\u093e\u0928, \u0924\u0930\u094d\u0915 \u0914\u0930 \u0905\u0928\u0941\u092d\u0935 \u0939\u0948 \u2014 \u090f\u0915 \u0910\u0938\u0947 \u092e\u0928 \u092e\u0947\u0902 \u0915\u0924\u0930 \u091c\u094b \u0938\u0947 \u0906\u092a \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964',
  'profiles.loadDemo': '\u0921\u0947\u092e\u094b \u0932\u094b\u0921 \u0915\u0930\u0947\u0902',
  'profiles.create': '\u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u092c\u0928\u093e\u090f\u0902',
  'profiles.loading': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u0940\u2026',
  'profiles.empty.title': '\u0905\u092d\u0940 \u0915\u094b\u0908 \u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0928\u0939\u0940\u0902',
  'profiles.empty.body': '\u0915\u093f\u0938\u0940 \u0915\u0947 \u0932\u0947\u0916\u094b\u0902 \u0938\u0947 \u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u092c\u0928\u093e\u090f\u0902, \u092f\u093e \u0920\u094b\u0938 \u0930\u093e\u0935 \u0915\u093e \u0932\u093e\u0907\u0935 \u0921\u0947\u092e\u094b \u0932\u094b\u0921 \u0915\u0930\u0947\u0902 \u2014 \u090f\u0915 \u0920\u094b\u0938-\u0905\u0935\u0938\u094d\u0925\u093e \u092c\u0948\u091f\u0930\u0940 \u0935\u0948\u091c\u094d\u091e\u093e\u0928\u093f\u0915 \u091c\u093f\u0928\u0915\u093e \u0924\u0930\u094d\u0915 \u092f\u0939\u093e\u0901 \u091c\u0940\u0935\u093f\u0924 \u0939\u0948\u0964',
  'profiles.empty.loadDemo': '\u0920\u094b\u0938 \u0930\u093e\u0935 \u0921\u0947\u092e\u094b \u0932\u094b\u0921 \u0915\u0930\u0947\u0902',
  'profiles.card.converse': '\u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0947 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a',
  'profiles.card.docs': '\u2611\u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c\u093c',
  'profiles.card.memories': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901',
  'profiles.card.events': '\u0918\u091f\u0928\u093e\u090f\u0901',
  'profiles.delete.title': '\u092f\u0939 \u0938\u094d\u092e\u0943\u0924\u093f \u092e\u0941\u0915\u094d\u0924 \u0915\u0930\u0947\u0902?',
  'profiles.delete.body': '\u0907\u0938\u0938\u0947 {name} \u0915\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f, \u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c\u093c \u0914\u0930 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0938\u094d\u0925\u093e\u092f\u0940 \u0930\u0942\u092a \u0938\u0947 \u0939\u091f \u091c\u093e\u090f\u0901\u0917\u0947\u0964 \u0907\u0938\u0947 \u0935\u093e\u092a\u0938 \u0928\u0939\u0940\u0902 \u0932\u093e\u092f\u093e \u091c\u093e \u0938\u0915\u0924\u093e\u0964',
  'profiles.delete.confirm': '\u0938\u094d\u092e\u0943\u0924\u093f \u092e\u0941\u0915\u094d\u0924 \u0915\u0930\u0947\u0902',
  'profiles.delete.cancel': '\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902',
  'profiles.delete.success': '\u0938\u094d\u092e\u0943\u0924\u093f \u092e\u0941\u0915\u094d\u0924 \u0915\u0940 \u0917\u0908\u0964',

  'create.title': '\u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u092c\u0928\u093e\u090f\u0902',
  'create.subtitle': '\u092a\u0930\u093f\u092d\u093e\u0937\u093f\u0924 \u0915\u0930\u0947\u0902 \u0915\u093f \u0906\u092a \u0915\u093f\u0938\u0915\u093e \u092c\u0941\u0926\u094d\u0927\u093f \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902\u0964 \u0906\u092a \u0909\u0928\u0915\u093e \u091c\u094d\u091e\u093e\u0928 \u0905\u0917\u0932\u0947 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902\u0917\u0947\u0964',
  'create.name': '\u092a\u0942\u0930\u093e \u0928\u093e\u092e *',
  'create.name.ph': '\u0921\u0949. \u0906\u0930\u094d\u092f\u0928 \u0930\u093e\u0935',
  'create.titleField': '\u092a\u0926\u0935\u0940 *',
  'create.titleField.ph': '\u0920\u094b\u0938-\u0905\u0935\u0938\u094d\u0925\u093e \u092c\u0948\u091f\u0930\u0940 \u0935\u0948\u091c\u094d\u091e\u093e\u0928\u093f\u0915',
  'create.field': '\u0915\u094d\u0937\u0947\u0924\u094d\u0930 *',
  'create.field.ph': '\u0938\u093e\u092e\u0917\u094d\u0930\u0940 \u0935\u093f\u091c\u094d\u091e\u093e\u0928 \u090f\u0935\u0902 \u090a\u0930\u094d\u091c\u093e \u0938\u0902\u0917\u094d\u0930\u0939',
  'create.bio': '\u091c\u0940\u0935\u0928\u0940 *',
  'create.bio.ph': '\u090f\u0915 \u0932\u0918\u0941 \u091c\u0940\u0935\u0928\u0940 \u091c\u094b \u092c\u0924\u093e\u090f \u0915\u093f \u0935\u0947 \u0915\u094c\u0928 \u0925\u0947 \u0914\u0930 \u0905\u092a\u0928\u093e \u091c\u0940\u0935\u0928 \u0915\u093f\u0938\u0947 \u0938\u092e\u0930\u094d\u092a\u093f\u0924 \u0915\u093f\u092f\u093e\u0964',
  'create.birthYear': '\u091c\u0928\u094d\u092e \u0935\u0930\u094d\u0937',
  'create.deathYear': '\u092e\u0943\u0924\u094d\u092f\u0941 \u0935\u0930\u094d\u0937 (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)',
  'create.submit': '\u0930\u094b\u0925 \u0906\u0924\u094d\u092e \u092c\u0928\u093e\u090f\u0902',
  'creating': '\u092c\u0928\u093e \u0930\u0939\u093e \u0939\u0948\u2026',
  'create.success': '\u0938\u094d\u092e\u0943\u0924\u093f \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092c\u0928\u093e\u092f\u093e \u0917\u092f\u093e\u0964',
  'create.error': '\u0928\u093e\u092e, \u092a\u0926\u0935\u0940, \u0915\u094d\u0937\u0947\u0924\u094d\u0930 \u0914\u0930 \u091c\u0940\u0935\u0928\u0940 \u0906\u0935\u0936\u094d\u092f\u0915 \u0939\u0948\u0902\u0964',

  'profile.back': '\u0938\u092d\u0940 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901',
  'profile.tab.overview': '\u0935\u093f\u0935\u0930\u0923',
  'profile.tab.upload': '\u0905\u092a\u0932\u094b\u0921',
  'profile.tab.memories': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901',
  'profile.tab.graph': '\u0917\u094d\u0930\u093e\u092b',
  'profile.tab.timeline': '\u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928',
  'profile.tab.ask': '\u092a\u0942\u091b\u0947\u0902',
  'profile.stat.memories': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901',
  'profile.stat.documents': '\u2611\u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c\u093c',
  'profile.stat.events': '\u0918\u091f\u0928\u093e\u090f\u0901',
  'profile.loading': '\u0938\u094d\u092e\u0943\u0924\u093f \u091c\u093e\u0917 \u0930\u0939\u0940 \u0939\u0948\u2026',
  'profile.fingerprint': '\u0935\u093f\u091a\u093e\u0930 \u092b\u093f\u0902\u0917\u0930\u092a\u094d\u0930\u093f\u0902\u091f',

  'overview.featured': '\u092a\u094d\u0930\u092e\u0941\u0916 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901',
  'overview.all': '\u0938\u092d\u0940',
  'overview.graphTitle': '\u0930\u094b\u0925 \u0917\u094d\u0930\u093e\u092b',
  'overview.explore': '\u0926\u0947\u0916\u0947\u0902',
  'overview.askTitle': '\u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0947 \u092a\u0942\u091b\u0947\u0902',
  'overview.askBody': '{name} \u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u092e\u0947\u0902 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0915\u0930\u0947\u0902\u0964 \u0909\u0924\u094d\u0924\u0930 \u0915\u0947\u0935\u0932 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u094b\u0902 \u092a\u0930 \u0906\u0927\u093e\u0930\u093f\u0924 \u0939\u0948\u0902\u0964',
  'overview.askCta': '\u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902',
  'overview.recentTimeline': '\u0939\u093e\u0932 \u0915\u093e \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928',
  'overview.noMemories': '\u0905\u092d\u0940 \u0924\u0915 \u0915\u094b\u0908 \u0938\u094d\u092e\u0943\u0924\u093f \u0928\u0939\u0940\u0902 \u0928\u093f\u0915\u093e\u0932\u0940 \u0917\u0908\u0964',
  'overview.uploadKb': '\u091c\u094d\u091e\u093e\u0928 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902',
  'overview.noTimeline': '\u0905\u092d\u0940 \u0915\u094b\u0908 \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928 \u0928\u0939\u0940\u0902\u0964',
  'overview.fingerprint.writing': '\u0932\u0947\u0916\u0928 \u0906\u0935\u093e\u091c\u093c',
  'overview.fingerprint.solving': '\u0938\u092e\u0938\u094d\u092f\u093e \u0938\u092e\u093e\u0927\u093e\u0928',
  'overview.fingerprint.prefs': '\u092a\u0938\u0902\u0926',

  'upload.title': '\u091c\u094d\u091e\u093e\u0928 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902',
  'upload.subtitle': '{name} \u0915\u0947 \u0932\u0947\u0916, \u092a\u0924\u094d\u0930, \u0928\u094b\u091f\u094d\u0938 \u092f\u093e \u091f\u094d\u0930\u093e\u0902\u0938\u0915\u094d\u0930\u093f\u092a\u094d\u091f \u0921\u093e\u0932\u0947\u0902\u0964 AI \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u0928\u093f\u0915\u093e\u0932\u0947\u0917\u093e, \u0917\u094d\u0930\u093e\u092b \u092c\u0928\u093e\u090f\u0917\u093e \u0914\u0930 \u091f\u093e\u0907\u092e\u0932\u093e\u0907\u0928 \u092c\u0922\u093c\u093e\u090f\u0917\u093e\u0964',
  'upload.docTitle': '\u2611\u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c\u093c \u0936\u0940\u0930\u094d\u0937\u0915',
  'upload.docTitlePh': '\u0932\u0948\u092c \u0928\u094b\u091f\u092c\u0941\u0915 2025 \u2014 \u0925\u0930\u094d\u092e\u0932 \u0935\u093f\u092b\u0932\u0924\u093e \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923',
  'upload.sourceType': '\u0938\u094d\u0930\u094b\u0924 \u092a\u094d\u0930\u0915\u093e\u0930',
  'upload.content': '\u0935\u093f\u0937\u092f',
  'upload.contentPh': '\u092f\u0939\u093e\u0901 \u092a\u0924\u094d\u0930, \u0928\u094b\u091f\u092c\u0941\u0915, \u091c\u0930\u094d\u0928\u0932, \u091f\u094d\u0930\u093e\u0902\u0938\u0915\u094d\u0930\u093f\u092a\u094d\u091f \u092f\u093e \u0915\u094b\u0921 \u0921\u093e\u0932\u0947\u0902\u0964 \u0924\u0930\u094d\u0915 \u091c\u093f\u0924\u0928\u093e \u0938\u092e\u0943\u0926\u094d\u0927, \u0938\u094d\u092e\u0943\u0924\u093f \u0909\u0924\u0928\u0940 \u0938\u092e\u0943\u0926\u094d\u0927\u0964',
  'upload.paste': '\u092a\u0947\u0938\u094d\u091f',
  'upload.openFile': '\u092b\u093e\u0907\u0932 \u0916\u094b\u0932\u0947\u0902',
  'upload.preserve': '\u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0928\u093f\u0915\u093e\u0932\u0947\u0902',
  'upload.distilling': '\u091c\u094d\u091e\u093e\u0928 \u0928\u093f\u0915\u093e\u0932 \u0930\u0939\u093e \u0939\u0948\u2026',
  'upload.preserving': '\u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930 \u0930\u0939\u093e \u0939\u0948\u2026',
  'upload.extractingToast': 'AI \u0938\u0947 \u091c\u094d\u091e\u093e\u0928 \u0928\u093f\u0915\u093e\u0932 \u0930\u0939\u093e \u0939\u0948\u2026',
  'upload.success': '{memories} \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901, {timeline} \u0918\u091f\u0928\u093e\u090f\u0901, {nodes} \u0917\u094d\u0930\u093e\u092b \u0928\u094b\u0921 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924\u0964',
  'upload.error': '\u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0936\u0940\u0930\u094d\u0937\u0915 \u0914\u0930 \u0915\u0941\u091b \u0935\u093f\u0937\u092f \u091c\u094b\u0921\u093c\u0947\u0902\u0964',
  'upload.whatExtracts': 'AI \u0915\u094d\u092f\u093e \u0928\u093f\u0915\u093e\u0932\u0924\u093e \u0939\u0948',
  'upload.sourceDocs': '\u0938\u094d\u0930\u094b\u0924 \u2611\u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c\u093c',
  'upload.noDocs': '\u0905\u092d\u0940 \u0924\u0915 \u0915\u094b\u0908 \u2611\u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c\u093c \u0905\u092a\u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964',
  'upload.source.pdf': 'PDF',
  'upload.source.txt': '\u091f\u0947\u0915\u094d\u0938\u094d\u091f',
  'upload.source.md': '\u092e\u093e\u0930\u094d\u0915\u0921\u093e\u0909\u0928',
  'upload.source.audio': '\u0911\u0921\u093f\u092f\u094b \u091f\u094d\u0930\u093e\u0902\u0938\u0915\u094d\u0930\u093f\u092a\u094d\u091f',
  'upload.source.note': '\u0928\u094b\u091f',

  'memories.title': '\u0928\u093f\u0915\u093e\u0932\u0940 \u0917\u0908 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901',
  'memories.subtitle': '\u0939\u0930 \u0915\u093e\u0930\u094d\u0921 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u091c\u094d\u091e\u093e\u0928 \u092f\u093e \u0924\u0930\u094d\u0915 \u0915\u093e \u0907\u0915\u093e\u0908 \u0939\u0948 \u2014 \u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u0915\u0947 \u092a\u0930\u092e\u093e\u0923\u0941\u0964',
  'memories.search': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u0916\u094b\u091c\u0947\u0902\u2026',
  'memories.all': '\u0938\u092d\u0940',
  'memories.loading': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u0940\u2026',
  'memories.empty': '\u0915\u094b\u0908 \u0938\u094d\u092e\u0943\u0924\u093f \u092e\u0947\u0932 \u0928\u0939\u0940\u0902 \u0916\u093e\u0924\u0940\u0964 \u0905\u0932\u0917 \u0916\u094b\u091c \u092f\u093e \u092a\u094d\u0930\u0915\u093e\u0930 \u0906\u091c\u092e\u093e\u0907\u090f\u0964',

  'graph.title': '\u091c\u094d\u091e\u093e\u0928 \u0917\u094d\u0930\u093e\u092b',
  'graph.subtitle': '{name} \u0915\u0947 \u0935\u093f\u091a\u093e\u0930, \u092a\u094d\u0930\u092f\u094b\u0917, \u0928\u093f\u0930\u094d\u0923\u092f \u0914\u0930 \u092a\u0930\u093f\u0923\u093e\u092e \u0915\u0948\u0938\u0947 \u091c\u0941\u0921\u093c\u0924\u0947 \u0939\u0948\u0902\u0964 \u0935\u093f\u0935\u0930\u0923 \u0915\u0947 \u0932\u093f\u090f \u0928\u094b\u0921 \u092a\u0930 \u0939\u094b\u0935\u0930 \u0915\u0930\u0947\u0902; \u0930\u093f\u0936\u094d\u0924\u093e \u0915\u0947 \u0932\u093f\u090f \u0915\u093f\u0928\u093e\u0930\u0947 \u092a\u0930\u0964',
  'graph.loading': '\u0917\u094d\u0930\u093e\u092b \u092c\u0928\u093e \u0930\u0939\u093e \u0939\u0948\u2026',

  'timeline.title': '\u092f\u093e\u0924\u094d\u0930\u093e',
  'timeline.subtitle': '\u092a\u094d\u0930\u092f\u094b\u0917, \u0916\u094b\u091c, \u0935\u093f\u092b\u0932\u0924\u093e\u090f\u0901, \u0928\u093f\u0930\u094d\u0923\u092f \u0914\u0930 \u092e\u0940\u0932\u0915\u0917\u0941\u0923 \u2014 {name} \u0915\u0947 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u093e\u0930\u094d\u092f \u0915\u093e \u0935\u0930\u094d\u0937\u094b\u0902 \u092e\u0947\u0902 \u0915\u094d\u0930\u092e\u0964',
  'timeline.loading': '\u092f\u093e\u0924\u094d\u0930\u093e \u091f\u094d\u0930\u0947\u0938 \u0939\u094b \u0930\u0939\u0940 \u0939\u0948\u2026',

  'chat.active': '\u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0915\u094d\u0930\u093f\u092f',
  'chat.you': '\u0906\u092a',
  'chat.clear': '\u0938\u093e\u092b\u093c \u0915\u0930\u0947\u0902',
  'chat.cleared': '\u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0938\u093e\u092b\u093c \u0939\u0941\u0908\u0964',
  'chat.placeholder': '{name} \u0938\u0947 \u0915\u0941\u091b \u092d\u0940 \u092a\u0942\u091b\u0947\u0902 \u2014 \u0909\u0928\u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u092e\u0947\u0902\u2026',
  'chat.disclaimer': '\u0909\u0924\u094d\u0924\u0930 \u0915\u0947\u0935\u0932 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u094b\u0902 \u092a\u0930 \u0906\u0927\u093e\u0930\u093f\u0924 \u0939\u0948\u0902\u0964',
  'chat.toSend': '\u092d\u0947\u091c\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f',
  'chat.grounded': '\u0906\u0927\u093e\u0930 \u092a\u0930:',
  'chat.loading': '\u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026',
  'chat.silent': '\u0938\u094d\u092e\u0943\u0924\u093f \u092e\u094c\u0928 \u0939\u094b \u0917\u0908\u0964',
  'chat.welcome.title': '{name} \u0915\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0947 \u092c\u093e\u0924 \u0915\u0930\u0947\u0902',
  'chat.welcome.body': '{field} \u092e\u0947\u0902 \u0909\u0928\u0915\u0947 \u0915\u093e\u0930\u094d\u092f \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u092a\u0942\u091b\u0947\u0902\u0964 \u092a\u094d\u0930\u0924\u093f\u0915\u094d\u0930\u093f\u092f\u093e\u090f\u0901 \u0909\u0938 \u0906\u0927\u093e\u0930 \u092a\u0930 \u0939\u0948\u0902 \u091c\u094b {name} \u0928\u0947 \u0935\u093e\u0938\u094d\u0924\u0935 \u092e\u0947\u0902 \u0932\u093f\u0916\u093e \u2014 \u0915\u0941\u091b \u092d\u0940 \u0917\u094d\u0930\u0939\u0923 \u0928\u0939\u0940\u0902 \u0915\u093f\u092f\u093e \u0917\u092f\u093e\u0964',
  'chat.suggest.1': '\u0906\u092a\u0915\u0940 \u0938\u092c\u0938\u0947 \u092c\u0921\u093c\u0940 \u0935\u093f\u092b\u0932\u0924\u093e \u0915\u094d\u092f\u093e \u0925\u0940?',
  'chat.suggest.2': '\u0906\u092a\u0928\u0947 \u0932\u093f\u0925\u093f\u092f\u092e-\u092e\u0947\u091f\u0932 \u0921\u093f\u091c\u093e\u0907\u0928 \u0915\u094b \u0915\u094d\u092f\u094b\u0902 \u0905\u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0915\u093f\u092f\u093e?',
  'chat.suggest.3': '\u0906\u092a \u0915\u094b\u0908 \u0928\u092f\u093e \u092c\u0948\u091f\u0930\u0940 \u0938\u092e\u0938\u094d\u092f\u093e \u0915\u0948\u0938\u0947 \u0939\u0932 \u0915\u0930\u0947\u0902\u0917\u0947?',
  'chat.suggest.4': '\u0906\u092a\u0915\u0940 \u092e\u0941\u0916\u094d\u092f \u0916\u094b\u091c \u0915\u094d\u092f\u093e \u0925\u0940?',

  'toast.demo.loading': '\u0920\u094b\u0938 \u0930\u093e\u0935 \u0915\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f \u091c\u093e\u0917 \u0930\u0939\u0940 \u0939\u0948\u2026',
  'toast.demo.ready': '\u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u0924\u0948\u092f\u093e\u0930\u0964',
  'toast.demo.fail': '\u0921\u0947\u092e\u094b \u0932\u094b\u0921 \u0915\u0930\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932',
  'toast.loadFail': '\u0932\u094b\u0921 \u0915\u0930\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932',
  'toast.deleteFail': '\u092e\u093f\u091f\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932',
  'toast.extractFail': '\u0928\u093f\u0937\u094d\u0915\u0930\u094d\u0937\u0923 \u0935\u093f\u092b\u0932',
  'toast.clipEmpty': '\u0915\u094d\u0932\u093f\u092a\u092c\u094b\u0930\u094d\u0921 \u0916\u093e\u0932\u0940 \u0939\u0948',
  'toast.clipPasted': '\u0915\u094d\u0932\u093f\u092a\u092c\u094b\u0930\u094d\u0921 \u0938\u0947 \u092a\u0947\u0938\u094d\u091f \u0915\u093f\u092f\u093e',
  'toast.clipDenied': '\u0915\u094d\u0932\u093f\u092a\u092c\u094b\u0930\u094d\u0921 \u092a\u0939\u0941\u0901\u091a \u0928\u093f\u0937\u0947\u0927',
  'toast.fileLoaded': '{name} \u0932\u094b\u0921 \u0939\u0941\u0906 ({count} \u0565\u0587\u0915\u094d\u0938)',
  'toast.fileFail': '\u092b\u093e\u0907\u0932 \u092a\u0922\u093c\u0940 \u0928\u0939\u0940\u0902 \u091c\u093e \u0938\u0915\u0940',

  'nav.home': '\u0939\u094b\u092e',
  'nav.history': '\u0907\u0924\u093f\u0939\u093e\u0938',
  'nav.settings': '\u0938\u0947\u091f\u093f\u0902\u0917',
  'nav.profile': '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932',

  'splash.tagline': '\u092e\u093e\u0928\u0935\u0924\u093e \u0915\u0947 \u0932\u093f\u090f \u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u094d\u092e\u0943\u0924\u093f \u092a\u0930\u0924',
  'splash.loading': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u091c\u093e\u0917 \u0930\u0939\u0940 \u0939\u0948\u0902\u2026',

  'login.welcome': '\u0938\u094d\u0935\u093e\u0917\u0924 \u0939\u0948',
  'login.subtitle': '\u092e\u093e\u0928\u0935 \u092c\u0941\u0926\u094d\u0927\u093f \u0915\u094b \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0928\u0947 \u0914\u0930 \u0909\u0938\u0938\u0947 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0905\u092a\u0928\u093e \u0928\u093e\u092e \u0914\u0930 \u0906\u092f\u0941 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964',
  'login.name': '\u0928\u093e\u092e',
  'login.namePh': '\u0906\u092a\u0915\u093e \u0928\u093e\u092e',
  'login.age': '\u0906\u092f\u0941',
  'login.agePh': '\u0906\u092a\u0915\u0940 \u0906\u092f\u0941',
  'login.submit': '\u092e\u094d\u0928\u0947\u092e\u094b\u0938\u093e\u0907\u0928\u0940 \u092e\u0947\u0902 \u092a\u094d\u0930\u0935\u0947\u0936 \u0915\u0930\u0947\u0902',
  'login.submitting': '\u092a\u094d\u0930\u0935\u0947\u0936 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026',
  'login.error': '\u0915\u0943\u092a\u092f\u093e \u0905\u092a\u0928\u093e \u0928\u093e\u092e \u0914\u0930 \u0938\u0939\u0940 \u0906\u092f\u0941 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964',
  'login.fail': '\u0938\u093e\u0907\u0928 \u0907\u0928 \u0928\u0939\u0940\u0902 \u0939\u0941\u0926\u093e\u0964 \u092a\u0941\u0928\u0903 \u092a\u094d\u0930\u092f\u093e\u0938 \u0915\u0930\u0947\u0902\u0964',
  'login.privacy': '\u0906\u092a\u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0907\u0938 \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u0939\u0940 \u0930\u0939\u0924\u0940 \u0939\u0948\u0964 \u0915\u094b\u0908 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0906\u0935\u0936\u094d\u092f\u0915 \u0928\u0939\u0940\u0902\u0964',
  'login.brand': '\u092e\u093e\u0928\u0935 \u092c\u0941\u0926\u094d\u0927\u093f \u0915\u093e \u0938\u0902\u0930\u0915\u094d\u0937\u0923 \u092e\u093e\u0928\u0935 \u0906\u092f\u0941 \u0938\u0947 \u092a\u0930\u0947\u0964',

  'settings.title': '\u0938\u0947\u091f\u093f\u0902\u0917',
  'settings.appearance': '\u0926\u0943\u0936\u094d\u092f',
  'settings.theme': '\u0925\u0940\u092e',
  'settings.theme.dark': '\u0921\u093e\u0930\u094d\u0915',
  'settings.theme.light': '\u0932\u093e\u0907\u091f',
  'settings.language': '\u092d\u093e\u0937\u093e',
  'settings.account': '\u0916\u093e\u0924\u093e',
  'settings.account.name': '\u0928\u093e\u092e',
  'settings.account.age': '\u0906\u092f\u0941',
  'settings.logout': '\u0932\u0949\u0917 \u0906\u0909\u091f',
  'settings.logoutConfirm': '\u092e\u094d\u0928\u0947\u092e\u094b\u0938\u093e\u0907\u0928\u0940 \u0938\u0947 \u0932\u0949\u0917 \u0906\u0909\u091f \u0915\u0930\u0947\u0902?',
  'settings.logoutConfirmBody': '\u0906\u092a \u0932\u0949\u0917\u093f\u0928 \u0938\u094d\u0915\u094d\u0930\u0940\u0928 \u092a\u0930 \u0932\u094c\u091f\u0947\u0902\u0917\u0947\u0964 \u0906\u092a\u0915\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0930\u0939\u0947\u0902\u0917\u0940\u0964',
  'settings.logoutCancel': '\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902',
  'settings.about': '\u092a\u0930\u093f\u091a\u092f',
  'settings.about.body': '\u092e\u094d\u0928\u0947\u092e\u094b\u0938\u093e\u0907\u0928\u0940 \u092f\u0939 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0924\u0940 \u0939\u0948 \u0915\u093f \u092e\u0928\u0941\u0937\u094d\u092f \u0915\u0948\u0938\u0947 \u0935\u093f\u091a\u093e\u0930 \u0915\u0930\u0924\u0947 \u0925\u0947 \u2014 \u0938\u093f\u0930\u094d\u092b \u092f\u0939 \u0928\u0939\u0940\u0902 \u0915\u093f \u0909\u0928\u094d\u0939\u0947\u0902\u0902 \u0915\u094d\u092f\u093e \u092a\u0924\u093e \u0925\u093e\u0964 \u0939\u0930 \u0935\u0948\u091c\u094d\u091e\u093e\u0928\u093f\u0915, \u0921\u0949\u0915\u094d\u091f\u0930 \u0914\u0930 \u0936\u093f\u0915\u094d\u0937\u0915 \u0915\u0940 \u0935\u093f\u091a\u093e\u0930-\u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0909\u0928\u0938\u0947 \u0906\u0917\u0947 \u091c\u0940\u0935\u093f\u0924 \u0930\u0939\u0947 \u2014 \u0909\u0928\u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u092e\u0947\u0902 \u092a\u0942\u091b\u0940 \u091c\u093e \u0938\u0915\u0924\u0940 \u0939\u0948\u0964',
  'settings.about.version': '\u0938\u0902\u0938\u094d\u0915\u0930\u0923',
  'settings.danger': '\u0916\u0924\u0930\u0928\u093e\u0915 \u0915\u094d\u0937\u0947\u0924\u094d\u0930',
  'settings.clearLocal': '\u0932\u094b\u0915\u0932 \u0921\u0947\u091f\u093e \u0938\u093e\u092b\u093c \u0915\u0930\u0947\u0902',
  'settings.clearLocalBody': '\u0907\u0938 \u0921\u093f\u0935\u093e\u0907\u0938 \u0938\u0947 \u0906\u092a\u0915\u093e \u0932\u0949\u0917\u093f\u0928 \u0914\u0930 \u092d\u093e\u0937\u093e \u092a\u094d\u0930\u093e\u0925\u092e\u094d\u092f\u0924\u093e \u0939\u091f\u093e \u0926\u0947\u0924\u093e \u0939\u0948\u0964 \u0915\u094d\u0932\u093e\u0909\u0921 \u092e\u0947\u0902 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u092a\u094d\u0930\u092d\u093e\u0935\u093f\u0924 \u0928\u0939\u0940\u0902 \u0939\u094b\u0902\u0917\u0940\u0964',
  'settings.clearLocalConfirm': '\u0938\u093e\u092b\u093c \u0915\u0930\u0947\u0902',
  'settings.cleared': '\u0932\u094b\u0915\u0932 \u0921\u0947\u091f\u093e \u0938\u093e\u092b\u093c \u0939\u0941\u0906\u0964',

  'history.title': '\u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0907\u0924\u093f\u0939\u093e\u0938',
  'history.subtitle': '\u0939\u0930 \u092a\u094d\u0930\u0936\u094d\u0928 \u091c\u094b \u0906\u092a\u0928\u0947 \u0915\u093f\u0938\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0947 \u092a\u0942\u091b\u093e \u0939\u0948, \u0938\u092d\u0940 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a\u094b\u0902 \u092e\u0947\u0902\u0964',
  'history.empty.title': '\u0905\u092d\u0940 \u0915\u094b\u0908 \u0935\u093e\u0930\u094d\u0924\u093e\u0932\u093e\u092a \u0928\u0939\u0940\u0902',
  'history.empty.body': '\u0915\u093f\u0938\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0938\u094d\u092e\u0943\u0924\u093f \u0938\u0947 \u092a\u094d\u0930\u0936\u094d\u0928 \u092a\u0942\u091b\u0947\u0902 \u0914\u0930 \u0935\u0939 \u092f\u0939\u093e\u0901 \u0926\u093f\u0916\u093e\u0908 \u0926\u0947\u0917\u093e\u0964',
  'history.empty.cta': '\u0938\u094d\u092e\u0943\u0924\u093f\u092f\u093e\u0901 \u0926\u0947\u0916\u0947\u0902',
  'history.messages': '\u0938\u0902\u0926\u0947\u0936',
  'history.continue': '\u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902',
  'history.loading': '\u0907\u0924\u093f\u0939\u093e\u0938 \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026',
  'history.fail': '\u0907\u0924\u093f\u0939\u093e\u0938 \u0932\u094b\u0921 \u0915\u0930\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932',
}

const dictionaries: Record<Lang, Record<string, string>> = { en, hi }

// ─────────────────────────────────────────────────────────────────────────────
// Context + provider
// ─────────────────────────────────────────────────────────────────────────────
interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

const STORAGE_KEY = 'echo-lang'

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR-safe: always render 'en' first (matches server), then sync from
  // localStorage after hydration to avoid any hydration mismatch.
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'hi' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, l)
  }

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let str = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return str
    },
    [lang],
  )

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
