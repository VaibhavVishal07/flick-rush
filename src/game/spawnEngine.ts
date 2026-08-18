import { GAME_CONFIG, STAGES, safetyReport, type Stage } from './gameConfig'
import { GENUINE_IDS, getDef, type ObjectDef } from './objectTypes'
import type { LiveObject } from './types'

let nextId = 1

export const stageAt = (elapsed: number): Stage =>
  STAGES.find((s) => elapsed < s.until) ?? STAGES[STAGES.length - 1]

/**
 * Category bias from the (mocked) Safety Report. If a user's week was mostly
 * spam calls, the game should feel mostly like spam calls.
 */
const personalWeight = (def: ObjectDef): number => {
  if (!safetyReport || def.trust !== 'threat') return 1
  const { spamCalls, spamMessages, suspiciousLinks } = safetyReport
  const total = spamCalls + spamMessages + suspiciousLinks || 1
  const share =
    def.family === 'call'
      ? spamCalls / total
      : def.family === 'sms'
        ? spamMessages / total
        : def.family === 'link'
          ? suspiciousLinks / total
          : 1 / 3
  // Soft bias — never let personalisation starve a whole category.
  return 0.6 + share * 1.2
}

const pickWeighted = (ids: string[]): ObjectDef => {
  const defs = ids.map(getDef)
  const weights = defs.map((d) => d.weight * personalWeight(d))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < defs.length; i++) {
    r -= weights[i]
    if (r <= 0) return defs[i]
  }
  return defs[defs.length - 1]
}

/**
 * The eight approach lanes, in radians, starting at the top and going
 * clockwise: 0 = top, 1 = top-right, 2 = right, and so on.
 */
const LANES = Array.from({ length: 8 }, (_, i) => -Math.PI / 2 + (i * Math.PI) / 4)

/**
 * Spawn just beyond the arena edge along the lane's ray — not on an ellipse.
 * An ellipse puts diagonal lanes *inside* a portrait arena, which makes
 * objects pop into existence on screen instead of flying in.
 *
 * `reach` < 1 starts the object closer in (used by the tutorial, where waiting
 * three seconds for the first threat would be a terrible first impression).
 */
export const spawnPosition = (
  w: number,
  h: number,
  laneIndex: number,
  reach = 1,
): { x: number; y: number } => {
  const cx = w / 2
  const cy = h / 2
  const angle = LANES[laneIndex % LANES.length] + (Math.random() - 0.5) * 0.28
  const ux = Math.cos(angle)
  const uy = Math.sin(angle)
  // Distance from centre to the arena edge along this ray.
  const edge = Math.min(
    Math.abs(ux) < 1e-4 ? Infinity : cx / Math.abs(ux),
    Math.abs(uy) < 1e-4 ? Infinity : cy / Math.abs(uy),
  )
  const r = (edge + GAME_CONFIG.SPAWN_PAD) * reach
  return { x: cx + ux * r, y: cy + uy * r }
}

export const makeObject = (
  def: ObjectDef,
  w: number,
  h: number,
  laneIndex: number,
  stageSpeed: number,
  now: number,
  reach = 1,
): LiveObject => {
  const { x, y } = spawnPosition(w, h, laneIndex, reach)
  return {
    id: nextId++,
    def,
    x,
    y,
    vx: 0,
    vy: 0,
    rot: 0,
    vrot: 0,
    scale: 1,
    opacity: 1,
    state: 'incoming',
    speed: stageSpeed,
    phase: Math.random() * Math.PI * 2,
    spawnedAt: now,
    auto: false,
    broken: false,
    hitstop: 0,
  }
}

/**
 * Keeps successive spawns spread around the phone rather than stacked in one
 * corner — the difference between "busy" and "unreadable".
 */
export class LaneRotator {
  private cursor = Math.floor(Math.random() * 8)

  next(): number {
    // Step by 3 lanes (co-prime with 8) then jitter, so we cycle every lane
    // but never in an obvious clockwise sweep.
    this.cursor = (this.cursor + 3 + (Math.random() < 0.35 ? 1 : 0)) % 8
    return this.cursor
  }
}

export const pickForStage = (stage: Stage, forceGenuine = false): ObjectDef => {
  const wantThreat = !forceGenuine && Math.random() < stage.threatRatio
  return wantThreat ? pickWeighted(stage.pool) : pickWeighted(GENUINE_IDS)
}
