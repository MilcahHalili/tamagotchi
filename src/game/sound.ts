/** Lightweight chiptune SFX via Web Audio API — no external assets. */

type Tone = {
  freq: number
  duration: number
  type?: OscillatorType
  gain?: number
  slide?: number
}

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  return ctx
}

export function setMuted(value: boolean) {
  muted = value
}

export function isMuted() {
  return muted
}

async function ensureRunning() {
  const audio = getCtx()
  if (audio.state === 'suspended') {
    await audio.resume()
  }
  return audio
}

function playTone(tone: Tone, when = 0) {
  if (muted) return
  void ensureRunning().then((audio) => {
    const t0 = audio.currentTime + when
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = tone.type ?? 'square'
    osc.frequency.setValueAtTime(tone.freq, t0)
    if (tone.slide) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, tone.freq + tone.slide),
        t0 + tone.duration,
      )
    }
    const vol = tone.gain ?? 0.08
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.duration)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(t0)
    osc.stop(t0 + tone.duration + 0.02)
  })
}

function sequence(tones: Tone[], gap = 0.05) {
  let t = 0
  for (const tone of tones) {
    playTone(tone, t)
    t += tone.duration + gap
  }
}

export const sfx = {
  click: () => playTone({ freq: 520, duration: 0.05, type: 'square', gain: 0.05 }),
  feed: () =>
    sequence([
      { freq: 330, duration: 0.07 },
      { freq: 440, duration: 0.07 },
      { freq: 550, duration: 0.1 },
    ]),
  sleep: () =>
    sequence([
      { freq: 392, duration: 0.12, type: 'triangle' },
      { freq: 294, duration: 0.18, type: 'triangle', gain: 0.06 },
    ]),
  clean: () =>
    sequence([
      { freq: 880, duration: 0.05 },
      { freq: 1175, duration: 0.08 },
    ]),
  medicine: () =>
    sequence([
      { freq: 523, duration: 0.08, type: 'sine' },
      { freq: 659, duration: 0.08, type: 'sine' },
      { freq: 784, duration: 0.12, type: 'sine' },
    ]),
  hatch: () =>
    sequence([
      { freq: 262, duration: 0.1 },
      { freq: 330, duration: 0.1 },
      { freq: 392, duration: 0.1 },
      { freq: 523, duration: 0.2 },
    ]),
  evolve: () =>
    sequence([
      { freq: 349, duration: 0.1 },
      { freq: 440, duration: 0.1 },
      { freq: 523, duration: 0.1 },
      { freq: 698, duration: 0.22 },
    ]),
  sick: () => playTone({ freq: 180, duration: 0.25, type: 'sawtooth', gain: 0.05, slide: -80 }),
  death: () =>
    sequence(
      [
        { freq: 392, duration: 0.2, type: 'triangle', gain: 0.06 },
        { freq: 311, duration: 0.25, type: 'triangle', gain: 0.05 },
        { freq: 247, duration: 0.4, type: 'triangle', gain: 0.04 },
      ],
      0.08,
    ),
  happy: () =>
    sequence([
      { freq: 523, duration: 0.07 },
      { freq: 659, duration: 0.07 },
      { freq: 784, duration: 0.07 },
      { freq: 1046, duration: 0.14 },
    ]),
  gameHit: () => playTone({ freq: 740, duration: 0.06, gain: 0.07 }),
  gameMiss: () => playTone({ freq: 160, duration: 0.12, type: 'sawtooth', gain: 0.05 }),
  gameWin: () =>
    sequence([
      { freq: 523, duration: 0.08 },
      { freq: 659, duration: 0.08 },
      { freq: 784, duration: 0.08 },
      { freq: 1046, duration: 0.18 },
    ]),
  poop: () => playTone({ freq: 120, duration: 0.15, type: 'triangle', gain: 0.04 }),
}
