'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Loader2, Sparkles, Check, FileUp, ClipboardPaste, FileText as FilePdf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Profile, type Document, SOURCE_LABELS } from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'

const SOURCE_TYPES = [
  { value: 'pdf', label: 'PDF', hint: 'Upload a .pdf file' },
  { value: 'txt', label: 'Text', hint: 'Plain text notes' },
  { value: 'md', label: 'Markdown', hint: '.md journals & logs' },
  { value: 'note', label: 'Note', hint: 'Freeform note' },
]

// Lazy-load pdfjs only when a PDF is actually selected (keeps the initial
// bundle small and avoids SSR issues).
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  // Use the CDN worker that matches the installed version — avoids webpack
  // worker bundling issues in Next.js.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ')
    pages.push(text)
  }
  return pages.join('\n\n')
}

export function UploadPanel({
  profile,
  onUploaded,
}: {
  profile: Profile
  onUploaded: () => void
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [sourceType, setSourceType] = useState('note')
  const [content, setContent] = useState('')
  const [docs, setDocs] = useState<Document[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [stage, setStage] = useState<'idle' | 'reading' | 'extracting' | 'persistence'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const firstName = profile.name.split(' ').slice(-1)[0]

  useEffect(() => {
    api.listDocuments(profile.id).then(({ documents }) => setDocs(documents)).catch(() => {})
  }, [profile.id])

  async function readFile(file: File) {
    const isPdf = /\.pdf$/i.test(file.name)
    if (isPdf) {
      // PDF: extract text via pdfjs
      setParsing(true)
      const tid = toast.loading('Parsing PDF…')
      try {
        const text = await extractPdfText(file)
        if (!text || text.trim().length < 10) {
          toast.error('Could not extract text from this PDF (it may be scanned images).', { id: tid })
          setParsing(false)
          return
        }
        const sliced = text.slice(0, 16000)
        setContent(sliced)
        if (!title) setTitle(file.name.replace(/\.pdf$/i, ''))
        setSourceType('pdf')
        toast.success(`Loaded ${file.name} (${sliced.length.toLocaleString()} chars from ${file.size.toLocaleString()} bytes)`, { id: tid })
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to parse PDF', { id: tid })
      } finally {
        setParsing(false)
      }
      return
    }
    // Text-based file: read directly
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      setContent(text.slice(0, 16000))
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
      setSourceType(guessType(file.name))
      toast.success(t('toast.fileLoaded', { name: file.name, count: text.length.toLocaleString() }))
    }
    reader.onerror = () => toast.error(t('toast.fileFail'))
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
      if (!text) return toast.error(t('toast.clipEmpty'))
      setContent(text.slice(0, 16000))
      toast.success(t('toast.clipPasted'))
    } catch {
      toast.error(t('toast.clipDenied'))
    }
  }

  async function submit() {
    if (!title.trim() || !content.trim()) {
      toast.error(t('upload.error'))
      return
    }
    setBusy(true)
    setStage('extracting')
    const tid = toast.loading(t('upload.extractingToast'))
    try {
      const { counts } = await api.uploadDocument({
        profileId: profile.id,
        title: title.trim(),
        sourceType,
        content,
      })
      toast.success(
        t('upload.success', { memories: counts.memories, timeline: counts.timeline, nodes: counts.nodes }),
        { id: tid },
      )
      setTitle('')
      setContent('')
      if (fileRef.current) fileRef.current.value = ''
      const { documents } = await api.listDocuments(profile.id)
      setDocs(documents)
      onUploaded()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('toast.extractFail'), { id: tid })
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
            <Upload className="h-4 w-4 text-emerald-500" />
            <h2 className="text-lg font-semibold">{t('upload.title')}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('upload.subtitle', { name: firstName })}
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t('upload.docTitle')}
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('upload.docTitlePh')}
                disabled={busy || parsing}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t('upload.sourceType')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SOURCE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSourceType(s.value)}
                    disabled={busy || parsing}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      sourceType === s.value
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                        : 'border-border/60 text-muted-foreground hover:border-emerald-500/30 hover:text-foreground'
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
                  {t('upload.content')}{' '}
                  <span className="tabular-nums text-muted-foreground/60">
                    ({content.length.toLocaleString()} / 16,000)
                  </span>
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={pasteFromClipboard}
                    disabled={busy || parsing}
                    className="h-7 gap-1 text-xs"
                  >
                    <ClipboardPaste className="h-3 w-3" /> {t('upload.paste')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy || parsing}
                    className="h-7 gap-1 text-xs"
                  >
                    {parsing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileUp className="h-3 w-3" />
                    )}{' '}
                    {t('upload.openFile')}
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.txt,.md,.markdown,.text,.csv,.json,.log"
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
                placeholder={t('upload.contentPh')}
                disabled={busy || parsing}
              />
              {parsing && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Extracting text from PDF…
                </p>
              )}
            </div>

            <Button
              onClick={submit}
              disabled={busy || parsing || !title.trim() || !content.trim()}
              className="w-full gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {stage === 'extracting' ? t('upload.distilling') : t('upload.preserving')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  {t('upload.preserve')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
          <CardContent className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-emerald-500" /> {t('upload.whatExtracts')}
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {[
                t('landing.features.2.title'),
                t('profile.fingerprint'),
                t('landing.stat.failures'),
                t('profile.tab.timeline'),
                t('profile.tab.graph'),
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
              <FileText className="h-4 w-4 text-emerald-500" /> {t('upload.sourceDocs')}
              <Badge variant="secondary" className="ml-auto">
                {docs?.length ?? 0}
              </Badge>
            </h3>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
              {docs === null ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : docs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  {t('upload.noDocs')}
                </p>
              ) : (
                docs.map((d) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/50 p-3"
                  >
                    {d.sourceType === 'pdf' ? (
                      <FilePdf className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    ) : (
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
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
