import type { ObjectDef } from './objectTypes'

export type ObjectState = 'incoming' | 'held' | 'flicked' | 'absorbing' | 'gone'

export interface LiveObject {
  id: number
  def: ObjectDef
  /** Arena-local centre position, px. */
  x: number
  y: number
  /** px per ms — only meaningful once flicked. */
  vx: number
  vy: number
  rot: number
  vrot: number
  scale: number
  opacity: number
  state: ObjectState
  /** Stage speed multiplier baked in at spawn. */
  speed: number
  /** Random phase so wobbling objects don't move in lockstep. */
  phase: number
  spawnedAt: number
  /** True once Airtel Safe (not the player) dealt with it. */
  auto: boolean
  /** Flicked hard enough to come apart — renders as two tumbling halves. */
  broken: boolean
  /** Milliseconds of hitstop left before the throw takes over. */
  hitstop: number
}

export type Verdict = 'blocked' | 'missed' | 'safe' | 'oops'

export interface Feedback {
  id: number
  kind: Verdict | 'auto-blocked' | 'auto-allowed'
  x: number
  y: number
  label: string
  points?: number
  bornAt: number
}

export interface Burst {
  id: number
  x: number
  y: number
  tone: 'threat' | 'genuine' | 'safe'
  bornAt: number
}

export type Phase =
  | 'tutorial-threat'
  | 'tutorial-genuine'
  | 'tutorial-done'
  | 'countdown'
  | 'play'
  | 'freeze'
  | 'reveal'
  | 'auto'
  | 'finished'

export interface Tally {
  blocked: number
  missed: number
  safe: number
  oops: number
  score: number
  streak: number
  bestStreak: number
}

export interface GameResult {
  score: number
  correct: number
  total: number
  bestStreak: number
  autoHandled: number
}
