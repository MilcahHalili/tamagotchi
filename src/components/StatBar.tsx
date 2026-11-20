import { motion } from 'framer-motion'

type Props = {
  label: string
  value: number
  accent?: 'neon' | 'amber'
}

export function StatBar({ label, value, accent = 'neon' }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  const critical = clamped <= 18
  const fill =
    accent === 'amber'
      ? critical
        ? 'bg-sunset'
        : 'bg-amber'
      : critical
        ? 'bg-sunset'
        : 'bg-neon'

  return (
    <div className="w-full">
      <div className="mb-0.5 flex items-baseline justify-between font-pixel text-xl leading-none text-neon/80">
        <span>{label}</span>
        <span className={critical ? 'text-sunset' : ''}>{Math.round(clamped)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-sm border border-neon/25 bg-void/60">
        <motion.div
          className={`h-full ${fill}`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{
            boxShadow: critical
              ? '0 0 8px rgba(255,122,24,0.55)'
              : accent === 'amber'
                ? '0 0 8px rgba(255,176,32,0.45)'
                : '0 0 8px rgba(57,255,20,0.45)',
          }}
        />
      </div>
    </div>
  )
}
