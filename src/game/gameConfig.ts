/**
 * Every tuning value for Spam Smash lives here.
 * Nothing in /components should hard-code a number that belongs in this file.
 */

export const GAME_CONFIG = {
  /* ---- Timeline (ms) ---------------------------------------------------- */
  /** Manual gameplay, from the end of the countdown to the takeover. */
  GAME_DURATION: 17_000,
  /** Elapsed manual time at which Airtel Safe steps in. */
  TAKEOVER_TIME: 17_000,
  /** How long the automatic sequence runs before the result screen. */
  TAKEOVER_DURATION: 5_200,
  /**
   * The tail of that window stops spawning, so the field clears and the
   * banner rests on its final numbers. The arc is meant to end calm, not to
   * cut away mid-chaos.
   */
  TAKEOVER_HOLD: 1_200,
  /** Beat structure of the takeover reveal. */
  FREEZE_HOLD: 400,
  REVEAL_LINE_B: 700,
  /**
   * The pair sits together for this long before the answer replaces it. Long
   * enough to read both, since they leave when the answer arrives.
   */
  REVEAL_LINE_C: 1_200,
  /**
   * Beat between the second line and Airtel Safe actually taking over. Two
   * full seconds: this is the turn of the whole piece, and it was gone before
   * anyone had finished reading it.
   */
  TAKEOVER_ARM: 2_000,
  /** 3 - 2 - 1 before manual play. */
  COUNTDOWN_FROM: 3,
  COUNTDOWN_STEP: 620,

  /* ---- Arena geometry (px, arena-local) --------------------------------- */
  /** Radius of the device silhouette's hit area. */
  PHONE_RADIUS: 60,
  /** Objects spawn this far beyond the arena edge along their lane. */
  SPAWN_PAD: 44,
  /** Radius at which Airtel Safe knocks a threat back during the takeover. */
  SAFE_FIELD_RADIUS: 168,
  /**
   * During the takeover the phone becomes the hero: bigger, dropped into the
   * lower half and cropped by the bottom of the screen. The collision centre
   * has to move with it, or objects would converge on empty space.
   */
  AUTO_TARGET_Y: 0.78,
  /** Collision radius of the hero device. */
  AUTO_PHONE_RADIUS: 96,

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
  BREAK_FADE: 0.0020,
  /** How fast a broken object shrinks. */
  BREAK_SHRINK: 0.0005,
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
    until: 3_500,
    spawnInterval: 1_250,
    speed: 1,
    maxAlive: 1,
    threatRatio: 0.9,
    pool: EARLY,
  },
  // 2 — Rush. Genuine items join in; occasionally two at once.
  {
    name: 'Rush',
    until: 8_500,
    spawnInterval: 800,
    speed: 1.3,
    maxAlive: 2,
    threatRatio: 0.66,
    pool: MID,
  },
  // 3 — Chaos. Three or four in the air, faster, every type in play.
  {
    name: 'Chaos',
    until: 12_500,
    spawnInterval: 520,
    speed: 1.62,
    maxAlive: 4,
    threatRatio: 0.62,
    pool: ALL,
  },
  // 4 — Swarm. More than one pair of eyes can track.
  {
    name: 'Swarm',
    until: 15_000,
    spawnInterval: 300,
    speed: 2,
    maxAlive: 8,
    threatRatio: 0.68,
    pool: ALL,
  },
  // 5 — Flood. The last two seconds are not winnable, and that is the whole
  // argument. Everything arrives at once so "Tough keeping up?" lands on a
  // player who has already stopped coping.
  {
    name: 'Flood',
    until: 17_000,
    spawnInterval: 150,
    speed: 2.5,
    maxAlive: 14,
    threatRatio: 0.72,
    pool: ALL,
  },
]

/** Elapsed time after which the arena visibly starts to panic. */
export const PANIC_FROM = 12_500

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
