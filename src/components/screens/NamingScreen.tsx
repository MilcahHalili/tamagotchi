import { useState } from 'react'
import { motion } from 'framer-motion'
import { DeviceFrame } from '../DeviceFrame'
import { PetSprite } from '../PetSprite'
import { sfx } from '../../game/sound'

type Props = {
  onStart: (name: string) => void
  onHelp: () => void
}

export function NamingScreen({ onStart, onHelp }: Props) {
  const [name, setName] = useState('')
  const valid = name.trim().length >= 1

  return (
    <DeviceFrame
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              sfx.click()
              onHelp()
            }}
            className="flex-1 rounded-xl border border-amber/40 bg-steel/60 px-3 py-2.5 font-display text-[11px] tracking-wider text-amber uppercase transition hover:box-glow-amber"
          >
            Help
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => valid && onStart(name.trim())}
            className="flex-[2] rounded-xl border border-neon/50 bg-neon/15 px-3 py-2.5 font-display text-[11px] tracking-wider text-neon uppercase transition enabled:hover:box-glow-neon disabled:cursor-not-allowed disabled:opacity-40"
          >
            Boot Device
          </button>
        </div>
      }
    >
      <div className="flex h-full flex-col items-center justify-between py-2">
        <div className="text-center">
          <motion.h1
            className="font-display text-2xl font-800 tracking-wide text-neon text-glow-neon sm:text-3xl"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            NEON GOTCHI
          </motion.h1>
          <p className="mt-2 font-ui text-sm text-mute">
            A night-lit companion for the long shift.
          </p>
        </div>

        <PetSprite stage="egg" adultForm={null} mood="idle" />

        <div className="w-full space-y-3">
          <label className="block font-pixel text-xl text-neon/80" htmlFor="pet-name">
            Name your unit
          </label>
          <input
            id="pet-name"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. VOLT"
            className="w-full rounded-xl border border-neon/30 bg-void/70 px-4 py-3 font-pixel text-2xl text-neon outline-none placeholder:text-mute/50 focus:border-neon focus:box-glow-neon"
            autoComplete="off"
            autoFocus
          />
          <p className="font-ui text-xs text-mute">Tap the egg after boot to hatch it.</p>
        </div>
      </div>
    </DeviceFrame>
  )
}
