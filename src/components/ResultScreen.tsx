import { useState } from 'react'
import { AirtelSafeMark, ShieldMark } from '../assets/icons'
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
   * Correct-out-of-total compresses the difference: a good run scores 18/21
   * against 21/21 and the gap looks trivial. Throughput is where it actually
   * lives, and both halves are measured — you against the clock for
   * seventeen seconds, Airtel Safe against the same clock for three.
   */
  const autoTotal =
    result.auto.calls + result.auto.messages + result.auto.links + result.auto.allowed
  const youRate = Math.round(result.correct / (GAME_CONFIG.GAME_DURATION / 60_000))
  const safeRate = Math.round(autoTotal / (GAME_CONFIG.TAKEOVER_DURATION / 60_000))
  const youPct = Math.max(5, Math.min(100, Math.round((youRate / Math.max(safeRate, 1)) * 100)))
  const multiple = Math.max(1, Math.round(safeRate / Math.max(youRate, 1)))

  return (
    <section className="result" aria-label="Your result">
      <header className="result__top">
        <AirtelSafeMark />
      </header>

      <div className="result__mid">
        <h2 className="result__headline">
          Good reflexes.
          <br />
          <em>Better automation.</em>
        </h2>

        <div className="win tally">
          <div className="win__bar">
            <span className="win__dots" aria-hidden="true">
              ─ ▢ ✕
            </span>
            <span className="win__title">Per minute</span>
          </div>

          <div className="win__body">
            <div className="tally__row">
              <p className="tally__who">You</p>
              <div className="tally__bar">
                <span className="tally__fill" style={{ width: `${youPct}%` }} />
              </div>
              <p className="tally__num">{youRate}</p>
            </div>

            <div className="tally__row tally__row--safe">
              <p className="tally__who">
                <ShieldMark size={13} /> Airtel Safe
              </p>
              <div className="tally__bar">
                <span className="tally__fill" style={{ width: '100%' }} />
              </div>
              <p className="tally__num">{safeRate}</p>
            </div>

            <p className="tally__punch">
              <b>{multiple}× faster</b> than your best seventeen seconds
            </p>

            <div className="slipped">
              <div className="slipped__col">
                <p className="slipped__cap">Got past you</p>
                <p className="slipped__num slipped__num--bad">{result.slipped}</p>
              </div>
              <div className="slipped__col">
                <p className="slipped__cap">Got past Airtel Safe</p>
                <p className="slipped__num slipped__num--good">0</p>
              </div>
            </div>
          </div>
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
