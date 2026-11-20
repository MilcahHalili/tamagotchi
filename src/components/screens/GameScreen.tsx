import type { GameState } from '../../types/game'
import { formatAge, stageLabel } from '../../game/constants'
import { DeviceFrame } from '../DeviceFrame'
import { PetSprite } from '../PetSprite'
import { StatBar } from '../StatBar'
import { ActionPad } from '../ActionPad'
import { sfx } from '../../game/sound'

type Actions = {
  hatch: () => void
  feed: () => void
  sleep: () => void
  clean: () => void
  medicine: () => void
  toggleMute: () => void
  openHelp: () => void
  openReactGame: () => void
  openCatchGame: () => void
  skip: (ms: number) => void
}

type Props = {
  state: GameState
  actions: Actions
  devMode: boolean
  onShare: () => void
}

export function GameScreen({ state, actions, devMode, onShare }: Props) {
  const isEgg = state.stage === 'egg'

  return (
    <DeviceFrame
      lightsOff={state.lightsOff}
      topBar={
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <div>
            <p className="font-display text-[11px] leading-relaxed text-neon text-glow-neon sm:text-xs">
              {state.name}
            </p>
            <p className="font-pixel text-xl text-mute">
              {stageLabel(state.stage, state.adultForm)} · {formatAge(state.ageMs)}
            </p>
          </div>
          <div className="flex gap-1.5">
            <IconBtn label={state.muted ? 'Unmute' : 'Mute'} onClick={actions.toggleMute} />
            <IconBtn label="Help" onClick={actions.openHelp} />
            <IconBtn label="Share" onClick={onShare} />
          </div>
        </div>
      }
      footer={
        isEgg ? (
          <p className="text-center font-pixel text-lg text-neon/70">
            Tap the egg to hatch ({state.hatchProgress}/5)
          </p>
        ) : (
          <ActionPad
            lightsOff={state.lightsOff}
            isEgg={isEgg}
            isSick={state.isSick}
            poopCount={state.poopCount}
            onFeed={actions.feed}
            onSleep={actions.sleep}
            onClean={actions.clean}
            onMedicine={actions.medicine}
            onReact={actions.openReactGame}
            onCatch={actions.openCatchGame}
          />
        )
      }
    >
      <button
        type="button"
        className="relative mx-auto flex w-full flex-col items-center"
        onClick={() => {
          if (isEgg) actions.hatch()
        }}
        aria-label={isEgg ? 'Hatch egg' : undefined}
      >
        <PetSprite
          stage={state.stage}
          adultForm={state.adultForm}
          mood={state.mood}
          hatchProgress={state.hatchProgress}
        />
        {state.poopCount > 0 && !state.lightsOff && (
          <div className="absolute bottom-2 left-6 flex gap-1">
            {Array.from({ length: state.poopCount }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-3 w-3 rounded-sm bg-amber/90 shadow-[0_0_6px_rgba(255,176,32,0.6)]"
                title="Needs cleaning"
              />
            ))}
          </div>
        )}
        {state.isSick && (
          <span className="absolute top-2 right-4 font-pixel text-2xl text-sunset">+</span>
        )}
      </button>

      {!isEgg && (
        <div className="mt-2 space-y-2">
          <StatBar label="HUNGER" value={state.stats.hunger} />
          <StatBar label="ENERGY" value={state.stats.energy} accent="amber" />
          <StatBar label="FUN" value={state.stats.fun} />
          <StatBar label="HYGIENE" value={state.stats.hygiene} accent="amber" />
          <StatBar label="HEALTH" value={state.stats.health} />
        </div>
      )}

      {devMode && (
        <div className="mt-3 rounded-lg border border-dashed border-amber/40 bg-void/50 p-2">
          <p className="mb-1 font-pixel text-lg tracking-wide text-amber uppercase">
            Dev time skip
          </p>
          <div className="flex flex-wrap gap-1">
            {[
              ['+30m', 30 * 60_000],
              ['+2h', 2 * 3_600_000],
              ['+6h', 6 * 3_600_000],
              ['+12h', 12 * 3_600_000],
            ].map(([label, ms]) => (
              <button
                key={label as string}
                type="button"
                className="rounded border border-amber/30 px-2 py-1 font-pixel text-sm text-amber"
                onClick={() => {
                  sfx.click()
                  actions.skip(ms as number)
                }}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
      )}
    </DeviceFrame>
  )
}

function IconBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx.click()
        onClick()
      }}
      className="rounded-lg border border-neon/25 bg-steel/40 px-2 py-1 font-pixel text-base tracking-wide text-neon/80 uppercase hover:border-neon/50"
    >
      {label}
    </button>
  )
}
