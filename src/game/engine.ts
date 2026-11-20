import type { AdultForm, GameState, LifeStage, PetMood, PetStats } from '../types/game'
import {
  ADULT_FORM_BY_CARE,
  CLEAN_GAIN,
  CRITICAL_THRESHOLD,
  DRAIN_PER_HOUR,
  FEED_GAIN,
  HATCH_CLICKS,
  MAX_POOP,
  MEDICINE_GAIN,
  POOP_HYGIENE_PENALTY,
  POOP_INTERVAL_MS,
  SICK_THRESHOLD,
  SLEEP_ENERGY_PER_HOUR,
  SLEEP_FUN_DRAIN_PER_HOUR,
  SLEEP_HUNGER_DRAIN_PER_HOUR,
  STAGE_AGE_MS,
  ACTION_DURATIONS,
} from './constants'

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n))

function careAverage(state: GameState): number {
  if (state.careSamples <= 0) return 50
  return state.careScore / state.careSamples
}

function pickAdultForm(avg: number): AdultForm {
  for (const entry of ADULT_FORM_BY_CARE) {
    if (avg >= entry.min) return entry.form
  }
  return 'shade'
}

function sampleCare(state: GameState): GameState {
  const { hunger, energy, fun, hygiene, health } = state.stats
  const sample = (hunger + energy + fun + hygiene + health) / 5
  return {
    ...state,
    careScore: state.careScore + sample,
    careSamples: state.careSamples + 1,
  }
}

function resolveStage(ageMs: number, current: LifeStage, adultForm: AdultForm | null, avg: number): {
  stage: LifeStage
  adultForm: AdultForm | null
  evolved: boolean
} {
  if (current === 'egg') return { stage: 'egg', adultForm, evolved: false }
  let stage: LifeStage = 'baby'
  if (ageMs >= STAGE_AGE_MS.adult) stage = 'adult'
  else if (ageMs >= STAGE_AGE_MS.teen) stage = 'teen'

  let nextForm = adultForm
  let evolved = stage !== current
  if (stage === 'adult' && !adultForm) {
    nextForm = pickAdultForm(avg)
    evolved = true
  }
  return { stage, adultForm: nextForm, evolved }
}

function applyOfflineAndTick(state: GameState, now: number): GameState {
  if (state.isDead) return { ...state, lastTickAt: now }

  const elapsed = Math.max(0, now - state.lastTickAt)
  if (elapsed < 250 && state.stage !== 'egg') {
    return state
  }

  let next: GameState = { ...state, stats: { ...state.stats }, lastTickAt: now }
  const hours = elapsed / 3_600_000

  if (next.stage !== 'egg') {
    next.ageMs += elapsed
  }

  if (next.lightsOff && next.stage !== 'egg') {
    next.stats.energy = clamp(next.stats.energy + SLEEP_ENERGY_PER_HOUR * hours)
    next.stats.hunger = clamp(next.stats.hunger - SLEEP_HUNGER_DRAIN_PER_HOUR * hours)
    next.stats.fun = clamp(next.stats.fun - SLEEP_FUN_DRAIN_PER_HOUR * hours)
    next.mood = 'sleeping'
  } else if (next.stage !== 'egg') {
    next.stats.hunger = clamp(next.stats.hunger - DRAIN_PER_HOUR.hunger * hours)
    next.stats.energy = clamp(next.stats.energy - DRAIN_PER_HOUR.energy * hours)
    next.stats.fun = clamp(next.stats.fun - DRAIN_PER_HOUR.fun * hours)
    next.stats.hygiene = clamp(next.stats.hygiene - DRAIN_PER_HOUR.hygiene * hours)

    // Poop events while awake
    let cursor = next.lastPoopAt
    while (cursor + POOP_INTERVAL_MS <= now && next.poopCount < MAX_POOP) {
      cursor += POOP_INTERVAL_MS
      next.poopCount += 1
      next.stats.hygiene = clamp(next.stats.hygiene - POOP_HYGIENE_PENALTY)
    }
    if (next.poopCount > 0) next.lastPoopAt = cursor
    else if (now - next.lastPoopAt > POOP_INTERVAL_MS) next.lastPoopAt = now
  }

  // Health pressure from neglect
  const criticalCount = (['hunger', 'energy', 'fun', 'hygiene'] as const).filter(
    (k) => next.stats[k] <= CRITICAL_THRESHOLD,
  ).length

  if (criticalCount >= 2 || next.stats.hygiene <= SICK_THRESHOLD || next.poopCount >= MAX_POOP) {
    if (!next.isSick) {
      next.isSick = true
      next.sickSince = now
    }
  } else if (next.isSick && next.stats.health > 55 && criticalCount === 0) {
    next.isSick = false
    next.sickSince = null
  }

  if (next.isSick) {
    next.stats.health = clamp(next.stats.health - 6 * hours)
  } else if (criticalCount >= 1) {
    next.stats.health = clamp(next.stats.health - 3 * hours * criticalCount)
  } else if (next.stats.health < 100) {
    next.stats.health = clamp(next.stats.health + 2 * hours)
  }

  // Death
  if (next.stats.health <= 0 || (criticalCount >= 3 && next.stats.health < 20)) {
    return killPet(next, now, criticalCause(next.stats, next.isSick))
  }

  // Evolution
  const avg = careAverage(next)
  const { stage, adultForm, evolved } = resolveStage(next.ageMs, next.stage, next.adultForm, avg)
  if (evolved) {
    next = sampleCare({ ...next, stage, adultForm, mood: 'happy', actionUntil: now + ACTION_DURATIONS.happy })
  } else {
    next.stage = stage
    next.adultForm = adultForm
  }

  // Mood resolution when not in a timed action
  if (now >= next.actionUntil) {
    next.mood = deriveMood(next)
  }

  return next
}

function criticalCause(stats: PetStats, sick: boolean): string {
  if (sick) return 'untreated sickness'
  const lows = (Object.entries(stats) as [keyof PetStats, number][])
    .filter(([k, v]) => k !== 'health' && v <= CRITICAL_THRESHOLD)
    .map(([k]) => k)
  if (lows.length) return `critical ${lows.join(', ')}`
  return 'neglect'
}

function deriveMood(state: GameState): PetMood {
  if (state.isDead) return 'dead'
  if (state.lightsOff) return 'sleeping'
  if (state.isSick) return 'sick'
  const { hunger, energy, fun, hygiene, health } = state.stats
  if (health > 85 && hunger > 70 && fun > 70 && energy > 60 && hygiene > 70) return 'happy'
  return 'idle'
}

export function killPet(state: GameState, now: number, cause: string): GameState {
  return {
    ...state,
    isDead: true,
    mood: 'dead',
    lightsOff: false,
    deathAt: now,
    deathCause: cause,
    stats: { ...state.stats, health: 0 },
    lastTickAt: now,
    actionUntil: 0,
  }
}

export function createNewGame(name: string, now = Date.now()): GameState {
  return {
    version: 1,
    name: name.trim().slice(0, 12),
    createdAt: now,
    lastTickAt: now,
    ageMs: 0,
    stage: 'egg',
    adultForm: null,
    stats: {
      hunger: 80,
      energy: 80,
      fun: 80,
      hygiene: 90,
      health: 100,
    },
    mood: 'idle',
    lightsOff: false,
    isSick: false,
    sickSince: null,
    isDead: false,
    deathAt: null,
    deathCause: null,
    poopCount: 0,
    careScore: 0,
    careSamples: 0,
    hatchProgress: 0,
    muted: false,
    actionUntil: 0,
    lastPoopAt: now,
  }
}

export function tick(state: GameState, now = Date.now()): GameState {
  return applyOfflineAndTick(state, now)
}

export function hatchTap(state: GameState, now = Date.now()): GameState {
  if (state.stage !== 'egg' || state.isDead) return state
  const progress = state.hatchProgress + 1
  if (progress >= HATCH_CLICKS) {
    return sampleCare({
      ...state,
      stage: 'baby',
      hatchProgress: HATCH_CLICKS,
      mood: 'happy',
      actionUntil: now + ACTION_DURATIONS.happy,
      lastTickAt: now,
      lastPoopAt: now,
    })
  }
  return { ...state, hatchProgress: progress, lastTickAt: now }
}

export function feed(state: GameState, now = Date.now()): GameState {
  if (state.isDead || state.stage === 'egg' || state.lightsOff) return state
  return sampleCare({
    ...state,
    stats: {
      ...state.stats,
      hunger: clamp(state.stats.hunger + FEED_GAIN.hunger),
      hygiene: clamp(state.stats.hygiene + FEED_GAIN.hygiene),
    },
    mood: 'eating',
    actionUntil: now + ACTION_DURATIONS.eat,
    lastTickAt: now,
  })
}

export function toggleSleep(state: GameState, now = Date.now()): GameState {
  if (state.isDead || state.stage === 'egg') return state
  const lightsOff = !state.lightsOff
  return {
    ...state,
    lightsOff,
    mood: lightsOff ? 'sleeping' : deriveMood({ ...state, lightsOff: false, actionUntil: 0 }),
    actionUntil: now + ACTION_DURATIONS.sleepToggle,
    lastTickAt: now,
  }
}

export function clean(state: GameState, now = Date.now()): GameState {
  if (state.isDead || state.stage === 'egg' || state.lightsOff) return state
  if (state.poopCount <= 0 && state.stats.hygiene > 90) return state
  return sampleCare({
    ...state,
    poopCount: 0,
    stats: {
      ...state.stats,
      hygiene: clamp(state.stats.hygiene + CLEAN_GAIN.hygiene),
    },
    mood: 'happy',
    actionUntil: now + ACTION_DURATIONS.clean,
    lastTickAt: now,
    lastPoopAt: now,
  })
}

export function giveMedicine(state: GameState, now = Date.now()): GameState {
  if (state.isDead || state.stage === 'egg' || state.lightsOff) return state
  const healed = {
    ...state,
    isSick: false,
    sickSince: null,
    stats: {
      ...state.stats,
      health: clamp(state.stats.health + MEDICINE_GAIN.health),
    },
    mood: 'happy' as PetMood,
    actionUntil: now + ACTION_DURATIONS.medicine,
    lastTickAt: now,
  }
  return sampleCare(healed)
}

export function applyFunBoost(state: GameState, amount: number, now = Date.now()): GameState {
  if (state.isDead || state.stage === 'egg') return state
  return sampleCare({
    ...state,
    lightsOff: false,
    stats: {
      ...state.stats,
      fun: clamp(state.stats.fun + amount),
      energy: clamp(state.stats.energy - 6),
    },
    mood: 'playing',
    actionUntil: now + ACTION_DURATIONS.play,
    lastTickAt: now,
  })
}

/** Dev / QA: advance simulated time while applying the same tick rules. */
export function skipTime(state: GameState, ms: number, now = Date.now()): GameState {
  if (state.isDead) return state
  const fakeNow = state.lastTickAt + ms
  const advanced = applyOfflineAndTick(state, fakeNow)
  return { ...advanced, lastTickAt: now }
}

export function setMuteFlag(state: GameState, muted: boolean): GameState {
  return { ...state, muted }
}
