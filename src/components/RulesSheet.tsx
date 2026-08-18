import { AirtelSafeMark, ContactIcon, ShieldMark, ThreatCallIcon } from '../assets/icons'
import { GAME_CONFIG } from '../game/gameConfig'

const RULES = [
  {
    icon: <ThreatCallIcon size={19} />,
    tone: 'threat' as const,
    title: 'Flick the ✕ ones away',
    body: `Spam calls, dodgy links, fake rewards. Hard-edged, jittery, marked with a cross. Swipe them off before they reach your phone. +${GAME_CONFIG.BLOCK_POINTS} each.`,
  },
  {
    icon: <ContactIcon size={19} />,
    tone: 'good' as const,
    title: 'Let the ✓ ones through',
    body: `Mom calling, a delivery update, a genuine OTP. Rounded, calm, marked with a tick. Leave them alone and they land safely. +${GAME_CONFIG.SAFE_POINTS} each.`,
  },
  {
    icon: <ShieldMark size={19} />,
    tone: 'brand' as const,
    title: 'Then stop trying',
    body: 'After 17 seconds Airtel Safe takes over and handles every one of them, automatically.',
  },
]

export const RulesSheet = ({ onClose }: { onClose: () => void }) => (
  <div className="sheet" role="dialog" aria-modal="true" aria-label="How to play">
    <button type="button" className="sheet__scrim" onClick={onClose} aria-label="Close" />
    <div className="sheet__panel">
      <h2 className="sheet__title">How to play</h2>

      <ul className="rules">
        {RULES.map((r) => (
          <li key={r.title} className="rules__row" data-tone={r.tone}>
            <span className="rules__icon">{r.icon}</span>
            <div>
              <p className="rules__title">{r.title}</p>
              <p className="rules__body">{r.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* The streak ladder lives here rather than on the ingress — it is a
          reward for a mechanic the player has not met yet. */}
      <div className="stations">
        <p className="stations__label">
          Streak
          <br />
          bonus
        </p>
        <ol className="stations__list">
          {GAME_CONFIG.STREAK_TIERS.map((t) => (
            <li key={t.at}>
              <span className="stations__count">×{t.at}</span>
              <span className="stations__name">{t.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="sheet__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Got it
        </button>
      </div>

      <div className="sheet__brand">
        <AirtelSafeMark compact />
      </div>
    </div>
  </div>
)
