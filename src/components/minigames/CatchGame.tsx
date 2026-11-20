import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DeviceFrame } from '../DeviceFrame'
import { sfx } from '../../game/sound'

type Props = {
  onDone: (success: boolean) => void
}

type Orb = { id: number; x: number; y: number }

export function CatchGame({ onDone }: Props) {
  const [score, setScore] = useState(0)
  const [orbs, setOrbs] = useState<Orb[]>([])
  const [timeLeft, setTimeLeft] = useState(12)
  const goal = 6

  useEffect(() => {
    const spawn = window.setInterval(() => {
      setOrbs((prev) => {
        const next = prev.filter((o) => o.id > Date.now() - 2200)
        if (next.length >= 4) return next
        return [
          ...next,
          {
            id: Date.now() + Math.random(),
            x: 10 + Math.random() * 70,
            y: 15 + Math.random() * 55,
          },
        ]
      })
    }, 550)
    const clock = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(spawn)
          window.clearInterval(clock)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      window.clearInterval(spawn)
      window.clearInterval(clock)
    }
  }, [])

  useEffect(() => {
    if (timeLeft === 0) {
      const success = score >= goal
      window.setTimeout(() => onDone(success), 400)
    }
  }, [timeLeft, score, onDone])

  function catchOrb(id: number) {
    sfx.gameHit()
    setOrbs((prev) => prev.filter((o) => o.id !== id))
    setScore((s) => s + 1)
  }

  return (
    <DeviceFrame
      footer={
        <p className="text-center font-pixel text-lg text-mute">
          Score {score}/{goal} · {timeLeft}s
        </p>
      }
    >
      <div className="relative flex h-full min-h-[360px] flex-col">
        <h2 className="font-display text-lg text-amber text-glow-amber">Orb Catch</h2>
        <p className="mb-2 font-ui text-sm text-mute">Tap glowing orbs before they fade.</p>
        <div className="relative flex-1 overflow-hidden rounded-xl border border-neon/15 bg-void/40">
          {orbs.map((orb) => (
            <motion.button
              key={orb.id}
              type="button"
              className="absolute h-10 w-10 rounded-full border border-neon bg-neon/30 box-glow-neon"
              style={{ left: `${orb.x}%`, top: `${orb.y}%` }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => catchOrb(orb.id)}
              aria-label="Catch orb"
            />
          ))}
        </div>
      </div>
    </DeviceFrame>
  )
}
