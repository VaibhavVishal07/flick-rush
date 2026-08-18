import {
  AirtelSafeMark,
  ShieldMark,
  SoundOffIcon,
  SoundOnIcon,
  familyIcon,
} from '../assets/icons'
import { PhoneDevice } from '../assets/PhoneDevice'
import { WinnerTicker } from './WinnerTicker'
import { GAME_CONFIG, safetyReport } from '../game/gameConfig'
import type { Family, Trust } from '../game/objectTypes'

interface Props {
  onPlay: () => void
  soundOn: boolean
  onToggleSound: () => void
  onRules: () => void
  onReport: () => void
  returning: boolean
}

/** The four stickers that orbit the phone on the ingress. */
const PREVIEW: Array<{
  label: string
  family: Family
  trust: Trust
  lane: string
}> = [
  { label: 'Spam Call', family: 'call', trust: 'threat', lane: 'a' },
  { label: 'Suspicious Link', family: 'link', trust: 'threat', lane: 'b' },
  { label: 'Mom Calling', family: 'call', trust: 'genuine', lane: 'c' },
  { label: 'Spam SMS', family: 'sms', trust: 'threat', lane: 'd' },
]

export const GameIntro = ({
  onPlay,
  soundOn,
  onToggleSound,
  onRules,
  onReport,
  returning,
}: Props) => (
  <section className="intro" aria-label="Shield Rush">
    <header className="intro__top">
      <AirtelSafeMark />
      <button
        type="button"
        className="hud__btn"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      >
        {soundOn ? <SoundOnIcon size={17} /> : <SoundOffIcon size={17} />}
      </button>
    </header>

    {/* Streak ladder, in the station-reward style of the reference campaigns. */}
    <div className="stations">
      <p className="stations__label">
        Streak
        <br />
        bonus
      </p>
      <ol className="stations__list">
        {GAME_CONFIG.STREAK_TIERS.map((t) => (
          <li key={t.at}>
            <span className="stations__count">×{t.at}</span>
            <span className="stations__name">{t.label}</span>
          </li>
        ))}
      </ol>
    </div>

    <WinnerTicker />

    <div className="intro__stage">
      <div className="intro__glow" aria-hidden="true" />
      <div className="intro__device" aria-hidden="true">
        <PhoneDevice width={78} />
      </div>
      {PREVIEW.map((p) => (
        <div
          key={p.lane}
          className={`intro__chip intro__chip--${p.lane}`}
          data-trust={p.trust}
          data-family={p.family}
          aria-hidden="true"
        >
          <span className="intro__chip-icon">{familyIcon(p.family, p.trust, 15)}</span>
          <span>{p.label}</span>
        </div>
      ))}

      <div className="rail intro__rail">
        <button type="button" className="tile" data-tone="rules" onClick={onRules}>
          <ShieldMark size={19} />
          <span className="tile__label">Rules</span>
        </button>
        <button type="button" className="tile" data-tone="report" onClick={onReport}>
          <span className="tile__pip" aria-hidden="true" />
          {familyIcon('calendar', 'genuine', 19)}
          <span className="tile__label">Report</span>
        </button>
      </div>
    </div>

    <div className="intro__copy">
      {safetyReport ? (
        <p className="intro__eyebrow">
          Airtel Safe handled <b>{safetyReport.totalHandled} things</b> for you this week.
        </p>
      ) : null}

      <h1 className="intro__title">
        Shield<span>Rush</span>
      </h1>

      <p className="intro__lede">
        Incoming nonsense.
        <br />
        Flick it away before it reaches your phone.
      </p>
      <p className="intro__sub">Let genuine calls and messages through.</p>
    </div>

    <div className="intro__cta">
      <button type="button" className="btn btn--primary btn--lg" onClick={onPlay}>
        {returning ? 'Play Again' : 'Play Now'}
      </button>
      <p className="btn-sub">Takes 20 seconds · 1 round</p>
    </div>
  </section>
)
