'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Loader2, Sparkles, Check, FileUp, ClipboardPaste, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Profile, type Document, SOURCE_LABELS } from '@/lib/api'
import { toast } from 'sonner'

const SOURCE_TYPES = [
  { value: 'pdf', label: 'PDF (text)', hint: 'Paste extracted PDF text' },
  { value: 'txt', label: 'Text', hint: 'Plain text notes' },
  { value: 'md', label: 'Markdown', hint: '.md journals & logs' },
  { value: 'audio', label: 'Audio transcript', hint: 'Transcribed speech' },
  { value: 'note', label: 'Note', hint: 'Freeform note' },
]

export function UploadPanel({
  profile,
  onUploaded,
}: {
  profile: Profile
  onUploaded: () => void
}) {
  const [title, setTitle] = useState('')
  const [sourceType, setSourceType] = useState('note')
  const [content, setContent] = useState('')
  const [docs, setDocs] = useState<Document[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState<'idle' | 'reading' | 'extracting' | 'persistence'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const firstName = profile.name.split(' ').slice(-1)[0]

  useEffect(() => {
    api.listDocuments(profile.id).then(({ documents }) => setDocs(documents)).catch(() => {})
  }, [profile.id])

  function readFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      setContent(text.slice(0, 16000))
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
      setSourceType(guessType(file.name))
      toast.success(`Loaded ${file.name} (${text.length.toLocaleString()} chars)`)
    }
    reader.onerror = () => toast.error('Could not read file')
    reader.readAsText(file)
  }

  function guessType(name: string) {
    if (/\.pdf$/i.test(name)) return 'pdf'
    if (/\.md$/i.test(name)) return 'md'
    if (/\.txt$/i.test(name)) return 'txt'
    return sourceType
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return toast.error('Clipboard is empty')
      setContent(text.slice(0, 16000))
      toast.success('Pasted from clipboard')
    } catch {
      toast.error('Clipboard access denied')
    }
  }

  async function submit() {
    if (!title.trim() || !content.trim()) {
      toast.error('Add a title and some content to preserve.')
      return
    }
    setBusy(true)
    setStage('extracting')
    const t = toast.loading('Distilling knowledge with AI…')
    try {
      const { counts } = await api.uploadDocument({
        profileId: profile.id,
        title: title.trim(),
        sourceType,
        content,
      })
      toast.success(
        `Preserved ${counts.memories} memories, ${counts.timeline} events, ${counts.nodes} graph nodes.`,
        { id: t },
      )
      setTitle('')
      setContent('')
      if (fileRef.current) fileRef.current.value = ''
      const { documents } = await api.listDocuments(profile.id)
      setDocs(documents)
      onUploaded()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Extraction failed', { id: t })
    } finally {
      setBusy(false)
      setStage('idle')
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-semibold">Upload knowledge</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Feed {firstName}&apos;s writings, papers, notes or transcripts. The AI will extract
            memories, weave the graph and extend the timeline.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Document title
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lab Notebook 2025 — Thermal Failure Analysis"
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Source type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SOURCE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSourceType(s.value)}
                    disabled={busy}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      sourceType === s.value
                        ? 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300'
                        : 'border-border/60 text-muted-foreground hover:border-amber-500/30 hover:text-foreground'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Content{' '}
                  <span className="tabular-nums text-muted-foreground/60">
                    ({content.length.toLocaleString()} / 16,000 chars)
                  </span>
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={pasteFromClipboard}
                    disabled={busy}
                    className="h-7 gap-1 text-xs"
                  >
                    <ClipboardPaste className="h-3 w-3" /> Paste
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    className="h-7 gap-1 text-xs"
                  >
                    <FileUp className="h-3 w-3" /> Open file
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.md,.markdown,.text,.csv,.json,.log"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) readFile(f)
                    }}
                  />
                </div>
              </div>
              <textarea
                className="h-56 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-ring"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 16000))}
                placeholder="Paste a paper, notebook entry, journal, transcript or code here. The richer the reasoning, the richer the memory."
                disabled={busy}
              />
            </div>

            <Button
              onClick={submit}
              disabled={busy || !title.trim() || !content.trim()}
              className="w-full gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {stage === 'extracting' ? 'Distilling knowledge…' : 'Preserving…'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Preserve &amp; extract
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-amber-500/20 bg-amber-500/[0.03]">
          <CardContent className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-amber-500" /> What the AI extracts
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {[
                'Facts, concepts & principles',
                'Decisions and the reasoning behind them',
                'Discoveries and their root cause',
                'Failures — first-class citizens',
                'Timeline events with years',
                'Graph nodes & relationships',
                'Thinking-style fingerprint',
              ].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                  {x}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-amber-500" /> Source documents
              <Badge variant="secondary" className="ml-auto">
                {docs?.length ?? 0}
              </Badge>
            </h3>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
              {docs === null ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : docs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No documents uploaded yet.
                </p>
              ) : (
                docs.map((d) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/50 p-3"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{d.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {SOURCE_LABELS[d.sourceType] ?? d.sourceType} · {d.charCount.toLocaleString()} chars
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
