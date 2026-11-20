import type { AdultForm, LifeStage, PetStats } from '../types/game'

/** Soft drain rates — casual check-ins through a normal day keep a pet alive. */
export const DRAIN_PER_HOUR: PetStats = {
  hunger: 10, // ~10 hours empty if ignored
  energy: 8, // slower; sleep recovers it
  fun: 12, // needs occasional play
  hygiene: 4, // mostly from poop events
  health: 0, // only from neglect / sickness
}

export const SLEEP_ENERGY_PER_HOUR = 28
export const SLEEP_FUN_DRAIN_PER_HOUR = 4
export const SLEEP_HUNGER_DRAIN_PER_HOUR = 5

export const CRITICAL_THRESHOLD = 18
export const SICK_THRESHOLD = 12
export const DEATH_HEALTH = 0

/** Poop appears roughly every 2.5 hours while awake. */
export const POOP_INTERVAL_MS = 2.5 * 60 * 60 * 1000
export const POOP_HYGIENE_PENALTY = 18
export const MAX_POOP = 3

export const HATCH_CLICKS = 5

/** Real-time age gates for evolution. */
export const STAGE_AGE_MS: Record<Exclude<LifeStage, 'egg'>, number> = {
  baby: 0,
  teen: 2 * 60 * 60 * 1000, // 2h
  adult: 6 * 60 * 60 * 1000, // 6h
}

export const ADULT_FORM_BY_CARE: { min: number; form: AdultForm }[] = [
  { min: 72, form: 'volt' },
  { min: 40, form: 'ember' },
  { min: 0, form: 'shade' },
]

export const ACTION_DURATIONS = {
  eat: 1600,
  sleepToggle: 400,
  play: 1200,
  clean: 900,
  medicine: 1400,
  happy: 1800,
} as const

export const STORAGE_KEY = 'neon-tamagotchi-v1'

export const FEED_GAIN = { hunger: 32, hygiene: -4 }
export const CLEAN_GAIN = { hygiene: 40 }
export const MEDICINE_GAIN = { health: 28 }
export const PLAY_MINIGAME_FUN = { react: 28, catch: 34 }

export function formatAge(ageMs: number): string {
  const totalMin = Math.floor(ageMs / 60000)
  const hours = Math.floor(totalMin / 60)
  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  const mins = totalMin % 60
  if (days > 0) return `${days}d ${remHours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function careLabel(avg: number): string {
  if (avg >= 80) return 'Legendary Care'
  if (avg >= 65) return 'Devoted'
  if (avg >= 45) return 'Steady'
  if (avg >= 25) return 'Rough'
  return 'Neglected'
}

export function stageLabel(stage: LifeStage, adultForm: AdultForm | null): string {
  if (stage === 'adult' && adultForm) {
    const names: Record<AdultForm, string> = {
      volt: 'Volt Adult',
      ember: 'Ember Adult',
      shade: 'Shade Adult',
    }
    return names[adultForm]
  }
  const labels: Record<LifeStage, string> = {
    egg: 'Egg',
    baby: 'Baby',
    teen: 'Teen',
    adult: 'Adult',
  }
  return labels[stage]
}
