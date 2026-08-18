import { useEffect, useState } from 'react'
import { recentWinners } from '../game/gameConfig'

/**
 * The rolling "someone just won" strip these campaigns always carry.
 * Reads from a placeholder list until the real feed is wired up.
 */
export const WinnerTicker = () => {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (recentWinners.length < 2) return
    const t = window.setInterval(() => setI((n) => (n + 1) % recentWinners.length), 2600)
    return () => window.clearInterval(t)
  }, [])

  if (!recentWinners.length) return null
  const w = recentWinners[i]

  return (
    <div className="ticker" aria-hidden="true">
      <p key={i} className="ticker__row">
        <b>{w.id}</b> {w.result}
      </p>
    </div>
  )
}
