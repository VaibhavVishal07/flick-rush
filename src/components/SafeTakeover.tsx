import { AirtelSafeMark } from '../assets/icons'
import { AirtelShield } from '../assets/AirtelSafeLogo'
import type { Phase } from '../game/types'

import type { AutoTally } from '../game/types'

interface Props {
  phase: Phase
  revealStep: number
  autoTally: AutoTally
}

/**
 * The moment the product does the talking. Paced deliberately: freeze, then
 * the question, then the answer, then the work — and the work is counted out
 * loud, because "automatically" only lands if you can watch it happen.
 */
export const SafeTakeover = ({ phase, revealStep, autoTally }: Props) => {
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
        <div className="auto-banner">
          <p className="auto-banner__head">
            <AirtelShield size={22} />
            <span>
              Airtel Safe is handling it <b>automatically</b>
            </span>
          </p>
          <p className="auto-banner__sub">You&rsquo;re not touching the screen.</p>
          {/* Named categories, not a single "blocked" number — this is the
              claim being spelled out as it happens. */}
          <dl className="auto-banner__tally">
            <div>
              <dt>Spam calls</dt>
              <dd>{autoTally.calls}</dd>
            </div>
            <div>
              <dt>Messages</dt>
              <dd>{autoTally.messages}</dd>
            </div>
            <div>
              <dt>Links</dt>
              <dd>{autoTally.links}</dd>
            </div>
          </dl>
          <p className="auto-banner__foot">
            <b>{autoTally.allowed}</b> genuine calls and messages let straight through
          </p>
        </div>
      )}
    </div>
  )
}
