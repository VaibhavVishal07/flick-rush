import { AirtelSafeMark } from '../assets/icons'
import type { Phase } from '../game/types'

interface Props {
  phase: Phase
  revealStep: number
}

/**
 * The moment the product does the talking. Deliberately paced:
 * freeze → question → answer → automation.
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
        <div className="takeover__status">
          <AirtelSafeMark compact />
          <span className="takeover__status-text">Handling it automatically</span>
        </div>
      )}
    </div>
  )
}
