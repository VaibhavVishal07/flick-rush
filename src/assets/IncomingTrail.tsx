/**
 * A faint motion trail behind an incoming object. Pure CSS, no canvas.
 * Rotated by the caller so it always sits behind the direction of travel.
 */
export const IncomingTrail = ({ tone }: { tone: 'threat' | 'genuine' }) => (
  <span className={`trail trail--${tone}`} aria-hidden="true" />
)
