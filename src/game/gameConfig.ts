/**
 * Every tuning value for Shield Rush lives here.
 * Nothing in /components should hard-code a number that belongs in this file.
 */

export const GAME_CONFIG = {
  /* ---- Timeline (ms) ---------------------------------------------------- */
  /** Manual gameplay, from the end of the countdown to the takeover. */
  GAME_DURATION: 17_000,
  /** Elapsed manual time at which Airtel Safe steps in. */
  TAKEOVER_TIME: 17_000,
  /** How long the automatic sequence runs before the result screen. */
  TAKEOVER_DURATION: 3_200,
  /** Beat structure of the takeover reveal. */
  FREEZE_HOLD: 400,
  REVEAL_LINE_B: 700,
  /** Beat between the second line and Airtel Safe actually taking over. */
  TAKEOVER_ARM: 900,
  /** 3 - 2 - 1 before manual play. */
  COUNTDOWN_FROM: 3,
  COUNTDOWN_STEP: 620,

  /* ---- Arena geometry (px, arena-local) --------------------------------- */
  /** Radius of the device silhouette's hit area. */
  PHONE_RADIUS: 52,
  /** Objects spawn this far beyond the arena edge along their lane. */
  SPAWN_PAD: 44,
  /** Radius at which Airtel Safe knocks a threat back during the takeover. */
  SAFE_FIELD_RADIUS: 118,

  /* ---- Movement --------------------------------------------------------- */
  /** Base homing speed in px per millisecond (≈105 px/s). */
  OBJECT_SPEED: 0.105,
  /** Sideways drift for zig-zagging objects, px/ms at full amplitude. */
  WOBBLE_SPEED: 0.0042,

  /* ---- Interaction ------------------------------------------------------
     Tap is the primary action: one touch anywhere on a sticker deals with
     it. Flicking still works for anyone who swipes out of habit, and throws
     the object along the gesture instead of straight outward.            */
  /** Outward speed given to a tapped object, px/ms. */
  TAP_SPEED: 1.7,
  /** Extra upward kick on a tap, so it arcs rather than sliding out. */
  TAP_LIFT: 0.45,

  /* ---- Flick physics ---------------------------------------------------- */
  /** Minimum drag distance (px) that can count as a flick. */
  FLICK_THRESHOLD: 24,
  /** Minimum release speed (px/ms) that counts as a flick. */
  FLICK_VELOCITY: 0.3,
  /** Release velocity is multiplied by this before launch. */
  FLICK_BOOST: 1.8,
  /** Hard cap so a violent swipe can't teleport an object. */
  FLICK_MAX_SPEED: 4.4,
  /** Velocity decay per ms once airborne (1 = no drag). */
  FLICK_DRAG: 0.9993,
  /** Downward pull on anything airborne, px/ms². Makes throws arc. */
  FLICK_GRAVITY: 0.0016,
  /** How fast a broken object fades out, opacity per ms. */
  BREAK_FADE: 0.0027,
  /** How fast a broken object shrinks. */
  BREAK_SHRINK: 0.0011,
  /** Scale a sticker jumps to while held. */
  GRAB_SCALE: 1.14,
  /**
   * Hitstop: milliseconds a struck object crawls before it rockets away.
   * Without it the throw is so fast the break never becomes visible — the
   * sticker is off-screen before the halves have separated.
   */
  HITSTOP: 95,
  /** Fraction of the launch velocity applied during hitstop. */
  HITSTOP_DRAG: 0.12,
  /** How fast a genuine item is drawn into the phone, fraction per ms. */
  ABSORB_PULL: 0.011,
  /** How fast it shrinks and fades on the way in. */
  ABSORB_SHRINK: 0.0028,
  ABSORB_FADE: 0.0032,
  /** Spin imparted per px/ms of release speed, in deg/ms. Kept low —
   *  a tumbling chip is unreadable, and unreadable reads as sloppy. */
  FLICK_SPIN: 0.16,
  /** Window (ms) of pointer samples used to measure release velocity. */
  VELOCITY_WINDOW: 90,
  /** Knock-back speed Airtel Safe applies during the takeover. */
  AUTO_KNOCKBACK: 2.6,
  /** Spin on an automatically knocked-back object, deg/ms. */
  AUTO_SPIN: 0.3,

  /* ---- Scoring ---------------------------------------------------------- */
  BLOCK_POINTS: 10,
  SAFE_POINTS: 5,
  MISS_PENALTY: -5,
  WRONG_FLICK_PENALTY: -15,

  /* ---- Streaks ---------------------------------------------------------- */
  STREAK_TIERS: [
    { at: 3, label: 'NICE' },
    { at: 5, label: 'ON A ROLL' },
    { at: 8, label: 'UNBOTHERED' },
  ],
} as const

/* ---- Difficulty stages --------------------------------------------------- */

export interface Stage {
  name: string
  /** Stage owns manual time up to this elapsed ms. */
  until: number
  /** Milliseconds between spawns. */
  spawnInterval: number
  /** Speed multiplier applied to every object spawned in this stage. */
  speed: number
  /** Never exceed this many live objects. */
  maxAlive: number
  /** Share of spawns that are threats. */
  threatRatio: number
  /** Object type ids this stage is allowed to spawn. */
  pool: string[]
}

const EARLY = ['spam-call', 'spam-sms']
const MID = ['spam-call', 'spam-sms', 'suspicious-link', 'unknown-caller']
const ALL = [
  'spam-call',
  'spam-sms',
  'suspicious-link',
  'unknown-caller',
  'fake-reward',
  'risky-message',
]

export const STAGES: Stage[] = [
  // 1 — Learn. One at a time, almost all threats, unmissable.
  {
    name: 'Learn',
    until: 4_000,
    spawnInterval: 1_400,
    speed: 1,
    maxAlive: 1,
    threatRatio: 0.9,
    pool: EARLY,
  },
  // 2 — Rush. Genuine objects join in; occasionally two at once.
  {
    name: 'Rush',
    until: 10_000,
    spawnInterval: 900,
    speed: 1.24,
    maxAlive: 2,
    threatRatio: 0.66,
    pool: MID,
  },
  // 3 — Chaos. Three or four in the air, faster, every type in play.
  {
    name: 'Chaos',
    until: 15_000,
    spawnInterval: 620,
    speed: 1.52,
    maxAlive: 4,
    threatRatio: 0.62,
    pool: ALL,
  },
  // 4 — Impossible. Deliberately more than one pair of hands can track.
  {
    name: 'Impossible',
    until: 17_000,
    spawnInterval: 300,
    speed: 1.9,
    maxAlive: 7,
    threatRatio: 0.68,
    pool: ALL,
  },
]

/* ---- Personalisation placeholder ---------------------------------------- */

export interface SafetyReport {
  totalHandled: number
  spamCalls: number
  spamMessages: number
  suspiciousLinks: number
}

/**
 * Stand-in for the real Airtel Safe weekly summary.
 * Set to `null` to see the generic ingress copy.
 * When present the ingress is personalised and the spawn mix leans towards
 * the categories this user actually gets hit with.
 */
export const safetyReport: SafetyReport | null = {
  totalHandled: 18,
  spamCalls: 7,
  spamMessages: 6,
  suspiciousLinks: 5,
}
