/** Feature-detected haptics. Silently inert on desktop and iOS Safari. */

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
  /** The instant a sticker is picked up. Barely there, but you feel it. */
  grab: () => buzz(6),
  /** Threat flicked away — a short double tick, so it reads as a break. */
  block: () => buzz([9, 22, 14]),
  /** Genuine item flicked by mistake — a different, doubled shape. */
  wrong: () => buzz([16, 40, 16]),
  /** Threat got through — one blunt impact. */
  miss: () => buzz(28),
  /** Airtel Safe steps in — one confident pulse. */
  takeover: () => buzz([26, 60, 60]),
  /** Streak milestone. */
  streak: () => buzz([8, 30, 8]),
}
