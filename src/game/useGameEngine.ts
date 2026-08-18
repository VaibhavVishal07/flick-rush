import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { GAME_CONFIG, PANIC_FROM } from './gameConfig'
import { getDef } from './objectTypes'
import { LaneRotator, makeObject, pickForStage, stageAt } from './spawnEngine'
import {
  applyVerdict,
  correctOf,
  emptyTally,
  POINTS,
  streakTier,
  totalOf,
  VERDICT_LABEL,
} from './scoring'
import {
  dist,
  isOffstage,
  knockBack,
  launch,
  releaseVelocity,
  stepAbsorbing,
  stepFlicked,
  stepIncoming,
  type Sample,
} from './physics'
import { audio } from './audio'
import { haptics } from './haptics'
import type {
  AutoTally,
  Burst,
  Feedback,
  GameResult,
  LiveObject,
  Phase,
  Tally,
  Verdict,
} from './types'

const FEEDBACK_LIFE = 900
const BURST_LIFE = 640
const AUTO_SPAWN_INTERVAL = 185
const AUTO_MAX_ALIVE = 9
const AUTO_SPEED = 2.5
const TUTORIAL_SPEED = 0.85
/** The tutorial starts objects closer in so the first beat lands fast. */
const TUTORIAL_REACH = 0.72
const TUTORIAL_GAP = 300

export interface StreakBadgeState {
  key: number
  label: string
  count: number
}

interface Options {
  onFinish: (result: GameResult) => void
  reducedMotion: boolean
  /** Replays go straight to the countdown — nobody wants the tutorial twice. */
  skipTutorial: boolean
}

export const useGameEngine = ({ onFinish, reducedMotion, skipTutorial }: Options) => {
  const arenaRef = useRef<HTMLDivElement | null>(null)
  const elMap = useRef(new Map<number, HTMLDivElement>())
  const objectsRef = useRef<LiveObject[]>([])
  const size = useRef({ w: 390, h: 560 })
  const lanes = useMemo(() => new LaneRotator(), [])

  const startPhase: Phase = skipTutorial ? 'countdown' : 'tutorial-threat'
  const phaseRef = useRef<Phase>(startPhase)
  const revealRef = useRef(0)
  const tallyRef = useRef<Tally>(emptyTally())
  const elapsed = useRef(0)
  const autoElapsed = useRef(0)
  const spawnClock = useRef(0)
  const gateAt = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const rafRef = useRef(0)
  const lastFrame = useRef(0)
  const finishedRef = useRef(false)
  const touchedOnce = useRef(false)
  const uid = useRef(1)

  const [, bump] = useState(0)
  const rerender = useCallback(() => bump((v) => v + 1), [])

  const [phase, setPhase] = useState<Phase>(startPhase)
  const [tally, setTally] = useState<Tally>(emptyTally())
  const [secondsLeft, setSecondsLeft] = useState(
    Math.round(GAME_CONFIG.GAME_DURATION / 1000),
  )
  const [countdown, setCountdown] = useState<number>(GAME_CONFIG.COUNTDOWN_FROM)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [bursts, setBursts] = useState<Burst[]>([])
  const [streakBadge, setStreakBadge] = useState<StreakBadgeState | null>(null)
  const [paused, setPaused] = useState(false)
  const [revealStep, setRevealStep] = useState(0)
  const [impact, setImpact] = useState(0)
  const [kick, setKick] = useState(0)
  const [welcome, setWelcome] = useState(0)
  const [pop, setPop] = useState(0)
  /** 0 → 1 across the final stages; drives how frantic the arena looks. */
  const [panic, setPanic] = useState(0)
  const [settled, setSettled] = useState(false)
  const [flash, setFlash] = useState(0)
  const emptyAuto: AutoTally = { calls: 0, messages: 0, links: 0, allowed: 0 }
  const [autoTally, setAutoTally] = useState<AutoTally>(emptyAuto)
  const autoRef = useRef<AutoTally>(emptyAuto)
  const [cueUsed, setCueUsed] = useState(false)

  const goPhase = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  const goReveal = useCallback((step: number) => {
    revealRef.current = step
    setRevealStep(step)
  }, [])

  /* ------------------------------------------------------------------ *
   * Ephemeral feedback
   * ------------------------------------------------------------------ */

  const pushFeedback = useCallback((f: Omit<Feedback, 'id' | 'bornAt'>) => {
    const id = uid.current++
    setFeedback((list) => [...list.slice(-7), { ...f, id, bornAt: performance.now() }])
    window.setTimeout(
      () => setFeedback((list) => list.filter((x) => x.id !== id)),
      FEEDBACK_LIFE,
    )
  }, [])

  const pushBurst = useCallback(
    (x: number, y: number, tone: Burst['tone']) => {
      if (reducedMotion) return
      const id = uid.current++
      setBursts((list) => [
        ...list.slice(-6),
        { id, x, y, tone, bornAt: performance.now() },
      ])
      window.setTimeout(
        () => setBursts((list) => list.filter((b) => b.id !== id)),
        BURST_LIFE,
      )
    },
    [reducedMotion],
  )

  /* ------------------------------------------------------------------ *
   * Verdicts
   * ------------------------------------------------------------------ */

  const resolve = useCallback(
    (o: LiveObject, verdict: Verdict) => {
      const next = applyVerdict(tallyRef.current, verdict)
      tallyRef.current = next
      setTally(next)

      pushFeedback({
        kind: verdict,
        x: o.x,
        y: o.y,
        label: VERDICT_LABEL[verdict],
        points: POINTS[verdict],
      })

      if (verdict === 'blocked') {
        pushBurst(o.x, o.y, 'threat')
        // Pitch climbs with the streak and resets when it breaks — the
        // cheapest, oldest dopamine trick in arcade games.
        audio.play('block', Math.min(next.streak - 1, 10))
        haptics.block()
        setPop((n) => n + 1)
        window.setTimeout(() => setPop(0), 220)
        if (!reducedMotion) {
          setKick((n) => n + 1)
          window.setTimeout(() => setKick(0), 200)
        }
        const tier = streakTier(next.streak)
        if (tier && tier.at === next.streak) {
          setStreakBadge({ key: uid.current++, label: tier.label, count: next.streak })
          audio.play('streak')
          haptics.streak()
          if (!reducedMotion) {
            setFlash((n) => n + 1)
            window.setTimeout(() => setFlash(0), 400)
          }
        }
      } else if (verdict === 'safe') {
        setPop((n) => n + 1)
        window.setTimeout(() => setPop(0), 220)
        pushBurst(o.x, o.y, 'genuine')
        audio.play('genuine')
        haptics.safe()
        setWelcome((n) => n + 1)
        window.setTimeout(() => setWelcome(0), 620)
      } else if (verdict === 'missed') {
        audio.play('miss')
        haptics.miss()
        setStreakBadge(null)
        if (!reducedMotion) {
          setImpact((n) => n + 1)
          window.setTimeout(() => setImpact(0), 360)
        }
      } else {
        audio.play('wrong')
        haptics.wrong()
        setStreakBadge(null)
      }
    },
    [pushBurst, pushFeedback, reducedMotion],
  )

  /* ------------------------------------------------------------------ *
   * Countdown → play
   * ------------------------------------------------------------------ */

  const runCountdown = useCallback(() => {
    let n = GAME_CONFIG.COUNTDOWN_FROM
    setCountdown(n)
    const tick = () => {
      n -= 1
      if (n > 0) {
        setCountdown(n)
        window.setTimeout(tick, GAME_CONFIG.COUNTDOWN_STEP)
        return
      }
      setCountdown(0)
      elapsed.current = 0
      spawnClock.current = 0
      lastFrame.current = performance.now()
      goPhase('play')
    }
    window.setTimeout(tick, GAME_CONFIG.COUNTDOWN_STEP)
  }, [goPhase])

  useEffect(() => {
    if (skipTutorial) runCountdown()
    // Runs once per mounted game; replays remount via a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------------------------------------------ *
   * Spawning helpers
   * ------------------------------------------------------------------ */

  const spawnById = useCallback(
    (id: string, speed: number, lane: number, reach = 1) => {
      const { w, h } = size.current
      objectsRef.current.push(
        makeObject(getDef(id), w, h, lane, speed, performance.now(), reach),
      )
      rerender()
    },
    [rerender],
  )

  const aliveCount = () =>
    objectsRef.current.filter((o) => o.state === 'incoming' || o.state === 'held').length

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    goPhase('finished')
    const t = tallyRef.current
    const total = Math.max(totalOf(t), 1)
    audio.play('result')
    onFinish({
      score: t.score,
      correct: correctOf(t),
      slipped: t.missed + t.oops,
      total,
      bestStreak: t.bestStreak,
      autoHandled: total,
      auto: autoRef.current,
    })
  }, [goPhase, onFinish])

  /* ------------------------------------------------------------------ *
   * Drag state (declared before the loop so the loop can release it)
   * ------------------------------------------------------------------ */

  const drag = useRef<{
    id: number
    pointerId: number
    samples: Sample[]
    grabDx: number
    grabDy: number
    moved: number
  } | null>(null)

  const releaseHeld = useCallback(() => {
    drag.current = null
    for (const o of objectsRef.current) {
      if (o.state === 'held') {
        o.state = 'incoming'
        o.scale = 1
      }
    }
  }, [])

  /* ------------------------------------------------------------------ *
   * Main loop
   * ------------------------------------------------------------------ */

  useEffect(() => {
    const step = (now: number) => {
      rafRef.current = requestAnimationFrame(step)
      const raw = now - (lastFrame.current || now)
      lastFrame.current = now
      const dt = Math.min(raw, 48)

      const p = phaseRef.current
      if (p === 'finished' || pausedRef.current) return

      const { w, h } = size.current
      const auto = p === 'auto'
      const frozen = p === 'freeze' || p === 'reveal'
      const cx = w / 2
      // The hero device sits low during the takeover; everything aims at it.
      const cy = auto ? h * GAME_CONFIG.AUTO_TARGET_Y : h / 2
      const phoneR = auto ? GAME_CONFIG.AUTO_PHONE_RADIUS : GAME_CONFIG.PHONE_RADIUS
      let dirty = false

      /* ---------------- timeline ---------------- */
      if (p === 'play') {
        elapsed.current += dt
        const left = Math.max(
          0,
          Math.ceil((GAME_CONFIG.GAME_DURATION - elapsed.current) / 1000),
        )
        setSecondsLeft((prev) => (prev === left ? prev : left))

        const p01 =
          elapsed.current <= PANIC_FROM
            ? 0
            : Math.min(
                1,
                (elapsed.current - PANIC_FROM) / (GAME_CONFIG.GAME_DURATION - PANIC_FROM),
              )
        const stepped = Math.round(p01 * 5) / 5
        setPanic((prev) => (prev === stepped ? prev : stepped))
        if (elapsed.current >= GAME_CONFIG.TAKEOVER_TIME) {
          setPanic(0)
          releaseHeld()
          setStreakBadge(null)
          goPhase('freeze')
          gateAt.current = now + GAME_CONFIG.FREEZE_HOLD
        }
      } else if (p === 'freeze') {
        if (gateAt.current !== null && now >= gateAt.current) {
          goPhase('reveal')
          goReveal(1)
          gateAt.current = now + GAME_CONFIG.REVEAL_LINE_B
        }
      } else if (p === 'reveal') {
        if (gateAt.current !== null && now >= gateAt.current) {
          if (revealRef.current === 1) {
            goReveal(2)
            audio.play('takeover')
            haptics.takeover()
            gateAt.current = now + GAME_CONFIG.TAKEOVER_ARM
          } else {
            goReveal(3)
            goPhase('auto')
            gateAt.current = null
            spawnClock.current = 0
            autoElapsed.current = 0
            // Sweep the frozen field clear so automation starts on a clean slate.
            for (const o of objectsRef.current) {
              if (o.state !== 'flicked') knockBack(o, cx, cy)
            }
            dirty = true
          }
        }
      } else if (auto) {
        autoElapsed.current += dt
        const calm =
          autoElapsed.current >= GAME_CONFIG.TAKEOVER_DURATION - GAME_CONFIG.TAKEOVER_HOLD
        setSettled((prev) => (prev === calm ? prev : calm))
        if (autoElapsed.current >= GAME_CONFIG.TAKEOVER_DURATION) {
          finish()
          return
        }
      }

      /* ---------------- spawning ---------------- */
      if (p === 'play') {
        const stage = stageAt(elapsed.current)
        spawnClock.current += dt
        if (spawnClock.current >= stage.spawnInterval && aliveCount() < stage.maxAlive) {
          spawnClock.current = 0
          objectsRef.current.push(
            makeObject(pickForStage(stage), w, h, lanes.next(), stage.speed, now),
          )
          dirty = true
        }
      } else if (auto) {
        // Stop feeding the field for the last beat so it empties out and the
        // player sees the calm Airtel Safe leaves behind.
        const settling =
          autoElapsed.current >= GAME_CONFIG.TAKEOVER_DURATION - GAME_CONFIG.TAKEOVER_HOLD
        spawnClock.current += dt
        if (!settling && spawnClock.current >= AUTO_SPAWN_INTERVAL && aliveCount() < AUTO_MAX_ALIVE) {
          spawnClock.current = 0
          const stage = stageAt(GAME_CONFIG.GAME_DURATION - 1)
          objectsRef.current.push(
            makeObject(pickForStage(stage), w, h, lanes.next(), AUTO_SPEED, now),
          )
          dirty = true
        }
      }

      /* ---------------- physics ---------------- */
      for (const o of objectsRef.current) {
        if (o.state === 'held') continue

        if (o.state === 'flicked') {
          stepFlicked(o, dt)
          if (isOffstage(o, w, h)) o.state = 'gone'
          continue
        }

        if (o.state === 'absorbing') {
          stepAbsorbing(o, cx, cy, dt)
          if (o.opacity <= 0.02) o.state = 'gone'
          continue
        }
        if (frozen) continue

        stepIncoming(o, cx, cy, dt, now, reducedMotion)
        const d = dist(o.x, o.y, cx, cy)

        if (auto) {
          if (o.def.trust === 'threat') {
            if (d < GAME_CONFIG.SAFE_FIELD_RADIUS) {
              knockBack(o, cx, cy)
              dirty = true
              pushFeedback({ kind: 'auto-blocked', x: o.x, y: o.y, label: 'BLOCKED' })
              pushBurst(o.x, o.y, 'safe')
              audio.play('autoBlock')
              // Same three buckets the Safety Report uses, so the live count
              // and the weekly summary speak the same language.
              const bucket =
                o.def.family === 'call'
                  ? 'calls'
                  : o.def.family === 'link'
                    ? 'links'
                    : 'messages'
              autoRef.current = { ...autoRef.current, [bucket]: autoRef.current[bucket] + 1 }
              setAutoTally(autoRef.current)
            }
          } else if (d < GAME_CONFIG.PHONE_RADIUS) {
            o.state = 'gone'
            pushFeedback({ kind: 'auto-allowed', x: o.x, y: o.y, label: 'ALLOWED' })
          }
          continue
        }

        if (d < phoneR) {
          const genuine = o.def.trust === 'genuine'
          o.state = genuine ? 'absorbing' : 'gone'
          if (genuine) dirty = true
          if (p === 'play') {
            resolve(o, genuine ? 'safe' : 'missed')
          } else if (p === 'tutorial-genuine') {
            pushFeedback({ kind: 'safe', x: o.x, y: o.y, label: '✓ Safe' })
            pushBurst(o.x, o.y, 'genuine')
            audio.play('genuine')
            haptics.safe()
            setWelcome((n) => n + 1)
            window.setTimeout(() => setWelcome(0), 620)
            goPhase('tutorial-done')
            gateAt.current = now + 950
          } else if (p === 'tutorial-threat') {
            // No punishment while learning — just move the script along.
            goPhase('tutorial-genuine')
          }
        }
      }

      const before = objectsRef.current.length
      objectsRef.current = objectsRef.current.filter((o) => o.state !== 'gone')
      if (dirty || before !== objectsRef.current.length) rerender()

      /* ---------------- tutorial script ---------------- */
      const tp = phaseRef.current
      if (
        (tp === 'tutorial-threat' || tp === 'tutorial-genuine') &&
        objectsRef.current.length === 0 &&
        gateAt.current === null
      ) {
        gateAt.current = now + TUTORIAL_GAP
      }
      if (gateAt.current !== null && now >= gateAt.current) {
        if (tp === 'tutorial-threat') {
          gateAt.current = null
          spawnById('spam-call', TUTORIAL_SPEED, 2, TUTORIAL_REACH)
        } else if (tp === 'tutorial-genuine') {
          gateAt.current = null
          spawnById('mom-calling', TUTORIAL_SPEED, 6, TUTORIAL_REACH)
        } else if (tp === 'tutorial-done') {
          gateAt.current = null
          goPhase('countdown')
          runCountdown()
        }
      }

      /* ---------------- paint ---------------- */
      for (const o of objectsRef.current) {
        const el = elMap.current.get(o.id)
        if (!el) continue
        el.style.transform =
          `translate3d(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px, 0)` +
          ` translate(-50%, -50%) rotate(${o.rot.toFixed(2)}deg) scale(${o.scale.toFixed(3)})`
        el.style.opacity = o.opacity.toFixed(3)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [
    finish,
    goPhase,
    goReveal,
    lanes,
    pushBurst,
    pushFeedback,
    reducedMotion,
    releaseHeld,
    rerender,
    resolve,
    runCountdown,
    spawnById,
  ])

  /* ------------------------------------------------------------------ *
   * Pointer / flick handling
   * ------------------------------------------------------------------ */

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const rect = arenaRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const interactive = () => {
    const p = phaseRef.current
    return p === 'play' || p === 'tutorial-threat' || p === 'tutorial-genuine'
  }

  const onObjectPointerDown = useCallback(
    (id: number, e: ReactPointerEvent<HTMLDivElement>) => {
      if (!interactive() || pausedRef.current) return
      const o = objectsRef.current.find((x) => x.id === id)
      if (!o || o.state !== 'incoming') return
      e.preventDefault()
      touchedOnce.current = true
      setCueUsed(true)
      const pt = localPoint(e)
      o.state = 'held'
      o.scale = GAME_CONFIG.GRAB_SCALE
      audio.play('grab')
      haptics.grab()
      drag.current = {
        id,
        pointerId: e.pointerId,
        samples: [{ ...pt, t: performance.now() }],
        grabDx: o.x - pt.x,
        grabDy: o.y - pt.y,
        moved: 0,
      }
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* capture is a nicety, not a requirement */
      }
    },
    [],
  )

  const onObjectPointerMove = useCallback(
    (id: number, e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current
      if (!d || d.id !== id || d.pointerId !== e.pointerId) return
      const o = objectsRef.current.find((x) => x.id === id)
      if (!o) return
      const pt = localPoint(e)
      const prev = d.samples[d.samples.length - 1]
      d.moved += Math.hypot(pt.x - prev.x, pt.y - prev.y)
      d.samples.push({ ...pt, t: performance.now() })
      if (d.samples.length > 12) d.samples.shift()
      o.x = pt.x + d.grabDx
      o.y = pt.y + d.grabDy
    },
    [],
  )

  const endDrag = useCallback(
    (id: number, e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current
      if (!d || d.id !== id) return
      drag.current = null
      const o = objectsRef.current.find((x) => x.id === id)
      if (!o || o.state !== 'held') return
      o.scale = 1

      const v = releaseVelocity(d.samples)
      const speed = Math.hypot(v.x, v.y)
      const fastEnough = speed >= GAME_CONFIG.FLICK_VELOCITY
      const farEnough = d.moved >= GAME_CONFIG.FLICK_THRESHOLD * 2

      if (fastEnough) {
        // Swiped: throw it along the gesture.
        launch(o, v)
      } else {
        // Tapped (or nudged): throw it straight out from the phone, with a
        // lift so it arcs. One touch is all the game asks for.
        const { w, h } = size.current
        const dx = o.x - w / 2
        const dy = o.y - h / 2
        const m = Math.hypot(dx, dy) || 1
        launch(o, {
          x: (dx / m) * GAME_CONFIG.TAP_SPEED,
          y: (dy / m) * GAME_CONFIG.TAP_SPEED - GAME_CONFIG.TAP_LIFT,
        })
      }
      void farEnough
      audio.play('flick')
      rerender()
      e.stopPropagation()

      const p = phaseRef.current
      if (p === 'play') {
        resolve(o, o.def.trust === 'threat' ? 'blocked' : 'oops')
      } else if (p === 'tutorial-threat') {
        pushFeedback({ kind: 'blocked', x: o.x, y: o.y, label: 'BLOCKED', points: 10 })
        pushBurst(o.x, o.y, 'threat')
        audio.play('block')
        haptics.block()
        goPhase('tutorial-genuine')
      } else if (p === 'tutorial-genuine') {
        pushFeedback({ kind: 'oops', x: o.x, y: o.y, label: 'OOPS' })
        audio.play('wrong')
        haptics.wrong()
        goPhase('tutorial-done')
        gateAt.current = performance.now() + 750
      }
    },
    [goPhase, pushBurst, pushFeedback, resolve],
  )

  /* ------------------------------------------------------------------ *
   * Element registration + measurement
   * ------------------------------------------------------------------ */

  const registerEl = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) elMap.current.set(id, el)
    else elMap.current.delete(id)
  }, [])

  useEffect(() => {
    const node = arenaRef.current
    if (!node) return
    const measure = () => {
      const r = node.getBoundingClientRect()
      if (r.width && r.height) size.current = { w: r.width, h: r.height }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  /* ------------------------------------------------------------------ *
   * Controls
   * ------------------------------------------------------------------ */

  const togglePause = useCallback(() => {
    if (phaseRef.current !== 'play') return
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
    if (!pausedRef.current) lastFrame.current = performance.now()
  }, [])

  /** Keyboard fallback: flick whatever is closest to the phone. */
  const flickNearest = useCallback(() => {
    if (phaseRef.current !== 'play' || pausedRef.current) return
    const { w, h } = size.current
    const cx = w / 2
    const cy = h / 2
    let best: LiveObject | null = null
    let bestD = Infinity
    for (const o of objectsRef.current) {
      if (o.state !== 'incoming') continue
      const d = dist(o.x, o.y, cx, cy)
      if (d < bestD) {
        bestD = d
        best = o
      }
    }
    if (!best) return
    const dx = best.x - cx
    const dy = best.y - cy
    const m = Math.hypot(dx, dy) || 1
    launch(best, { x: (dx / m) * 1.5, y: (dy / m) * 1.5 })
    audio.play('flick')
    resolve(best, best.def.trust === 'threat' ? 'blocked' : 'oops')
  }, [resolve])

  return {
    arenaRef,
    registerEl,
    objects: objectsRef.current,
    phase,
    tally,
    secondsLeft,
    countdown,
    feedback,
    bursts,
    streakBadge,
    paused,
    revealStep,
    impact,
    kick,
    welcome,
    pop,
    flash,
    panic,
    settled,
    autoTally,
    cue:
      phase === 'tutorial-threat' && !cueUsed
        ? ('tap' as const)
        : phase === 'tutorial-genuine'
          ? ('leave' as const)
          : null,
    onObjectPointerDown,
    onObjectPointerMove,
    endDrag,
    togglePause,
    flickNearest,
  }
}
