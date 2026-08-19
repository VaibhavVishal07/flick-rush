import { useState } from 'react'
import { AirtelSafeLogo } from '../assets/AirtelSafeLogo'
import { ShareCard } from './ShareCard'
import { SoundOffIcon, SoundOnIcon } from '../assets/icons'
import { GAME_CONFIG, safetyReport } from '../game/gameConfig'
import type { GameResult } from '../game/types'

interface Props {
  result: GameResult
  onReplay: () => void
  onReport: () => void
  soundOn: boolean
  onToggleSound: () => void
}

export const ResultScreen = ({
  result,
  onReplay,
  onReport,
  soundOn,
  onToggleSound,
}: Props) => {
  const [sharing, setSharing] = useState(false)

  /**
   * Two numbers and one sentence. A rate multiple, a supporting paragraph and
   * a pair of footnotes were all making the same point again in smaller type —
   * the screen was busy, not persuasive.
   */
  return (
    <section className="result" aria-label="Your result">
      {/* Same mark, same treatment as the takeover screen it follows:
          reversed white, no plate. */}
      {/* The score runs on into this screen, so the way to silence it has to
          be on this screen too. Same control as the intro and the HUD. */}
      <button
        type="button"
        className="mute-btn"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      >
        {soundOn ? <SoundOnIcon size={17} /> : <SoundOffIcon size={17} />}
      </button>

      <header className="result__top">
        <AirtelSafeLogo width={214} mono />
      </header>

      <div className="result__mid">
        {/* No card. A panel with a title bar made this read as a report; the
            argument is two numbers and they should hit the eye before any
            container does. Bare on the red, arcade-scale, black keylines. */}
        <div className="versus">
          <div className="versus__side">
            <p className="versus__cap">Got past you</p>
            <p className="versus__num versus__num--you">{result.slipped}</p>
            <p className="versus__note">in {GAME_CONFIG.GAME_DURATION / 1000} seconds</p>
          </div>

          <span className="versus__vs" aria-hidden="true">
            vs
          </span>

          <div className="versus__side versus__side--safe">
            <p className="versus__cap">Got past Airtel Safe</p>
            <p className="versus__num versus__num--safe">
              0<span className="versus__slam" aria-hidden="true" />
            </p>
            <p className="versus__note">ever</p>
          </div>
        </div>

        <div className="result__say">
          {/* Says what just happened in plain words. "Better automation" was a
              comparative with no subject — it read as a slogan, not a fact. */}
          <h2 className="result__headline">
            {result.slipped > 0 ? (
              <>
                Some got past you.
                <br />
                <em>None get past Airtel Safe.</em>
              </>
            ) : (
              <>
                A perfect run.
                <br />
                <em>Airtel Safe does that every time.</em>
              </>
            )}
          </h2>
        </div>
      </div>

      <div className="result__cta">
        <button type="button" className="btn btn--primary btn--lg" onClick={onReport}>
          See My Safety Report
        </button>
        {safetyReport ? (
          <p className="btn-sub">{safetyReport.totalHandled} handled for you this week</p>
        ) : null}
        <button type="button" className="btn btn--ghost" onClick={onReplay}>
          Play Again
        </button>
        <button type="button" className="btn btn--text" onClick={() => setSharing(true)}>
          Challenge a Friend
        </button>
      </div>

      {sharing ? (
        <ShareCard
          correct={result.correct}
          total={result.total}
          bestStreak={result.bestStreak}
          onClose={() => setSharing(false)}
        />
      ) : null}
    </section>
  )
}
