import { AirtelSafeMark, SoundOffIcon, SoundOnIcon, familyIcon } from '../assets/icons'
import { PhoneDevice } from '../assets/PhoneDevice'
import { safetyReport } from '../game/gameConfig'
import type { Family, Trust } from '../game/objectTypes'

interface Props {
  onPlay: () => void
  soundOn: boolean
  onToggleSound: () => void
  returning: boolean
}

/** The four chips that orbit the phone on the ingress. */
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

export const GameIntro = ({ onPlay, soundOn, onToggleSound, returning }: Props) => (
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

    <div className="intro__stage" aria-hidden="true">
      <span className="intro__glow" />
      <div className="intro__device">
        <PhoneDevice width={72} />
      </div>
      {PREVIEW.map((p) => (
        <div key={p.lane} className={`intro__chip intro__chip--${p.lane}`} data-trust={p.trust}>
          <span className="intro__chip-icon">{familyIcon(p.family, p.trust, 16)}</span>
          <span>{p.label}</span>
        </div>
      ))}
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
      <p className="intro__hint">Takes 20 seconds</p>
    </div>
  </section>
)
