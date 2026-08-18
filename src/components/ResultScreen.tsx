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

  return (
    <section className="result" aria-label="Your result">
      <header className="result__top">
        <AirtelSafeMark />
      </header>

      <div className="result__compare">
        <div className="score-block">
          <p className="score-block__who">You</p>
          <p className="score-block__value">
            {result.correct} <span>/ {result.total}</span>
          </p>
          <p className="score-block__note">Handled correctly</p>
        </div>

        <div className="score-block__vs" aria-hidden="true">
          <span>vs</span>
        </div>

        <div className="score-block score-block--safe">
          <p className="score-block__who">
            <ShieldMark size={15} /> Airtel Safe
          </p>
          <p className="score-block__value">
            {result.autoHandled} <span>/ {result.total}</span>
          </p>
          <p className="score-block__note">Handled automatically</p>
        </div>
      </div>

      <div className="result__verdict">
        <h2 className="result__headline">
          Good reflexes.
          <br />
          <em>Better automation.</em>
        </h2>
        <p className="result__body">
          Airtel Safe automatically handles spam calls, suspicious links and messages, so you
          don&rsquo;t have to.
        </p>
      </div>

      <dl className="result__stats">
        <div>
          <dt>Score</dt>
          <dd>{result.score}</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>×{result.bestStreak}</dd>
        </div>
      </dl>

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
