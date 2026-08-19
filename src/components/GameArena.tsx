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

/**
 * Three beats: name the thing, say what to do, then say the rule out loud.
 * Each object in the tutorial is a fixed one, so the copy can name it — "Mom
 * is calling" teaches far more than "this one is real", and the last beat
 * states the whole game in one line rather than leaving it to be inferred
 * from two examples.
 */
const TUTORIAL_COPY: Record<string, { lead: string; sub: string }> = {
  'tutorial-threat': { lead: 'Spam!', sub: 'Tap it before it reaches your phone' },
  'tutorial-genuine': { lead: "That's Mom", sub: "Don't tap. Let it through." },
  'tutorial-done': { lead: "That's the game", sub: 'Block the bad. Let the good through.' },
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
      }${g.phase === 'auto' ? ' is-auto' : ''}`}
      style={{ ['--panic' as string]: g.panic }}
      aria-label="Shield Rush game"
    >
      <ScoreHUD
        secondsLeft={g.secondsLeft}
        score={g.tally.score}
        paused={g.paused}
        pop={g.pop}
        canPause={g.phase === 'play'}
        soundOn={soundOn}
        onTogglePause={g.togglePause}
        onToggleSound={onToggleSound}
      />

      <div className="arena" ref={g.arenaRef}>
        <span className="panic-vignette" aria-hidden="true" />
        <PhoneTarget
          guarded={guarded}
          impact={g.impact}
          welcome={g.welcome}
          hero={g.phase === 'auto'}
          /* The target only gets named while learning. Once play starts the
             label is noise, but for the first two beats it is the difference
             between "a phone" and "the thing you are defending". */
          label={tutorial ? 'your phone' : null}
        />

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

        <SafeTakeover phase={g.phase} revealStep={g.revealStep} />

        {tutorial ? (
          <div key={g.phase} className="coach" aria-live="polite">
            <p className="coach__lead">{TUTORIAL_COPY[g.phase].lead}</p>
            <p className="coach__sub">{TUTORIAL_COPY[g.phase].sub}</p>
          </div>
        ) : null}

        {g.phase === 'countdown' ? (
          <div className="countdown" aria-live="assertive">
            <span key={g.countdown} className="countdown__num">
              {g.countdown > 0 ? g.countdown : 'Go'}
            </span>
          </div>
        ) : null}

        {g.flash ? <span key={g.flash} className="milestone-flash" aria-hidden="true" /> : null}

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
