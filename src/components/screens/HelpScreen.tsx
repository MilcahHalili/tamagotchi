import { DeviceFrame } from '../DeviceFrame'
import { sfx } from '../../game/sound'

type Props = {
  onClose: () => void
}

const TIPS = [
  {
    title: 'Care loop',
    body: 'Feed, rest, play, and clean. Stats drain in real time — even while the tab is closed.',
  },
  {
    title: 'Lights out',
    body: 'Sleep mode recovers energy faster. Wake your pet before feeding or playing.',
  },
  {
    title: 'Evolution',
    body: 'Baby → Teen (~2h) → Adult (~6h). Adult form reflects your care: Volt, Ember, or Shade.',
  },
  {
    title: 'Sickness',
    body: 'Neglect and filth cause sickness. Use medicine before health hits zero.',
  },
  {
    title: 'Mini-games',
    body: 'Reaction Pulse and Orb Catch boost fun. Misses still give a small reward.',
  },
]

export function HelpScreen({ onClose }: Props) {
  return (
    <DeviceFrame
      footer={
        <button
          type="button"
          onClick={() => {
            sfx.click()
            onClose()
          }}
          className="w-full rounded-xl border border-neon/50 bg-neon/15 px-3 py-2.5 font-pixel text-xl tracking-wide text-neon uppercase hover:box-glow-neon"
        >
          Back to device
        </button>
      }
    >
      <div className="space-y-4">
        <h2 className="font-display text-sm leading-relaxed text-neon text-glow-neon">Field Manual</h2>
        <ul className="space-y-3">
          {TIPS.map((tip) => (
            <li key={tip.title} className="border-l-2 border-amber/50 pl-3">
              <h3 className="font-pixel text-xl tracking-wide text-amber uppercase">
                {tip.title}
              </h3>
              <p className="mt-1 font-pixel text-lg leading-snug text-mute">{tip.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </DeviceFrame>
  )
}
