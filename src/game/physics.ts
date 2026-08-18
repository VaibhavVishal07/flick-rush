import { GAME_CONFIG } from './gameConfig'
import type { LiveObject } from './types'

export interface Vec {
  x: number
  y: number
}

export interface Sample extends Vec {
  t: number
}

export const dist = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(bx - ax, by - ay)

export const clampMagnitude = (v: Vec, max: number): Vec => {
  const m = Math.hypot(v.x, v.y)
  if (m <= max || m === 0) return v
  const k = max / m
  return { x: v.x * k, y: v.y * k }
}

/**
 * Release velocity, measured over the last VELOCITY_WINDOW ms of pointer
 * samples. Using a window rather than the final two events keeps a jittery
 * last frame from throwing the whole flick off.
 */
export const releaseVelocity = (samples: Sample[]): Vec => {
  if (samples.length < 2) return { x: 0, y: 0 }
  const last = samples[samples.length - 1]
  let first = samples[0]
  for (let i = samples.length - 1; i >= 0; i--) {
    first = samples[i]
    if (last.t - samples[i].t >= GAME_CONFIG.VELOCITY_WINDOW) break
  }
  const dt = last.t - first.t
  if (dt <= 0) return { x: 0, y: 0 }
  return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt }
}

/** Homing step: drift toward the phone, with an optional sideways weave. */
export const stepIncoming = (
  o: LiveObject,
  cx: number,
  cy: number,
  dt: number,
  now: number,
  reducedMotion: boolean,
) => {
  const dx = cx - o.x
  const dy = cy - o.y
  const d = Math.hypot(dx, dy) || 1
  const ux = dx / d
  const uy = dy / d
  const speed = GAME_CONFIG.OBJECT_SPEED * o.def.speed * o.speed

  let px = 0
  let py = 0
  if (o.def.wobble > 0 && !reducedMotion) {
    const amp =
      o.def.wobble * GAME_CONFIG.WOBBLE_SPEED * Math.sin(now * 0.006 + o.phase)
    px = -uy * amp
    py = ux * amp
  }

  o.x += (ux * speed + px) * dt
  o.y += (uy * speed + py) * dt
  // A slow lean in the direction of travel — reads as weight, not spin.
  o.rot += (o.def.wobble ? Math.sin(now * 0.004 + o.phase) * 0.012 : 0) * dt
}

/**
 * Ballistic step for anything flicked or knocked back. Gravity is what makes
 * a throw read as a throw — without it everything slides off in a straight
 * line and the whole gesture feels weightless.
 */
export const stepFlicked = (o: LiveObject, dt: number) => {
  // Hitstop — the object barely moves while the break plays, then goes.
  if (o.hitstop > 0) {
    const k = GAME_CONFIG.HITSTOP_DRAG
    o.hitstop = Math.max(0, o.hitstop - dt)
    o.x += o.vx * dt * k
    o.y += o.vy * dt * k
    o.rot += o.vrot * dt * k
    return
  }

  const decay = Math.pow(GAME_CONFIG.FLICK_DRAG, dt)
  o.vx *= decay
  o.vy *= decay
  o.vy += GAME_CONFIG.FLICK_GRAVITY * dt
  o.x += o.vx * dt
  o.y += o.vy * dt
  o.rot += o.vrot * dt

  if (o.broken) {
    o.scale = Math.max(0.42, o.scale - dt * GAME_CONFIG.BREAK_SHRINK)
    o.opacity = Math.max(0, o.opacity - dt * GAME_CONFIG.BREAK_FADE)
  } else {
    o.scale = Math.max(0.5, o.scale - dt * 0.0006)
    o.opacity = Math.max(0, o.opacity - dt * 0.0022)
  }
}

/** Turn a measured release into a launch, boosted and capped. */
export const launch = (o: LiveObject, v: Vec) => {
  const boosted = clampMagnitude(
    { x: v.x * GAME_CONFIG.FLICK_BOOST, y: v.y * GAME_CONFIG.FLICK_BOOST },
    GAME_CONFIG.FLICK_MAX_SPEED,
  )
  o.vx = boosted.x
  o.vy = boosted.y
  const speed = Math.hypot(boosted.x, boosted.y)
  o.vrot = (o.vx >= 0 ? 1 : -1) * speed * GAME_CONFIG.FLICK_SPIN
  o.state = 'flicked'
  o.broken = true
  o.hitstop = GAME_CONFIG.HITSTOP
  // A struck object jumps before it shrinks — the punch you feel on release.
  o.scale = 1.2
}

/** Airtel Safe's knock-back: straight out from the phone, fast and certain. */
export const knockBack = (o: LiveObject, cx: number, cy: number) => {
  const dx = o.x - cx
  const dy = o.y - cy
  const d = Math.hypot(dx, dy) || 1
  o.vx = (dx / d) * GAME_CONFIG.AUTO_KNOCKBACK
  o.vy = (dy / d) * GAME_CONFIG.AUTO_KNOCKBACK
  o.vrot = (dx >= 0 ? 1 : -1) * GAME_CONFIG.AUTO_SPIN
  o.state = 'flicked'
  o.auto = true
  o.broken = true
  o.hitstop = GAME_CONFIG.HITSTOP * 0.6
  o.scale = 1.2
}

export const isOffstage = (o: LiveObject, w: number, h: number) =>
  o.opacity <= 0.02 ||
  o.x < -160 ||
  o.x > w + 160 ||
  o.y < -160 ||
  o.y > h + 160
