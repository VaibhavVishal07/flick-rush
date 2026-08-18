import { useState } from 'react'
import { ShieldMark } from '../assets/icons'
import { AirtelSafeLogo } from '../assets/AirtelSafeLogo'
import { ShareCard } from './ShareCard'
import { GAME_CONFIG, safetyReport } from '../game/gameConfig'
import type { GameResult } from '../game/types'

interface Props {
  result: GameResult
  onReplay: () => void
  onReport: () => void
}

export const ResultScreen = ({ result, onReplay, onReport }: Props) => {
  const [sharing, setSharing] = useState(false)

  /**
   * Correct-out-of-total compresses the difference and rate charts turn it
   * into homework. The point lands on two numbers: what got past you, and
   * the zero that got past Airtel Safe. Everything else is a footnote.
   */
  const autoTotal =
    result.auto.calls + result.auto.messages + result.auto.links + result.auto.allowed
  const youRate = Math.round(result.correct / (GAME_CONFIG.GAME_DURATION / 60_000))
  const safeRate = Math.round(autoTotal / (GAME_CONFIG.TAKEOVER_DURATION / 60_000))
  const multiple = Math.max(2, Math.round(safeRate / Math.max(youRate, 1)))

  return (
    <section className="result" aria-label="Your result">
      {/* Same mark, same treatment as the takeover screen it follows:
          reversed white, no plate. */}
      <header className="result__top">
        <AirtelSafeLogo width={214} mono />
      </header>

      <div className="result__mid">
        <div className="win versus">
          <div className="win__bar">
            <span className="win__dots" aria-hidden="true">
              ─ ▢ ✕
            </span>
            <span className="win__title">The difference</span>
          </div>

          <div className="versus__grid">
            <div className="versus__col">
              <p className="versus__cap">Got past you</p>
              <p className="versus__num versus__num--you">{result.slipped}</p>
              <p className="versus__note">in 17 seconds</p>
            </div>

            <span className="versus__vs" aria-hidden="true">
              vs
            </span>

            <div className="versus__col versus__col--safe">
              <p className="versus__cap">
                <ShieldMark size={13} /> Got past Airtel Safe
              </p>
              <p className="versus__num versus__num--safe">0</p>
              <p className="versus__note">ever</p>
            </div>
          </div>

          <p className="versus__foot">
            <b>{multiple}× faster</b> than you managed — and it never stops.
          </p>
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
          {/* One line. The takeover screen already named what it blocks; the
              only thing left to say is that it never asks you to. */}
          <p className="result__body">
            Every hour of every day, without you tapping anything.
          </p>
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
