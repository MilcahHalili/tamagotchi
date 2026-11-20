import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  children: ReactNode
  lightsOff?: boolean
  topBar?: ReactNode
  footer?: ReactNode
}

export function DeviceFrame({ children, lightsOff = false, topBar, footer }: Props) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="pointer-events-none absolute -inset-8 rounded-[40%] opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(57,255,20,0.18), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(255,122,24,0.12), transparent 50%)',
        }}
      />
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-slate/80 bg-gradient-to-b from-panel via-charcoal to-void p-3 shadow-2xl sm:rounded-[2.5rem] sm:p-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          boxShadow:
            '0 0 0 1px rgba(57,255,20,0.12), 0 20px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="mb-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_10px_#39ff14]" />
            <span className="h-2 w-2 rounded-full bg-amber/80" />
            <span className="h-2 w-2 rounded-full bg-slate" />
          </div>
          <p className="font-pixel text-lg tracking-wide text-neon/70 uppercase">
            NEON GOTCHI
          </p>
          <div className="h-1.5 w-10 rounded-full bg-steel" />
        </div>

        {topBar}

        <div
          className={`relative overflow-hidden rounded-2xl border border-neon/20 ${
            lightsOff ? 'bg-[#040806]' : 'bg-lcd'
          }`}
        >
          <div
            className={`scanlines pointer-events-none absolute inset-0 z-10 opacity-40 ${
              lightsOff ? 'opacity-70' : ''
            }`}
          />
          {!lightsOff && (
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 30%, rgba(57,255,20,0.16), transparent 60%)',
              }}
            />
          )}
          <div className={`relative z-[1] min-h-[420px] p-4 sm:min-h-[460px] ${lightsOff ? 'brightness-[0.35]' : ''}`}>
            {children}
          </div>
        </div>

        {footer && <div className="mt-3">{footer}</div>}
      </motion.div>
    </div>
  )
}
