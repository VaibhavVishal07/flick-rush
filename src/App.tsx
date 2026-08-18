import { useCallback, useEffect, useMemo, useState } from 'react'
import { GameShell } from './components/GameShell'
import { GameIntro } from './components/GameIntro'
import { GameArena } from './components/GameArena'
import { ResultScreen } from './components/ResultScreen'
import { SafetyReportSheet } from './components/SafetyReportSheet'
import { RulesSheet } from './components/RulesSheet'
import { audio } from './game/audio'
import { setHapticsEnabled } from './game/haptics'
import type { GameResult } from './game/types'

type Screen = 'intro' | 'game' | 'result'

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return reduced
}

/** `?c=11-15-8` — a friend's result, used only to set up the rematch. */
const readChallenge = () => {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('c')
  if (!raw) return null
  const [correct, total, streak] = raw.split('-').map((n) => Number.parseInt(n, 10))
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0) return null
  return { correct, total, streak: Number.isFinite(streak) ? streak : 0 }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [result, setResult] = useState<GameResult | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [round, setRound] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const challenge = useMemo(readChallenge, [])

  useEffect(() => {
    audio.setEnabled(soundOn)
    setHapticsEnabled(soundOn)
  }, [soundOn])

  const play = useCallback(() => {
    // The Play tap is our user gesture — safe to build the audio graph here.
    audio.unlock()
    audio.setEnabled(soundOn)
    setResult(null)
    setRound((r) => r + 1)
    setScreen('game')
  }, [soundOn])

  const finish = useCallback((r: GameResult) => {
    setResult(r)
    setScreen('result')
  }, [])

  return (
    <GameShell>
      {screen === 'intro' ? (
        <>
          {challenge ? (
            <div className="challenge-chip" role="note">
              A friend handled <b>{challenge.correct}/{challenge.total}</b>. Your turn.
            </div>
          ) : null}
          <GameIntro
            onPlay={play}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn((s) => !s)}
            onRules={() => setShowRules(true)}
            onReport={() => setShowReport(true)}
            returning={round > 0}
          />
        </>
      ) : null}

      {screen === 'game' ? (
        <GameArena
          key={round}
          onFinish={finish}
          reducedMotion={reducedMotion}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((s) => !s)}
          skipTutorial={round > 1}
        />
      ) : null}

      {screen === 'result' && result ? (
        <ResultScreen result={result} onReplay={play} onReport={() => setShowReport(true)} />
      ) : null}

      {showReport ? <SafetyReportSheet onClose={() => setShowReport(false)} /> : null}
      {showRules ? <RulesSheet onClose={() => setShowRules(false)} /> : null}
    </GameShell>
  )
}
