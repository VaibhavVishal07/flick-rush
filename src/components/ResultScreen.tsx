import { useState } from 'react'
import { AirtelSafeLogo } from '../assets/AirtelSafeLogo'
import { ShareCard } from './ShareCard'
import { safetyReport } from '../game/gameConfig'
import type { GameResult } from '../game/types'

interface Props {
  result: GameResult
  onReplay: () => void
  onReport: () => void
}

export const ResultScreen = ({ result, onReplay, onReport }: Props) => {
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
            <p className="versus__note">in 17 seconds</p>
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
