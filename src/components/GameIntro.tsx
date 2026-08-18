import {
  AirtelSafeMark,
  CrossIcon,
  ShieldMark,
  SoundOffIcon,
  SoundOnIcon,
  TickIcon,
  familyIcon,
} from '../assets/icons'
import { PhoneDevice } from '../assets/PhoneDevice'
import { safetyReport } from '../game/gameConfig'
import type { Family, Trust } from '../game/objectTypes'

interface Props {
  onPlay: () => void
  soundOn: boolean
  onToggleSound: () => void
  onRules: () => void
  returning: boolean
}

/**
 * Four stickers orbiting the phone: three to throw, one to leave alone.
 * This is the only teaching the ingress does — the tutorial covers the rest.
 */
const PREVIEW: Array<{ label: string; family: Family; trust: Trust; lane: string }> = [
  { label: 'Spam Call', family: 'call', trust: 'threat', lane: 'a' },
  { label: 'Suspicious Link', family: 'link', trust: 'threat', lane: 'b' },
  { label: 'Mom Calling', family: 'call', trust: 'genuine', lane: 'c' },
  { label: 'Spam SMS', family: 'sms', trust: 'threat', lane: 'd' },
]

export const GameIntro = ({ onPlay, soundOn, onToggleSound, onRules, returning }: Props) => (
  <section className="intro" aria-label="Shield Rush">
    <header className="intro__top">
      <AirtelSafeMark />
      <div className="intro__tools">
        <button type="button" className="hud__btn" onClick={onRules} aria-label="How to play">
          <ShieldMark size={17} />
        </button>
        <button
          type="button"
          className="hud__btn"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
        >
          {soundOn ? <SoundOnIcon size={17} /> : <SoundOffIcon size={17} />}
        </button>
      </div>
    </header>

    <div className="intro__stage" aria-hidden="true">
      <div className="intro__glow" />
      <div className="intro__device">
        <PhoneDevice width={80} />
      </div>
      {PREVIEW.map((p) => (
        <div
          key={p.lane}
          className={`intro__chip intro__chip--${p.lane}`}
          data-trust={p.trust}
          data-family={p.family}
        >
          <span className="intro__chip-icon">{familyIcon(p.family, p.trust, 15)}</span>
          <span>{p.label}</span>
          <span className="intro__chip-flag">
            {p.trust === 'threat' ? <CrossIcon size={12} /> : <TickIcon size={12} />}
          </span>
        </div>
      ))}
    </div>

    <div className="intro__copy">
      <h1 className="intro__title">
        Shield<span>Rush</span>
      </h1>
      <p className="intro__lede">
        Incoming nonsense.
        <br />
        Tap it away.
      </p>
      {safetyReport ? (
        <p className="intro__note">
          Airtel Safe handled <b>{safetyReport.totalHandled} things</b> for you this week.
        </p>
      ) : null}
    </div>

    <div className="intro__cta">
      <button type="button" className="btn btn--primary btn--lg" onClick={onPlay}>
        {returning ? 'Play Again' : 'Play Now'}
      </button>
      <p className="btn-sub">Takes 20 seconds</p>
    </div>
  </section>
)
