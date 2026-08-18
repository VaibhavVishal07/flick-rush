import { useMemo } from 'react'
import type { Burst } from '../game/types'

const COUNT = 8

/**
 * A short-lived spray of CSS particles. Cheap, native, and removed by the
 * engine after ~600ms.
 */
export const ParticleBurst = ({ burst }: { burst: Burst }) => {
  const shards = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.5
        const reach = 34 + Math.random() * 30
        return {
          dx: Math.cos(angle) * reach,
          dy: Math.sin(angle) * reach,
          delay: Math.random() * 40,
          size: 3 + Math.random() * 3.5,
        }
      }),
    [],
  )

  return (
    <div
      className={`burst burst--${burst.tone}`}
      style={{ left: burst.x, top: burst.y }}
      aria-hidden="true"
    >
      <span className="burst__ring" />
      {shards.map((s, i) => (
        <span
          key={i}
          className="burst__shard"
          style={
            {
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
              '--delay': `${s.delay}ms`,
              width: s.size,
              height: s.size,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
