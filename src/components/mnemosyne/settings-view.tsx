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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { api } from '@/lib/api'
import { toast } from 'sonner'

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
    window.localStorage.removeItem('echo-lang')
    window.localStorage.removeItem('echo-user')
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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('settings.title')}</h1>

      {/* Account card */}
      <Card className="mt-5 overflow-hidden border-border/60">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500" />
        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
          <Avatar className="h-14 w-14 ring-2 ring-emerald-500/20">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500/25 to-emerald-500/25 font-semibold text-emerald-600 dark:text-emerald-300">
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

      {/* Appearance */}
      <SectionTitle icon={Palette} label={t('settings.appearance')} />
      <Card className="overflow-hidden border-border/60">
        <div className="divide-y divide-border/50">
          <Row
            icon={theme === 'dark' ? Moon : Sun}
            label={t('settings.theme')}
            value={theme === 'dark' ? t('settings.theme.dark') : t('settings.theme.light')}
            onClick={toggleTheme}
          />
          <Row
            icon={Globe}
            label={t('settings.language')}
            value={lang === 'hi' ? 'हिन्दी' : 'English'}
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          />
        </div>
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
      <Card className="overflow-hidden border-border/60">
        <div className="divide-y divide-border/50">
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
        </div>
      </Card>

      <div className="h-4" />

      {/* logout confirm bottom sheet */}
      <Drawer open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-lg">{t('settings.logoutConfirm')}</DrawerTitle>
            <DrawerDescription>{t('settings.logoutConfirmBody')}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3 pb-safe">
            <Button
              variant="outline"
              className="press h-12 flex-1"
              onClick={() => setConfirmLogout(false)}
            >
              {t('settings.logoutCancel')}
            </Button>
            <Button
              className="press h-12 flex-1 gap-2 bg-rose-600 text-white hover:bg-rose-700"
              onClick={doLogout}
            >
              <LogOut className="h-4 w-4" />
              {t('settings.logout')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* clear local confirm bottom sheet */}
      <Drawer open={confirmClear} onOpenChange={setConfirmClear}>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-lg">{t('settings.clearLocal')}</DrawerTitle>
            <DrawerDescription>{t('settings.clearLocalBody')}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3 pb-safe">
            <Button
              variant="outline"
              className="press h-12 flex-1"
              onClick={() => setConfirmClear(false)}
            >
              {t('settings.logoutCancel')}
            </Button>
            <Button
              className="press h-12 flex-1 gap-2 bg-rose-600 text-white hover:bg-rose-700"
              onClick={doClearLocal}
            >
              <Trash2 className="h-4 w-4" />
              {t('settings.clearLocalConfirm')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function SectionTitle({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="mb-2 mt-6 flex items-center gap-2 px-1">
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
      className="press flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-accent/60 sm:px-5 sm:py-4"
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          danger ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
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
