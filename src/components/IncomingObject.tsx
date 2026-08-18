import { memo, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { CrossIcon, TickIcon, familyIcon } from '../assets/icons'
import { IncomingTrail } from '../assets/IncomingTrail'
import type { LiveObject } from '../game/types'

type Cue = 'tap' | 'leave' | null

interface Props {
  object: LiveObject
  /** Tutorial hint riding on this object: what to do with it. */
  cue?: Cue
  register: (id: number, el: HTMLDivElement | null) => void
  onDown: (id: number, e: ReactPointerEvent<HTMLDivElement>) => void
  onMove: (id: number, e: ReactPointerEvent<HTMLDivElement>) => void
  onUp: (id: number, e: ReactPointerEvent<HTMLDivElement>) => void
}

const IncomingObjectBase = ({ object: o, cue, register, onDown, onMove, onUp }: Props) => {
  const threat = o.def.trust === 'threat'

  const body: ReactNode = (
    <div className="obj__body">
      <span className="obj__icon">{familyIcon(o.def.family, o.def.trust, 19)}</span>
      <span className="obj__text">
        <span className="obj__label">{o.def.label}</span>
        {o.def.caption ? <span className="obj__caption">{o.def.caption}</span> : null}
      </span>
      {threat ? <span className="obj__tell" aria-hidden="true" /> : null}
      <span className="obj__flag" aria-hidden="true">
        {threat ? <CrossIcon size={13} /> : <TickIcon size={13} />}
      </span>
    </div>
  )

  return (
    <div
      ref={(el) => register(o.id, el)}
      className={`obj${o.broken ? ' is-broken' : ''}${
        o.state === 'absorbing' ? ' is-absorbing' : ''
      }`}
      data-trust={o.def.trust}
      data-family={o.def.family}
      role="button"
      tabIndex={-1}
      aria-label={`${o.def.label} — ${threat ? 'suspicious, tap to remove' : 'genuine, leave it alone'}`}
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
      {o.broken ? (
        /* Split along a diagonal and let the two pieces tumble apart. The
           halves are the same markup clipped differently, so the break always
           matches whatever the sticker actually said. */
        <>
          <div className="obj__half obj__half--a">{body}</div>
          <div className="obj__half obj__half--b" aria-hidden="true">
            {body}
          </div>
          <span className="obj__crack" aria-hidden="true" />
        </>
      ) : (
        <>
          <IncomingTrail tone={threat ? 'threat' : 'genuine'} />
          {cue ? (
            <span className={`cue cue--${cue}`} aria-hidden="true">
              {cue === 'tap' ? (
                <>
                  <span className="cue__ring" />
                  <span className="cue__ring cue__ring--late" />
                  <span className="cue__finger" />
                </>
              ) : null}
              <span className="cue__word">{cue === 'tap' ? 'TAP!' : 'LEAVE IT'}</span>
            </span>
          ) : null}
          {body}
        </>
      )}
    </div>
  )
}

export const IncomingObject = memo(IncomingObjectBase)
