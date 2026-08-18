import type { StreakBadgeState } from '../game/useGameEngine'

export const StreakBadge = ({ badge }: { badge: StreakBadgeState | null }) => {
  if (!badge) return null
  return (
    <div key={badge.key} className="streak" role="status">
      <span className="streak__label">{badge.label}</span>
      <span className="streak__count">×{badge.count}</span>
    </div>
  )
}
