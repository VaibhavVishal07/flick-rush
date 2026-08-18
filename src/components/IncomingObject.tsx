import { memo, type PointerEvent as ReactPointerEvent } from 'react'
import { familyIcon } from '../assets/icons'
import { IncomingTrail } from '../assets/IncomingTrail'
import type { LiveObject } from '../game/types'

interface Props {
  object: LiveObject
  /** Show the tutorial flick hint riding on this object. */
  cue?: boolean
  register: (id: number, el: HTMLDivElement | null) => void
  onDown: (id: number, e: ReactPointerEvent<HTMLDivElement>) => void
  onMove: (id: number, e: ReactPointerEvent<HTMLDivElement>) => void
  onUp: (id: number, e: ReactPointerEvent<HTMLDivElement>) => void
}

const IncomingObjectBase = ({ object: o, cue, register, onDown, onMove, onUp }: Props) => {
  const threat = o.def.trust === 'threat'
  return (
    <div
      ref={(el) => register(o.id, el)}
      className="obj"
      data-trust={o.def.trust}
      data-family={o.def.family}
      role="button"
      tabIndex={-1}
      aria-label={`${o.def.label} — ${threat ? 'suspicious, flick it away' : 'genuine, let it through'}`}
      style={{
        transform: `translate3d(${o.x}px, ${o.y}px, 0) translate(-50%, -50%) scale(${o.scale})`,
        // Heavier objects sit a touch larger and cast a deeper shadow.
        ['--heft' as string]: o.def.heft,
      }}
      onPointerDown={(e) => onDown(o.id, e)}
      onPointerMove={(e) => onMove(o.id, e)}
      onPointerUp={(e) => onUp(o.id, e)}
      onPointerCancel={(e) => onUp(o.id, e)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <IncomingTrail tone={threat ? 'threat' : 'genuine'} />
      {cue ? (
        <span className="cue" aria-hidden="true">
          <span className="cue__dot" />
        </span>
      ) : null}
      <div className="obj__body">
        <span className="obj__icon">{familyIcon(o.def.family, o.def.trust, 19)}</span>
        <span className="obj__text">
          <span className="obj__label">{o.def.label}</span>
          {o.def.caption ? <span className="obj__caption">{o.def.caption}</span> : null}
        </span>
      </div>
    </div>
  )
}

export const IncomingObject = memo(IncomingObjectBase)
