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
      {/* The mark arrives with the automation, not before it — the reveal is
          three lines of type and nothing else, and the mark landing as the
          field starts clearing is a stronger beat than it landing over copy.
          Rising over the stack it also had nowhere to go on a short screen:
          at 320x540 the two were a pixel apart.
          It mounts once here and holds the line the result screen puts its
          own mark on, so the mark is still across both. */}
      {auto ? (
        <div className="auto-hero">
          <AirtelSafeLogo width={214} mono />
          <p className="auto-hero__line">Airtel Safe does all this automatically.</p>
        </div>
      ) : null}

      {/* Two beats, then the screen clears and the answer has it to itself.
          The question and the answer to it do not share a frame. */}
      {!auto ? (
        <div className="takeover__copy">
          {revealStep < 3 ? (
            <>
              {revealStep >= 1 ? (
                <p className="takeover__line takeover__line--a">Couldn&rsquo;t keep up?</p>
              ) : null}
              {revealStep >= 2 ? (
                <p className="takeover__line takeover__line--b">No worries.</p>
              ) : null}
            </>
          ) : (
            <>
              <span className="takeover__mark">
                <AirtelSafeLogo width={214} mono />
              </span>
              <p className="takeover__line takeover__line--c">
                Airtel Safe does all this automatically.
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
