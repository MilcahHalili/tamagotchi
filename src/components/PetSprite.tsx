import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { AdultForm, LifeStage, PetMood } from '../types/game'

type Props = {
  stage: LifeStage
  adultForm: AdultForm | null
  mood: PetMood
  hatchProgress?: number
  className?: string
}

type Pixel = 0 | 1 | 2 | 3 | 4 | 5 | 6

const PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#3d5a45', // outline / muted body
  2: '#39ff14', // neon body
  3: '#9dff7a', // highlight
  4: '#ffb020', // amber accent
  5: '#ff7a18', // sunset
  6: '#d8ffe8', // eye / shine
}

/** 16×16 sprite grids — hand-authored, no external assets. */
const SPRITES: Record<string, Pixel[][]> = {
  egg: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,2,2,2,2,3,3,1,0,0,0],
    [0,0,1,3,3,2,2,4,4,2,2,3,3,1,0,0],
    [0,0,1,3,2,2,2,4,4,2,2,2,3,1,0,0],
    [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
    [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
    [0,0,1,3,2,2,2,2,2,2,2,2,3,1,0,0],
    [0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0],
    [0,0,0,1,3,3,2,2,2,2,3,3,1,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  baby_idle: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,6,1,2,2,1,6,2,1,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,2,1,2,2,1,2,2,1,0,0,0],
    [0,0,0,0,1,1,0,1,1,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  baby_eat: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,6,1,2,2,1,6,2,1,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,2,1,4,4,1,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,4,4,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,2,1,2,2,1,2,2,1,0,0,0],
    [0,0,0,0,1,1,0,1,1,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  teen_idle: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,6,1,2,2,1,6,2,1,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,1,1,1,1,2,2,2,2,1,1,1,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,2,2,2,2,4,4,2,2,2,2,2,1,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,0,1,1,0,1,2,2,1,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  adult_volt: [
    [0,0,0,4,0,0,1,1,1,1,0,0,4,0,0,0],
    [0,0,0,0,4,1,2,2,2,2,1,4,0,0,0,0],
    [0,0,0,0,1,2,3,2,2,3,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,6,1,2,2,1,6,2,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,1,2,2,2,1,1,1,1,2,2,2,1,0,0],
    [0,0,0,1,2,3,2,2,2,2,3,2,1,0,0,0],
    [0,1,1,1,1,2,2,2,2,2,2,1,1,1,1,0],
    [1,2,2,2,2,2,2,4,4,2,2,2,2,2,2,1],
    [1,2,3,2,2,2,4,4,4,4,2,2,2,3,2,1],
    [0,1,2,2,1,2,2,2,2,2,2,1,2,2,1,0],
    [0,0,1,1,0,1,2,2,2,2,1,0,1,1,0,0],
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,4,0,0,0,0,4,0,0,0,0,0],
  ],
  adult_ember: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,5,2,2,5,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,6,1,2,2,1,6,2,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,1,2,2,2,1,1,1,1,2,2,2,1,0,0],
    [0,0,0,1,2,2,2,5,5,2,2,2,1,0,0,0],
    [0,1,1,1,1,2,2,2,2,2,2,1,1,1,1,0],
    [1,2,2,2,2,2,2,5,5,2,2,2,2,2,2,1],
    [1,2,2,5,2,2,2,2,2,2,2,2,5,2,2,1],
    [0,1,2,2,1,2,2,2,2,2,2,1,2,2,1,0],
    [0,0,1,1,0,1,2,2,2,2,1,0,1,1,0,0],
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,5,0,0,0,0,5,0,0,0,0,0],
  ],
  adult_shade: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
    [0,0,0,1,2,6,1,2,2,1,6,2,1,0,0,0],
    [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
    [0,0,1,2,2,2,1,1,1,1,2,2,2,1,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,1,1,1,1,2,2,2,2,2,2,1,1,1,1,0],
    [1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1],
    [1,2,2,2,2,2,1,1,1,1,2,2,2,2,2,1],
    [0,1,2,2,1,2,2,2,2,2,2,1,2,2,1,0],
    [0,0,1,1,0,1,2,2,2,2,1,0,1,1,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
}

function withMood(base: Pixel[][], mood: PetMood): Pixel[][] {
  const grid = base.map((row) => [...row])
  if (mood === 'sleeping') {
    // Close eyes
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (grid[y][x] === 6) grid[y][x] = 1
      }
    }
  }
  if (mood === 'sick') {
    // Dim body + X eyes vibe
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (grid[y][x] === 2) grid[y][x] = 1
        if (grid[y][x] === 3) grid[y][x] = 2
        if (grid[y][x] === 6) grid[y][x] = 5
      }
    }
  }
  if (mood === 'dead') {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        // Keep a muted silhouette visible on the dark LCD
        if (grid[y][x] === 2 || grid[y][x] === 3) grid[y][x] = 1
        if (grid[y][x] === 6) grid[y][x] = 5
        if (grid[y][x] === 4) grid[y][x] = 5
      }
    }
  }
  if (mood === 'happy') {
    // Brighten accents
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (grid[y][x] === 2 && (x + y) % 5 === 0) grid[y][x] = 3
      }
    }
  }
  if (mood === 'playing') {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (grid[y][x] === 4) grid[y][x] = 5
      }
    }
  }
  return grid
}

function resolveKey(stage: LifeStage, adultForm: AdultForm | null, mood: PetMood): string {
  if (stage === 'egg') return 'egg'
  if (mood === 'eating' && stage === 'baby') return 'baby_eat'
  if (stage === 'baby') return 'baby_idle'
  if (stage === 'teen') return 'teen_idle'
  if (adultForm === 'volt') return 'adult_volt'
  if (adultForm === 'ember') return 'adult_ember'
  return 'adult_shade'
}

function PixelGrid({ grid, crack }: { grid: Pixel[][]; crack?: number }) {
  const size = 16
  const cells: ReactNode[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = PALETTE[grid[y][x]]
      if (crack && crack > 0 && grid[y][x] !== 0) {
        // Crack lines on egg
        if ((x === 7 && y >= 4 && y <= 10 && crack >= 2) || (y === 8 && x >= 5 && x <= 10 && crack >= 3)) {
          color = '#07090b'
        }
        if (crack >= 4 && ((x === 5 && y === 6) || (x === 10 && y === 7))) {
          color = '#07090b'
        }
      }
      if (color === 'transparent') continue
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={color}
          shapeRendering="crispEdges"
        />,
      )
    }
  }
  return (
    <svg viewBox="0 0 16 16" className="h-full w-full pixelated" aria-hidden>
      {cells}
    </svg>
  )
}

export function PetSprite({ stage, adultForm, mood, hatchProgress = 0, className = '' }: Props) {
  const key = resolveKey(stage, adultForm, mood)
  const base = SPRITES[key] ?? SPRITES.baby_idle
  const grid = withMood(base, mood)

  const bounce =
    mood === 'playing'
      ? { y: [0, -10, 0, -6, 0], transition: { repeat: Infinity, duration: 0.7 } }
      : mood === 'happy'
        ? { y: [0, -6, 0], transition: { repeat: Infinity, duration: 1.1 } }
        : mood === 'eating'
          ? { scale: [1, 1.06, 1], transition: { repeat: Infinity, duration: 0.45 } }
          : mood === 'sleeping'
            ? { y: [0, 2, 0], transition: { repeat: Infinity, duration: 2.4 } }
            : mood === 'sick'
              ? { x: [0, -2, 2, -1, 0], transition: { repeat: Infinity, duration: 0.8 } }
              : mood === 'dead'
                ? { opacity: 0.55, y: 4 }
                : { y: [0, -3, 0], transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' as const } }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        className="h-36 w-36 sm:h-44 sm:w-44"
        animate={bounce}
        style={{
          filter:
            mood === 'sick'
              ? 'saturate(0.6) brightness(0.85)'
              : mood === 'happy' || mood === 'playing'
                ? 'drop-shadow(0 0 12px rgba(57,255,20,0.45))'
                : 'drop-shadow(0 0 8px rgba(57,255,20,0.25))',
        }}
      >
        <PixelGrid grid={grid} crack={stage === 'egg' ? hatchProgress : 0} />
      </motion.div>
      {mood === 'sleeping' && (
        <motion.span
          className="absolute right-6 top-4 font-pixel text-2xl text-amber"
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          z
        </motion.span>
      )}
    </div>
  )
}
