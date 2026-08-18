import { PhoneDevice } from '../assets/PhoneDevice'
import { PhoneHero } from '../assets/PhoneHero'
import { SafeField } from '../assets/SafeField'

interface Props {
  /** Airtel Safe field is armed. */
  guarded: boolean
  /** A threat just landed — ripple out from the device. */
  impact: number
  /** A genuine item just arrived — the device says thank you. */
  welcome: number
  /** Takeover: the device takes over the lower half of the screen. */
  hero: boolean
  /** Names the target during the tutorial; null once play starts. */
  label?: string | null
}

export const PhoneTarget = ({ guarded, impact, welcome, hero, label }: Props) => (
  <div
    className={`phone-target${guarded ? ' is-guarded' : ''}${welcome ? ' is-welcoming' : ''}${
      hero ? ' is-hero' : ''
    }`}
  >
    <span className="phone-target__zone phone-target__zone--far" aria-hidden="true" />
    <span className="phone-target__zone phone-target__zone--near" aria-hidden="true" />
    <span className="phone-target__zone phone-target__zone--ripple" aria-hidden="true" />
    <span
      className="phone-target__zone phone-target__zone--ripple phone-target__zone--ripple2"
      aria-hidden="true"
    />
    {impact ? <span key={impact} className="phone-target__impact" aria-hidden="true" /> : null}
    {welcome ? <span key={`w${welcome}`} className="phone-target__welcome" aria-hidden="true" /> : null}
    <SafeField active={guarded} />
    <div className="phone-target__device">
      {hero ? <PhoneHero width={228} /> : <PhoneDevice width={89} />}
    </div>
    {label ? <span className="phone-target__label">{label}</span> : null}
  </div>
)
