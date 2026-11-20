import { motion } from 'framer-motion'
import type { GameState } from '../../types/game'
import { careLabel, formatAge, stageLabel } from '../../game/constants'
import { DeviceFrame } from '../DeviceFrame'
import { PetSprite } from '../PetSprite'
import { sfx } from '../../game/sound'

type Props = {
  state: GameState
  onRestart: () => void
  onShare: () => void
}

export function MemorialScreen({ state, onRestart, onShare }: Props) {
  const avg = state.careSamples ? state.careScore / state.careSamples : 0

  return (
    <DeviceFrame
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              sfx.click()
              onShare()
            }}
            className="flex-1 rounded-xl border border-amber/40 bg-steel/60 px-3 py-2.5 font-pixel text-xl tracking-wide text-amber uppercase hover:box-glow-amber"
          >
            Memorial card
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.click()
              onRestart()
            }}
            className="flex-[2] rounded-xl border border-neon/50 bg-neon/15 px-3 py-2.5 font-pixel text-xl tracking-wide text-neon uppercase hover:box-glow-neon"
          >
            Restart
          </button>
        </div>
      }
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <motion.p
          className="font-pixel text-xl tracking-wide text-mute uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          In memoriam
        </motion.p>
        <PetSprite stage={state.stage === 'egg' ? 'baby' : state.stage} adultForm={state.adultForm} mood="dead" />
        <div>
          <h2 className="font-display text-base leading-relaxed text-amber text-glow-amber">{state.name}</h2>
          <p className="mt-2 font-pixel text-2xl text-mute">
            {stageLabel(state.stage, state.adultForm)} · {formatAge(state.ageMs)}
          </p>
          <p className="mt-2 font-pixel text-lg text-mute">
            Lost to {state.deathCause ?? 'neglect'}. Care rating: {careLabel(avg)}.
          </p>
        </div>
      </div>
    </DeviceFrame>
  )
}
