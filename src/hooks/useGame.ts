import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyFunBoost,
  clean,
  createNewGame,
  feed,
  giveMedicine,
  hatchTap,
  setMuteFlag,
  skipTime,
  tick,
  toggleSleep,
} from '../game/engine'
import { PLAY_MINIGAME_FUN } from '../game/constants'
import { clearGame, loadGame, saveGame } from '../game/storage'
import { setMuted, sfx } from '../game/sound'
import type { GameState, Screen } from '../types/game'

function readDevMode(): boolean {
  try {
    return new URLSearchParams(window.location.search).has('dev')
  } catch {
    return false
  }
}

export function useGame() {
  const [state, setState] = useState<GameState | null>(() => loadGame())
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = loadGame()
    if (!saved) return 'naming'
    if (saved.isDead) return 'memorial'
    return 'game'
  })
  const [devMode] = useState(readDevMode)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Persist + mute sync
  useEffect(() => {
    if (!state) return
    saveGame(state)
    setMuted(state.muted)
  }, [state])

  const petId = state && !state.isDead ? state.createdAt : null

  // Real-time tick loop + offline catch-up on visibility
  useEffect(() => {
    if (petId == null) return

    const run = () => {
      setState((prev) => {
        if (!prev || prev.isDead) return prev
        const next = tick(prev, Date.now())
        if (next.isDead && !prev.isDead) {
          sfx.death()
          setScreen('memorial')
        } else if (next.isSick && !prev.isSick) {
          sfx.sick()
        } else if (next.stage !== prev.stage && prev.stage !== 'egg') {
          sfx.evolve()
        } else if (next.poopCount > prev.poopCount) {
          sfx.poop()
        }
        return next
      })
    }

    run()
    const id = window.setInterval(run, 1000)
    const onVis = () => {
      if (document.visibilityState === 'visible') run()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [petId])

  const startNew = useCallback((name: string) => {
    const fresh = createNewGame(name)
    setMuted(fresh.muted)
    setState(fresh)
    setScreen('game')
    sfx.click()
  }, [])

  const restart = useCallback(() => {
    clearGame()
    setState(null)
    setScreen('naming')
  }, [])

  const withSfx = useCallback((fn: (s: GameState) => GameState, sound?: () => void) => {
    setState((prev) => {
      if (!prev) return prev
      const next = fn(prev)
      if (next !== prev && sound) sound()
      return next
    })
  }, [])

  const actions = {
    hatch: () =>
      withSfx((s) => {
        const next = hatchTap(s)
        if (next.stage === 'baby' && s.stage === 'egg') sfx.hatch()
        else sfx.click()
        return next
      }),
    feed: () => withSfx((s) => feed(s), () => sfx.feed()),
    sleep: () =>
      withSfx((s) => toggleSleep(s), () => sfx.sleep()),
    clean: () => withSfx((s) => clean(s), () => sfx.clean()),
    medicine: () => withSfx((s) => giveMedicine(s), () => sfx.medicine()),
    toggleMute: () => {
      setState((prev) => {
        if (!prev) return prev
        const muted = !prev.muted
        setMuted(muted)
        return setMuteFlag(prev, muted)
      })
    },
    openHelp: () => setScreen('help'),
    closeHelp: () => {
      const current = stateRef.current
      setScreen(current?.isDead ? 'memorial' : current ? 'game' : 'naming')
    },
    openReactGame: () => {
      if (!stateRef.current || stateRef.current.lightsOff || stateRef.current.stage === 'egg') return
      sfx.click()
      setScreen('minigame-react')
    },
    openCatchGame: () => {
      if (!stateRef.current || stateRef.current.lightsOff || stateRef.current.stage === 'egg') return
      sfx.click()
      setScreen('minigame-catch')
    },
    finishMinigame: (kind: 'react' | 'catch', success: boolean) => {
      const amount = success
        ? kind === 'react'
          ? PLAY_MINIGAME_FUN.react
          : PLAY_MINIGAME_FUN.catch
        : Math.floor((kind === 'react' ? PLAY_MINIGAME_FUN.react : PLAY_MINIGAME_FUN.catch) * 0.35)
      withSfx((s) => applyFunBoost(s, amount), () => (success ? sfx.gameWin() : sfx.happy()))
      setScreen('game')
    },
    skip: (ms: number) => {
      if (!devMode) return
      setState((prev) => {
        if (!prev) return prev
        sfx.click()
        const next = skipTime(prev, ms)
        if (next.isDead) setScreen('memorial')
        else if (next.stage !== prev.stage && prev.stage !== 'egg') sfx.evolve()
        return next
      })
    },
  }

  return {
    state,
    screen,
    setScreen,
    devMode,
    startNew,
    restart,
    actions,
  }
}
