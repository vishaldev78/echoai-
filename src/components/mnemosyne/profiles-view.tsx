'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Plus, Sparkles, Trash2, MessagesSquare, Network, FileText, Clock, ArrowRight, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { api, type Profile } from '@/lib/api'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'

export function ProfilesView() {
  const { openProfile } = useApp()
  const { t } = useI18n()
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<Profile | null>(null)
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { profiles } = await api.listProfiles()
      setProfiles(profiles)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('toast.loadFail'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function seedDemo() {
    const tid = toast.loading(t('toast.demo.loading'))
    try {
      const { profile } = await api.seed()
      toast.success(t('toast.demo.ready'), { id: tid })
      openProfile(profile.id, 'overview')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('toast.demo.fail'), { id: tid })
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await api.deleteProfile(toDelete.id)
      toast.success(t('profiles.delete.success'))
      setToDelete(null)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('toast.deleteFail'))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* header — compact on mobile */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('profiles.title')}</h1>
          <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{t('profiles.subtitle')}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={seedDemo} className="press gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">{t('profiles.loadDemo')}</span>
          </Button>
          <Button onClick={() => setCreating(true)} className="press gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('profiles.create')}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-20 flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('profiles.loading')}
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <EmptyState onSeed={seedDemo} onCreate={() => setCreating(true)} />
      ) : (
        <div className="mt-5 grid gap-3 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
            >
              <ProfileCard
                profile={p}
                onOpen={() => openProfile(p.id, 'overview')}
                onDelete={() => setToDelete(p)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* mobile FAB */}
      {!loading && profiles && profiles.length > 0 && (
        <button
          onClick={() => setCreating(true)}
          className="press fixed bottom-20 right-4 z-30 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/30 md:hidden"
          aria-label={t('profiles.create')}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* create-profile bottom sheet */}
      <CreateProfileSheet
        open={creating}
        onOpenChange={setCreating}
        onCreated={(p) => {
          setCreating(false)
          openProfile(p.id, 'overview')
        }}
      />

      {/* delete-confirm bottom sheet */}
      <Drawer open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-lg">{t('profiles.delete.title')}</DrawerTitle>
            <DrawerDescription>
              {t('profiles.delete.body', { name: toDelete?.name ?? '' })}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3 pb-safe">
            <Button
              variant="outline"
              className="press h-12 flex-1"
              onClick={() => setToDelete(null)}
            >
              {t('profiles.delete.cancel')}
            </Button>
            <Button
              className="press h-12 flex-1 gap-2 bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              {t('profiles.delete.confirm')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function ProfileCard({
  profile,
  onOpen,
  onDelete,
}: {
  profile: Profile
  onOpen: () => void
  onDelete: () => void
}) {
  const { t } = useI18n()
  const initials = profile.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const counts = profile._count
  return (
    <Card className="press-card group relative flex h-full flex-col overflow-hidden border-border/60 transition-colors hover:border-amber-500/40">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500/60 to-emerald-500/60" />
      <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 shrink-0 ring-2 ring-amber-500/20">
            <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-emerald-500/20 font-semibold text-amber-600 dark:text-amber-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold leading-tight">{profile.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{profile.title}</p>
          </div>
          <button
            onClick={onDelete}
            className="press rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            aria-label="Delete memory"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {profile.bio}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="font-medium">
            {profile.field}
          </Badge>
          {profile.birthYear && (
            <Badge variant="outline" className="font-mono text-xs">
              {profile.birthYear}
              {profile.deathYear ? `–${profile.deathYear}` : '–'}
            </Badge>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1 border-t border-border/60 pt-3 text-center">
          <Stat icon={FileText} value={counts?.documents ?? 0} label={t('profiles.card.docs')} />
          <Stat icon={Network} value={counts?.memories ?? 0} label={t('profiles.card.memories')} />
          <Stat icon={Clock} value={counts?.timelineEvents ?? 0} label={t('profiles.card.events')} />
        </div>

        <Button onClick={onOpen} className="press mt-4 w-full gap-2" variant="secondary">
          <MessagesSquare className="h-4 w-4" />
          {t('profiles.card.converse')}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

function Stat({ icon: Icon, value, label }: { icon: typeof FileText; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

function EmptyState({ onSeed, onCreate }: { onSeed: () => void; onCreate: () => void }) {
  const { t } = useI18n()
  return (
    <Card className="mt-6 border-dashed border-border/70">
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-emerald-500/15 ring-1 ring-amber-500/20">
          <Brain className="h-7 w-7 text-amber-500" />
        </span>
        <h3 className="mt-5 text-xl font-semibold">{t('profiles.empty.title')}</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{t('profiles.empty.body')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={onSeed} variant="outline" className="press gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {t('profiles.empty.loadDemo')}
          </Button>
          <Button onClick={onCreate} className="press gap-2">
            <Plus className="h-4 w-4" />
            {t('profiles.create')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateProfileSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (p: Profile) => void
}) {
  const { t } = useI18n()
  const [form, setForm] = useState({
    name: '',
    title: '',
    field: '',
    bio: '',
    birthYear: '',
    deathYear: '',
  })
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!form.name || !form.title || !form.field || !form.bio) {
      toast.error(t('create.error'))
      return
    }
    setSaving(true)
    try {
      const { profile } = await api.createProfile({
        name: form.name,
        title: form.title,
        field: form.field,
        bio: form.bio,
        birthYear: form.birthYear ? Number(form.birthYear) : undefined,
        deathYear: form.deathYear ? Number(form.deathYear) : undefined,
      })
      toast.success(t('create.success'))
      onCreated(profile)
      setForm({ name: '', title: '', field: '', bio: '', birthYear: '', deathYear: '' })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('toast.loadFail'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-lg font-semibold">{t('create.title')}</DrawerTitle>
          <DrawerDescription>{t('create.subtitle')}</DrawerDescription>
        </DrawerHeader>

        <div className="no-scrollbar max-h-[60vh] overflow-y-auto px-4 pb-2">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t('create.name')}>
                <input
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('create.name.ph')}
                />
              </Field>
              <Field label={t('create.titleField')}>
                <input
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t('create.titleField.ph')}
                />
              </Field>
            </div>
            <Field label={t('create.field')}>
              <input
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                value={form.field}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
                placeholder={t('create.field.ph')}
              />
            </Field>
            <Field label={t('create.bio')}>
              <textarea
                className="h-20 w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder={t('create.bio.ph')}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('create.birthYear')}>
                <input
                  type="number"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  value={form.birthYear}
                  onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                  placeholder="1990"
                />
              </Field>
              <Field label={t('create.deathYear')}>
                <input
                  type="number"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  value={form.deathYear}
                  onChange={(e) => setForm({ ...form, deathYear: e.target.value })}
                  placeholder="2033"
                />
              </Field>
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row gap-3 pb-safe">
          <Button
            variant="outline"
            className="press h-12 flex-1"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('profiles.delete.cancel')}
          </Button>
          <Button
            className="press h-12 flex-1 gap-2"
            onClick={submit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t('creating')}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> {t('create.submit')}
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
