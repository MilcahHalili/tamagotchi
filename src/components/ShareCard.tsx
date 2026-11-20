import { useEffect, useRef, useState } from 'react'
import type { GameState } from '../types/game'
import { careLabel, formatAge, stageLabel } from '../game/constants'
import { DeviceFrame } from './DeviceFrame'
import { sfx } from '../game/sound'

type Props = {
  state: GameState
  onClose: () => void
}

function drawCard(canvas: HTMLCanvasElement, state: GameState) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = 720
  const h = 900
  canvas.width = w
  canvas.height = h

  // Background
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#0e1216')
  grad.addColorStop(0.5, '#151b22')
  grad.addColorStop(1, '#07090b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Neon frame
  ctx.strokeStyle = '#39ff14'
  ctx.lineWidth = 4
  ctx.shadowColor = 'rgba(57,255,20,0.45)'
  ctx.shadowBlur = 18
  ctx.strokeRect(36, 36, w - 72, h - 72)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#39ff14'
  ctx.font = '700 28px Orbitron, sans-serif'
  ctx.fillText('NEON GOTCHI', 72, 110)

  ctx.fillStyle = '#ffb020'
  ctx.font = '700 48px Orbitron, sans-serif'
  ctx.fillText(state.name, 72, 190)

  const avg = state.careSamples ? state.careScore / state.careSamples : 0
  const lines = [
    stageLabel(state.stage, state.adultForm),
    `Age ${formatAge(state.ageMs)}`,
    careLabel(avg),
    state.isDead ? `Memorial · ${state.deathCause ?? 'rest'}` : 'Alive & glowing',
  ]

  ctx.fillStyle = '#9dff7a'
  ctx.font = '36px VT323, monospace'
  lines.forEach((line, i) => {
    ctx.fillText(line, 72, 280 + i * 56)
  })

  // Pixel creature mark
  ctx.fillStyle = '#39ff14'
  const ox = 480
  const oy = 520
  const cells = [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 1, 0],
  ]
  cells.forEach((row, y) => {
    row.forEach((on, x) => {
      if (!on) return
      ctx.fillRect(ox + x * 28, oy + y * 28, 26, 26)
    })
  })

  ctx.fillStyle = '#6b7a8a'
  ctx.font = '22px Rajdhani, sans-serif'
  ctx.fillText('neon-gotchi · handheld night companion', 72, h - 72)
}

export function ShareCard({ state, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<string>('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCard(canvas, state)
    setPreview(canvas.toDataURL('image/png'))
  }, [state])

  async function share() {
    sfx.click()
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    )
    const fileName = `${state.name || 'neon-gotchi'}-card.png`
    const text = `${state.name} · ${stageLabel(state.stage, state.adultForm)} · ${formatAge(state.ageMs)} — Neon Gotchi`

    try {
      if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
        await navigator.share({
          title: 'Neon Gotchi',
          text,
          files: [new File([blob], fileName, { type: 'image/png' })],
        })
        setStatus('Shared!')
        return
      }
      if (navigator.share) {
        await navigator.share({ title: 'Neon Gotchi', text, url: window.location.href })
        setStatus('Shared link!')
        return
      }
    } catch {
      // fall through to download
    }

    // Download fallback
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = fileName
    a.click()
    setStatus('Card downloaded')
  }

  return (
    <DeviceFrame
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              sfx.click()
              onClose()
            }}
            className="flex-1 rounded-xl border border-slate px-3 py-2.5 font-display text-[11px] tracking-wider text-mute uppercase"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className="flex-[2] rounded-xl border border-neon/50 bg-neon/15 px-3 py-2.5 font-display text-[11px] tracking-wider text-neon uppercase hover:box-glow-neon"
          >
            Share / Download
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <h2 className="font-display text-lg text-neon text-glow-neon">Share Card</h2>
        <canvas ref={canvasRef} className="hidden" />
        {preview && (
          <img
            src={preview}
            alt="Share card preview"
            className="w-full rounded-xl border border-neon/20"
          />
        )}
        {status && <p className="font-pixel text-lg text-amber">{status}</p>}
      </div>
    </DeviceFrame>
  )
}
