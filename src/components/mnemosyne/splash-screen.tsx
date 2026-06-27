'use client'

import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function SplashScreen() {
  const { t } = useI18n()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-1/4 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[40vh] w-[40vh] rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-40" />

      {/* pulsing rings */}
      <div className="relative mb-8 grid place-items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-fuchsia-500/30"
            style={{ width: 120 + i * 56, height: 120 + i * 56 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
          />
        ))}
        <motion.span
          className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/25 to-emerald-500/25 ring-1 ring-fuchsia-500/40"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Brain className="h-10 w-10 text-fuchsia-500" />
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">ECHO</h1>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.3em] text-fuchsia-500/80">AI</p>
        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {t('splash.tagline')}
        </p>
      </motion.div>

      {/* loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex items-center gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-fuchsia-500"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground/60">
        {t('splash.loading')}
      </p>
    </div>
  )
}
