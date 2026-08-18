import { useEffect } from 'react'
import { IncomingObject } from './IncomingObject'
import { PhoneTarget } from './PhoneTarget'
import { ScoreHUD } from './ScoreHUD'
import { StreakBadge } from './StreakBadge'
import { SafeTakeover } from './SafeTakeover'
import { ParticleBurst } from '../assets/ParticleBurst'
import { useGameEngine } from '../game/useGameEngine'
import type { GameResult } from '../game/types'

interface Props {
  onFinish: (result: GameResult) => void
  reducedMotion: boolean
  soundOn: boolean
  onToggleSound: () => void
  skipTutorial: boolean
}

const TUTORIAL_COPY: Record<string, string> = {
  'tutorial-threat': 'Tap the ✕ ones',
  'tutorial-genuine': 'Leave the ✓ ones',
  'tutorial-done': 'Got it.',
}

export const GameArena = ({
  onFinish,
  reducedMotion,
  soundOn,
  onToggleSound,
  skipTutorial,
}: Props) => {
  const g = useGameEngine({ onFinish, reducedMotion, skipTutorial })

  // Keyboard fallback so the game is playable without a pointer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        g.flickNearest()
      } else if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        g.togglePause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [g])

  const tutorial = g.phase.startsWith('tutorial')
  // The sky turns stormy for the beat where the player is losing.
  const storm = g.phase === 'freeze' || g.phase === 'reveal'
  // The field blooms as "You shouldn't have to." lands, then does the work.
  const guarded = g.phase === 'auto' || g.revealStep >= 2
  const lastVerdict = g.feedback[g.feedback.length - 1]

  return (
    <section
      className={`arena-shell${g.impact ? ' is-hit' : ''}${g.kick ? ' is-kick' : ''}${
        storm ? ' is-storm' : ''
      }`}
      aria-label="Shield Rush game"
    >
      <ScoreHUD
        secondsLeft={g.secondsLeft}
        score={g.tally.score}
        paused={g.paused}
        canPause={g.phase === 'play'}
        soundOn={soundOn}
        onTogglePause={g.togglePause}
        onToggleSound={onToggleSound}
      />

      <div className="arena" ref={g.arenaRef}>
        <PhoneTarget guarded={guarded} impact={g.impact} welcome={g.welcome} />

        {g.objects.map((o, i) => (
          <IncomingObject
            key={o.id}
            object={o}
            cue={i === 0 ? g.cue : null}
            register={g.registerEl}
            onDown={g.onObjectPointerDown}
            onMove={g.onObjectPointerMove}
            onUp={g.endDrag}
          />
        ))}

        {g.bursts.map((b) => (
          <ParticleBurst key={b.id} burst={b} />
        ))}

        {g.feedback.map((f) => (
          <div
            key={f.id}
            className={`verdict verdict--${f.kind}`}
            style={{ left: f.x, top: f.y }}
          >
            <span className="verdict__label">{f.label}</span>
            {f.points ? (
              <span className="verdict__points">
                {f.points > 0 ? `+${f.points}` : f.points}
              </span>
            ) : null}
          </div>
        ))}

        <SafeTakeover phase={g.phase} revealStep={g.revealStep} autoTally={g.autoTally} />

        {tutorial ? (
          <p key={g.phase} className="coach">
            {TUTORIAL_COPY[g.phase]}
          </p>
        ) : null}

        {g.phase === 'countdown' ? (
          <div className="countdown" aria-live="assertive">
            <span key={g.countdown} className="countdown__num">
              {g.countdown > 0 ? g.countdown : 'Go'}
            </span>
          </div>
        ) : null}

        {g.paused ? (
          <div className="paused">
            <p className="paused__title">Paused</p>
            <button type="button" className="btn btn--ghost" onClick={g.togglePause}>
              Resume
            </button>
          </div>
        ) : null}
      </div>

      <div className="arena-foot">
        <StreakBadge badge={g.streakBadge} />
      </div>

      <p className="sr-only" aria-live="polite">
        {lastVerdict ? lastVerdict.label : ''}
      </p>
    </section>
  )
}
