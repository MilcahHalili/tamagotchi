type Props = {
  disabled?: boolean
  lightsOff: boolean
  isEgg: boolean
  isSick: boolean
  poopCount: number
  onFeed: () => void
  onSleep: () => void
  onClean: () => void
  onMedicine: () => void
  onReact: () => void
  onCatch: () => void
}

function Btn({
  label,
  sub,
  onClick,
  disabled,
  accent = 'neon',
  pulse,
}: {
  label: string
  sub?: string
  onClick: () => void
  disabled?: boolean
  accent?: 'neon' | 'amber'
  pulse?: boolean
}) {
  const border = accent === 'amber' ? 'border-amber/40 text-amber' : 'border-neon/40 text-neon'
  const hover = accent === 'amber' ? 'enabled:hover:box-glow-amber' : 'enabled:hover:box-glow-neon'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border bg-steel/50 px-2 py-2.5 text-center transition disabled:cursor-not-allowed disabled:opacity-35 ${border} ${hover} ${
        pulse ? 'box-glow-amber' : ''
      }`}
    >
      <span className="block font-display text-[10px] tracking-wider uppercase">{label}</span>
      {sub && <span className="font-pixel text-sm text-mute">{sub}</span>}
    </button>
  )
}

export function ActionPad({
  disabled,
  lightsOff,
  isEgg,
  isSick,
  poopCount,
  onFeed,
  onSleep,
  onClean,
  onMedicine,
  onReact,
  onCatch,
}: Props) {
  const careLocked = Boolean(disabled || isEgg)
  const awakeLocked = careLocked || lightsOff

  return (
    <div className="grid grid-cols-3 gap-2">
      <Btn label="Feed" onClick={onFeed} disabled={awakeLocked} />
      <Btn
        label={lightsOff ? 'Wake' : 'Sleep'}
        onClick={onSleep}
        disabled={careLocked}
        accent="amber"
      />
      <Btn
        label="Clean"
        sub={poopCount ? `×${poopCount}` : undefined}
        onClick={onClean}
        disabled={awakeLocked}
      />
      <Btn label="Pulse" sub="game" onClick={onReact} disabled={awakeLocked} />
      <Btn label="Catch" sub="game" onClick={onCatch} disabled={awakeLocked} accent="amber" />
      <Btn
        label="Meds"
        onClick={onMedicine}
        disabled={awakeLocked}
        accent="amber"
        pulse={isSick}
      />
    </div>
  )
}
