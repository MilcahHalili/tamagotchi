import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DeviceFrame } from '../DeviceFrame'
import { sfx } from '../../game/sound'

type Props = {
  onDone: (success: boolean) => void
}

type Phase = 'wait' | 'go' | 'result'

export function ReactionGame({ onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('wait')
  const [hits, setHits] = useState(0)
  const [round, setRound] = useState(0)
  const timer = useRef<number | null>(null)
  const startAt = useRef(0)
  const hitsRef = useRef(0)
  const roundRef = useRef(0)
  const onDoneRef = useRef(onDone)
  const advanceRef = useRef<(hit: boolean) => void>(() => {})
  const target = 3

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    let cancelled = false

    const queueRound = () => {
      if (cancelled) return
      setPhase('wait')
      const delay = 700 + Math.floor(Math.random() * 1600)
      timer.current = window.setTimeout(() => {
        if (cancelled) return
        setPhase('go')
        startAt.current = performance.now()
        sfx.gameHit()
        timer.current = window.setTimeout(() => {
          sfx.gameMiss()
          advanceRef.current(false)
        }, 900)
      }, delay)
    }

    advanceRef.current = (hit: boolean) => {
      if (cancelled) return
      if (timer.current) window.clearTimeout(timer.current)
      const nextHits = hitsRef.current + (hit ? 1 : 0)
      const nextRound = roundRef.current + 1
      hitsRef.current = nextHits
      roundRef.current = nextRound
      setHits(nextHits)
      setRound(nextRound)
      setPhase('result')
      if (nextRound >= target) {
        window.setTimeout(() => onDoneRef.current(nextHits >= 2), 500)
      } else {
        window.setTimeout(() => queueRound(), 450)
      }
    }

    queueRound()
    return () => {
      cancelled = true
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  function onTap() {
    if (phase === 'wait') {
      sfx.gameMiss()
      advanceRef.current(false)
      return
    }
    if (phase === 'go') {
      const ms = performance.now() - startAt.current
      if (ms <= 850) {
        sfx.gameHit()
        advanceRef.current(true)
      } else {
        sfx.gameMiss()
        advanceRef.current(false)
      }
    }
  }

  return (
    <DeviceFrame
      footer={
        <p className="text-center font-pixel text-lg text-mute">
          Round {Math.min(round + 1, target)}/{target} · Hits {hits}
        </p>
      }
    >
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <h2 className="font-display text-lg text-neon text-glow-neon">Reaction Pulse</h2>
        <p className="font-ui text-sm text-mute">Tap when the ring flashes neon.</p>
        <motion.button
          type="button"
          onClick={onTap}
          className={`flex h-40 w-40 items-center justify-center rounded-full border-4 font-display text-sm tracking-wider uppercase ${
            phase === 'go'
              ? 'border-neon bg-neon/20 text-neon box-glow-neon'
              : 'border-slate bg-steel/40 text-mute'
          }`}
          animate={phase === 'go' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ repeat: phase === 'go' ? Infinity : 0, duration: 0.4 }}
        >
          {phase === 'go' ? 'NOW' : phase === 'wait' ? 'Wait…' : '…'}
        </motion.button>
      </div>
    </DeviceFrame>
  )
}
