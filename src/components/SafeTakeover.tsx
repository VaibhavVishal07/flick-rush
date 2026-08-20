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
  /**
   * The lockup mounts once, on "You shouldn't have to.", and is the *same*
   * DOM node through the automation that follows — no key, no remount, so it
   * rises into place once and then simply stays there while the phase flips
   * underneath it. The result screen puts its mark on the same line at the
   * same size, so the mark holds still across all three screens.
   */
  const marked = auto || revealStep >= 3

  return (
    <div
      className={`takeover${auto ? ' takeover--auto' : ''}`}
      data-step={revealStep}
      aria-live="polite"
    >
      {/* The answer arrives with the mark and then stays put — the same node
          through the automation, so the two questions above it fall away and
          the line that answers them does not move. */}
      {marked ? (
        <div className="auto-hero">
          <AirtelSafeLogo width={214} mono />
          <p className="auto-hero__line">Airtel Safe does all this automatically.</p>
        </div>
      ) : null}

      {!auto && revealStep < 3 ? (
        <div className="takeover__copy">
          {revealStep >= 1 ? (
            <p className="takeover__line takeover__line--a">Couldn&rsquo;t keep up?</p>
          ) : null}
          {revealStep >= 2 ? (
            <p className="takeover__line takeover__line--b">No worries.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
