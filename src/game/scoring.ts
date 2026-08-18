import { GAME_CONFIG } from './gameConfig'
import type { Tally, Verdict } from './types'

export const emptyTally = (): Tally => ({
  blocked: 0,
  missed: 0,
  safe: 0,
  oops: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
})

export const POINTS: Record<Verdict, number> = {
  blocked: GAME_CONFIG.BLOCK_POINTS,
  safe: GAME_CONFIG.SAFE_POINTS,
  missed: GAME_CONFIG.MISS_PENALTY,
  oops: GAME_CONFIG.WRONG_FLICK_PENALTY,
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  blocked: 'BLOCKED',
  safe: 'SAFE',
  missed: 'MISSED',
  oops: 'OOPS',
}

export const applyVerdict = (t: Tally, verdict: Verdict): Tally => {
  const next: Tally = { ...t }
  next[verdict] += 1
  next.score = Math.max(0, next.score + POINTS[verdict])

  // Only threats you flick away build a streak; a wrong flick ends it.
  if (verdict === 'blocked') {
    next.streak = t.streak + 1
    next.bestStreak = Math.max(t.bestStreak, next.streak)
  } else if (verdict === 'oops' || verdict === 'missed') {
    next.streak = 0
  }
  return next
}

export const streakTier = (streak: number) => {
  let tier: { at: number; label: string } | null = null
  for (const t of GAME_CONFIG.STREAK_TIERS) if (streak >= t.at) tier = t
  return tier
}

/** Correct decisions out of every object that resolved during manual play. */
export const correctOf = (t: Tally) => t.blocked + t.safe
export const totalOf = (t: Tally) => t.blocked + t.safe + t.missed + t.oops
