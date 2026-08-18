import { useState } from 'react'
import { AirtelSafeMark, LinkIcon, MessageIcon, ShieldMark, ThreatCallIcon } from '../assets/icons'
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
   * lives, and both halves are measured, not invented — you against the
   * clock for 17 seconds, Airtel Safe against the same clock for three.
   */
  const autoTotal =
    result.auto.calls + result.auto.messages + result.auto.links + result.auto.allowed
  const youRate = Math.round(result.correct / (GAME_CONFIG.GAME_DURATION / 60_000))
  const safeRate = Math.round(autoTotal / (GAME_CONFIG.TAKEOVER_DURATION / 60_000))
  const youPct = Math.max(5, Math.min(100, Math.round((youRate / Math.max(safeRate, 1)) * 100)))
  const multiple = Math.max(1, Math.round(safeRate / Math.max(youRate, 1)))

  const categories = [
    { label: 'Spam calls', value: result.auto.calls, icon: <ThreatCallIcon size={16} /> },
    { label: 'Messages', value: result.auto.messages, icon: <MessageIcon size={16} /> },
    { label: 'Links', value: result.auto.links, icon: <LinkIcon size={16} /> },
  ]

  return (
    <section className="result" aria-label="Your result">
      <header className="result__top">
        <AirtelSafeMark />
      </header>

      <div className="result__scroll">
        <div className="result__verdict">
          <h2 className="result__headline">
            Good reflexes.
            <br />
            <em>Better automation.</em>
          </h2>
        </div>

        {/* The same job, done two ways. Throughput, because that is where the
            difference actually is. */}
        <div className="tally">
          <p className="tally__cap">Things handled per minute</p>

          <div className="tally__row">
            <p className="tally__who">You</p>
            <div className="tally__bar">
              <span className="tally__fill" style={{ width: `${youPct}%` }} />
            </div>
            <p className="tally__num">{youRate}</p>
          </div>

          <div className="tally__row tally__row--safe">
            <p className="tally__who">
              <ShieldMark size={14} /> Airtel Safe
            </p>
            <div className="tally__bar">
              <span className="tally__fill" style={{ width: '100%' }} />
            </div>
            <p className="tally__num">{safeRate}</p>
          </div>

          <p className="tally__punch">
            That&rsquo;s <b>{multiple}× faster</b> than your best 17 seconds.
          </p>

          {/* And what actually got past each of you. */}
          <div className="slipped">
            <div className="slipped__col">
              <p className="slipped__cap">Slipped past you</p>
              <p className="slipped__num slipped__num--bad">{result.slipped}</p>
            </div>
            <div className="slipped__col">
              <p className="slipped__cap">Past Airtel Safe</p>
              <p className="slipped__num slipped__num--good">0</p>
            </div>
          </div>
        </div>

        {/* The claim, itemised. */}
        <div className="protect">
          <p className="protect__cap">
            <ShieldMark size={14} /> Blocked automatically, while you watched
          </p>
          <ul className="protect__list">
            {categories.map((c) => (
              <li key={c.label}>
                <span className="protect__icon">{c.icon}</span>
                <span className="protect__num">{c.value}</span>
                <span className="protect__label">{c.label}</span>
              </li>
            ))}
          </ul>
          <p className="protect__foot">
            <b>{result.auto.allowed}</b> genuine calls and messages went straight through — and
            Airtel Safe does this every hour of every day, not for seventeen seconds.
          </p>
        </div>

        <p className="result__meta">
          You handled {result.correct}/{result.total} · Score {result.score} · Best streak ×
          {result.bestStreak}
        </p>
      </div>

      <div className="result__cta">
        <button type="button" className="btn btn--primary btn--lg" onClick={onReport}>
          See My Safety Report
        </button>
        {safetyReport ? (
          <p className="btn-sub">{safetyReport.totalHandled} things handled for you this week</p>
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
