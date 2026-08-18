import { useMemo } from 'react'
import type { Burst } from '../game/types'

const COUNT = 12

/** Confetti palettes — a block should feel like a party popper, not an alert. */
const PALETTE: Record<Burst['tone'], string[]> = {
  threat: ['#FF3B5C', '#FF8A3D', '#FFC531', '#FFFFFF', '#FF6B9D'],
  genuine: ['#22C55E', '#38BDF8', '#A7F3D0', '#FFFFFF', '#FDE68A'],
  safe: ['#E8112D', '#FF4A5E', '#FFD75E', '#FFFFFF', '#38BDF8'],
}

/**
 * A short-lived spray of CSS confetti — dots and bars, mixed colours, each
 * one spinning off on its own arc. Removed by the engine after ~600ms.
 */
export const ParticleBurst = ({ burst }: { burst: Burst }) => {
  const colours = PALETTE[burst.tone]
  const shards = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.45
        const reach = 38 + Math.random() * 38
        const bar = i % 3 === 0
        return {
          dx: Math.cos(angle) * reach,
          dy: Math.sin(angle) * reach,
          delay: Math.random() * 50,
          spin: `${Math.round((Math.random() - 0.5) * 540)}deg`,
          w: bar ? 4 : 5 + Math.random() * 4,
          h: bar ? 11 : 5 + Math.random() * 4,
          shape: bar ? 'bar' : 'dot',
          colour: colours[i % colours.length],
        }
      }),
    [colours],
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
          data-shape={s.shape}
          style={
            {
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
              '--delay': `${s.delay}ms`,
              '--spin': s.spin,
              '--shard': s.colour,
              width: s.w,
              height: s.h,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
