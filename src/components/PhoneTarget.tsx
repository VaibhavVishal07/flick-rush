import { PhoneDevice } from '../assets/PhoneDevice'
import { SafeField } from '../assets/SafeField'

interface Props {
  /** Airtel Safe field is armed. */
  guarded: boolean
  /** A threat just landed — ripple out from the device. */
  impact: number
}

export const PhoneTarget = ({ guarded, impact }: Props) => (
  <div className={`phone-target${guarded ? ' is-guarded' : ''}`}>
    <span className="phone-target__zone phone-target__zone--far" aria-hidden="true" />
    <span className="phone-target__zone phone-target__zone--near" aria-hidden="true" />
    {impact ? <span key={impact} className="phone-target__impact" aria-hidden="true" /> : null}
    <SafeField active={guarded} />
    <div className="phone-target__device">
      <PhoneDevice width={66} />
    </div>
  </div>
)
