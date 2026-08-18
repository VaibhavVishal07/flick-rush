import { AirtelSafeMark } from '../assets/icons'
import { AirtelSafeLogo } from '../assets/AirtelSafeLogo'
import type { Phase } from '../game/types'

interface Props {
  phase: Phase
  revealStep: number
}

/**
 * The moment the product does the talking. Freeze, question, answer, then the
 * work — and while the work happens the screen carries nothing but the mark
 * and the promise. A card of counters was competing with the thing it was
 * meant to prove.
 */
export const SafeTakeover = ({ phase, revealStep }: Props) => {
  const engaged = phase === 'freeze' || phase === 'reveal' || phase === 'auto'
  if (!engaged) return null

  const auto = phase === 'auto'

  return (
    <div
      className={`takeover${auto ? ' takeover--auto' : ''}`}
      data-step={revealStep}
      aria-live="polite"
    >
      {!auto ? (
        <div className="takeover__copy">
          {revealStep >= 1 ? (
            <p className="takeover__line takeover__line--a">Tough keeping up?</p>
          ) : null}
          {revealStep >= 2 ? (
            <>
              <p className="takeover__line takeover__line--b">You shouldn&rsquo;t have to.</p>
              <div className="takeover__mark">
                <AirtelSafeMark />
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="auto-hero">
          <span className="auto-hero__wash" aria-hidden="true" />
          <AirtelSafeLogo width={214} mono />
          <p className="auto-hero__line">
            Saves you from all spam calls
            <br />
            and suspicious links.
          </p>
        </div>
      )}
    </div>
  )
}
