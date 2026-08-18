import { PhoneDevice } from '../assets/PhoneDevice'
import { SafeField } from '../assets/SafeField'

interface Props {
  /** Airtel Safe field is armed. */
  guarded: boolean
  /** A threat just landed — ripple out from the device. */
  impact: number
  /** A genuine item just arrived — the device says thank you. */
  welcome: number
}

export const PhoneTarget = ({ guarded, impact, welcome }: Props) => (
  <div
    className={`phone-target${guarded ? ' is-guarded' : ''}${welcome ? ' is-welcoming' : ''}`}
  >
    <span className="phone-target__zone phone-target__zone--far" aria-hidden="true" />
    <span className="phone-target__zone phone-target__zone--near" aria-hidden="true" />
    {impact ? <span key={impact} className="phone-target__impact" aria-hidden="true" /> : null}
    {welcome ? <span key={`w${welcome}`} className="phone-target__welcome" aria-hidden="true" /> : null}
    <SafeField active={guarded} />
    <div className="phone-target__device">
      <PhoneDevice width={74} />
    </div>
  </div>
)
