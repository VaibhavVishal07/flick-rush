/**
 * Feature-detected haptics.
 *
 * Silently inert wherever `navigator.vibrate` is missing — which is every
 * desktop browser and, notably, iOS Safari: Apple has never shipped the
 * Vibration API, so there is no way for a web page to buzz an iPhone. On
 * Android Chrome and other Chromium mobile browsers these all fire.
 *
 * Deliberately NOT gated on the sound toggle. Muting is what you do in a
 * meeting or on a train — exactly when the vibration is the only feedback
 * left — so killing haptics along with audio had it backwards.
 */

const supported = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

let enabled = true

export const setHapticsEnabled = (on: boolean) => {
  enabled = on
}

const buzz = (pattern: number | number[]) => {
  if (!enabled || !supported()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* no-op */
  }
}

export const haptics = {
  /** Any button, anywhere. The lightest thing the API can do. */
  tap: () => buzz(8),
  /** One countdown number. */
  tick: () => buzz(12),
  /** "Go" — the same shape as a tick, twice as sure of itself. */
  go: () => buzz([18, 40, 18]),
  /** The field goes quiet under Airtel Safe. */
  settle: () => buzz([14, 70, 22]),
  /** The instant a sticker is picked up. Barely there, but you feel it. */
  grab: () => buzz(6),
  /** Threat flicked away — a short double tick, so it reads as a break. */
  block: () => buzz([9, 22, 14]),
  /** A genuine call landing safely — softer and rounder than a block. */
  safe: () => buzz(10),
  /** Genuine item flicked by mistake — a different, doubled shape. */
  wrong: () => buzz([16, 40, 16]),
  /** Threat got through — one blunt impact. */
  miss: () => buzz(28),
  /** Airtel Safe steps in — one confident pulse. */
  takeover: () => buzz([26, 60, 60]),
  /** Streak milestone. */
  streak: () => buzz([8, 30, 8]),
}
