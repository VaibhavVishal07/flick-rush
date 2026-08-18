import { useState } from 'react'
import { AirtelSafeMark, ShieldMark } from '../assets/icons'
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
  const youPct = Math.round((result.correct / result.total) * 100)

  return (
    <section className="result" aria-label="Your result">
      <header className="result__top">
        <AirtelSafeMark />
      </header>

      {/* One card, one idea: the same job, done two ways. */}
      <div className="tally">
        <p className="tally__cap">Handled correctly</p>

        <div className="tally__row">
          <p className="tally__who">You</p>
          <div className="tally__bar">
            <span className="tally__fill" style={{ width: `${youPct}%` }} />
          </div>
          <p className="tally__num">
            {result.correct}
            <i>/{result.total}</i>
          </p>
        </div>

        <div className="tally__row tally__row--safe">
          <p className="tally__who">
            <ShieldMark size={14} /> Airtel Safe
          </p>
          <div className="tally__bar">
            <span className="tally__fill" style={{ width: '100%' }} />
          </div>
          <p className="tally__num">
            {result.autoHandled}
            <i>/{result.total}</i>
          </p>
        </div>

        <p className="tally__foot">
          Score {result.score} · Best streak ×{result.bestStreak}
        </p>
      </div>

      <div className="result__verdict">
        <h2 className="result__headline">
          Good reflexes.
          <br />
          <em>Better automation.</em>
        </h2>
        <p className="result__body">
          Airtel Safe handles spam calls, suspicious links and messages automatically — every
          time, without you tapping anything.
        </p>
      </div>

      <div className="result__cta">
        <button type="button" className="btn btn--primary btn--lg" onClick={onReport}>
          See My Safety Report
        </button>
        {safetyReport ? (
          <p className="btn-sub">
            {safetyReport.totalHandled} things handled for you this week
          </p>
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
