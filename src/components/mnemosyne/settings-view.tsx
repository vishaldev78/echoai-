'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sun, Moon, Globe, User, LogOut, Info, Trash2, Palette, ChevronRight,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const APP_VERSION = '1.0.0'

export function SettingsView() {
  const { user, logout } = useApp()
  const { t, lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  async function doLogout() {
    try {
      await api.logout()
    } catch {
      // ignore — logout is client-side
    }
    setConfirmLogout(false)
    logout()
    toast.success(lang === 'hi' ? 'लॉग आउट हो गया' : 'Logged out')
  }

  function doClearLocal() {
    window.localStorage.removeItem('mnemosyne-lang')
    window.localStorage.removeItem('mnemosyne-user')
    setConfirmClear(false)
    logout()
    toast.success(t('settings.cleared'))
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">{t('settings.title')}</h1>
      </motion.div>

      {/* Account card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="mt-6 overflow-hidden border-border/60">
          <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500" />
          <CardContent className="flex items-center gap-4 p-5">
            <Avatar className="h-14 w-14 ring-2 ring-amber-500/20">
              <AvatarFallback className="bg-gradient-to-br from-amber-500/25 to-emerald-500/25 font-semibold text-amber-600 dark:text-amber-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {user?.age} {lang === 'hi' ? 'वर्ष' : 'years'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <SectionTitle icon={Palette} label={t('settings.appearance')} />
      <Card className="border-border/60">
        <CardContent className="divide-y divide-border/50 p-0">
          {/* theme */}
          <Row
            icon={theme === 'dark' ? Moon : Sun}
            label={t('settings.theme')}
            value={theme === 'dark' ? t('settings.theme.dark') : t('settings.theme.light')}
            onClick={toggleTheme}
          />
          {/* language */}
          <Row
            icon={Globe}
            label={t('settings.language')}
            value={lang === 'hi' ? 'हिन्दी' : 'English'}
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          />
        </CardContent>
      </Card>

      {/* About */}
      <SectionTitle icon={Info} label={t('settings.about')} />
      <Card className="border-border/60">
        <CardContent className="p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{t('settings.about.body')}</p>
          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <span>{t('settings.about.version')}</span>
            <span className="font-mono">{APP_VERSION}</span>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <SectionTitle icon={Trash2} label={t('settings.danger')} />
      <Card className="border-border/60">
        <CardContent className="divide-y divide-border/50 p-0">
          <Row
            icon={Trash2}
            label={t('settings.clearLocal')}
            value=""
            onClick={() => setConfirmClear(true)}
            danger
          />
          <Row
            icon={LogOut}
            label={t('settings.logout')}
            value=""
            onClick={() => setConfirmLogout(true)}
            danger
          />
        </CardContent>
      </Card>

      <div className="h-6" />

      {/* logout confirm */}
      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.logoutConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.logoutConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('settings.logoutCancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={doLogout} className="bg-rose-600 text-white hover:bg-rose-700">
              {t('settings.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* clear local confirm */}
      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.clearLocal')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.clearLocalBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('settings.logoutCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={doClearLocal}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {t('settings.clearLocalConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SectionTitle({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="mb-2 mt-7 flex items-center gap-2 px-1">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: typeof User
  label: string
  value: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/40"
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          danger ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${danger ? 'text-rose-600 dark:text-rose-400' : ''}`}>
          {label}
        </span>
        {value && <span className="block text-xs text-muted-foreground">{value}</span>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
    </button>
  )
}
