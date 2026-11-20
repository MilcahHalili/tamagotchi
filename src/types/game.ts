export type LifeStage = 'egg' | 'baby' | 'teen' | 'adult'
export type AdultForm = 'ember' | 'volt' | 'shade'
export type PetMood = 'idle' | 'eating' | 'sleeping' | 'playing' | 'sick' | 'happy' | 'dead'
export type Screen = 'naming' | 'game' | 'help' | 'memorial' | 'minigame-react' | 'minigame-catch'

export interface PetStats {
  hunger: number
  energy: number
  fun: number
  hygiene: number
  health: number
}

export interface GameState {
  version: 1
  name: string
  createdAt: number
  lastTickAt: number
  ageMs: number
  stage: LifeStage
  adultForm: AdultForm | null
  stats: PetStats
  mood: PetMood
  lightsOff: boolean
  isSick: boolean
  isDead: boolean
  deathAt: number | null
  deathCause: string | null
  poopCount: number
  careScore: number
  careSamples: number
  hatchProgress: number
  muted: boolean
  actionUntil: number
  lastPoopAt: number
  sickSince: number | null
}

export interface SharePayload {
  name: string
  stage: LifeStage
  adultForm: AdultForm | null
  ageLabel: string
  careLabel: string
}
