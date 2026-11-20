import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from './hooks/useGame'
import { NamingScreen } from './components/screens/NamingScreen'
import { GameScreen } from './components/screens/GameScreen'
import { HelpScreen } from './components/screens/HelpScreen'
import { MemorialScreen } from './components/screens/MemorialScreen'
import { ShareCard } from './components/ShareCard'
import { ReactionGame } from './components/minigames/ReactionGame'
import { CatchGame } from './components/minigames/CatchGame'

export default function App() {
  const { state, screen, setScreen, devMode, startNew, restart, actions } = useGame()
  const [sharing, setSharing] = useState(false)

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(57,255,20,0.08), transparent 45%), radial-gradient(ellipse at 90% 20%, rgba(255,122,24,0.1), transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(15,25,35,0.9), #07090b 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\'%3E%3Cpath d=\'M0 0h60v60H0z\' fill=\'none\' stroke=\'%2339ff14\' stroke-width=\'0.4\'/%3E%3C/svg%3E")',
        }}
      />

      <main className="relative z-[1] mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8 sm:py-12">
        <header className="mb-6 text-center sm:mb-8">
          <p className="font-pixel text-xl tracking-wide text-amber/80 uppercase">
            Handheld Night Unit
          </p>
          <h1 className="mt-2 font-display text-base leading-relaxed text-neon text-glow-neon sm:text-lg">
            NEON GOTCHI
          </h1>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={sharing ? 'share' : screen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {sharing && state ? (
              <ShareCard state={state} onClose={() => setSharing(false)} />
            ) : screen === 'naming' ? (
              <NamingScreen onStart={startNew} onHelp={() => setScreen('help')} />
            ) : screen === 'help' ? (
              <HelpScreen onClose={actions.closeHelp} />
            ) : screen === 'memorial' && state ? (
              <MemorialScreen
                state={state}
                onRestart={restart}
                onShare={() => setSharing(true)}
              />
            ) : screen === 'minigame-react' ? (
              <ReactionGame onDone={(ok) => actions.finishMinigame('react', ok)} />
            ) : screen === 'minigame-catch' ? (
              <CatchGame onDone={(ok) => actions.finishMinigame('catch', ok)} />
            ) : state ? (
              <GameScreen
                state={state}
                actions={actions}
                devMode={devMode}
                onShare={() => setSharing(true)}
              />
            ) : (
              <NamingScreen onStart={startNew} onHelp={() => setScreen('help')} />
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center font-pixel text-lg text-mute">
          Progress saves locally · Add <code className="text-neon/70">?dev=1</code> for time skip
        </p>
      </main>
    </div>
  )
}
