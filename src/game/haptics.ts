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
  /** Threat flicked away — short and light. */
  block: () => buzz(12),
  /** Genuine item flicked by mistake — a different, doubled shape. */
  wrong: () => buzz([16, 40, 16]),
  /** Threat got through — one blunt impact. */
  miss: () => buzz(28),
  /** Airtel Safe steps in — one confident pulse. */
  takeover: () => buzz([26, 60, 60]),
  /** Streak milestone. */
  streak: () => buzz([8, 30, 8]),
}
