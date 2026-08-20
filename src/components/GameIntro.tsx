import { useCallback, useEffect, useRef, useState } from 'react'
import { AirtelSafeLogo } from '../assets/AirtelSafeLogo'
import { PixelCross, PixelHand, PixelTick, pixelFamilyIcon } from '../assets/PixelIcon'
import { SoundOffIcon, SoundOnIcon } from '../assets/icons'
import { ParticleBurst } from '../assets/ParticleBurst'
import { audio } from '../game/audio'
import type { Burst } from '../game/types'

interface Props {
  onPlay: () => void
  returning: boolean
  soundOn: boolean
  onToggleSound: () => void
}

/**
 * Two rules, demonstrated one at a time on an empty field.
 *
 * Modelled on how an arcade game teaches: a single object, nothing else on
 * screen, one instruction, and a cue drawn on the object itself. The phone is
 * gone from this screen — it was a second thing to look at while the card was
 * the thing being explained, and it made every beat a two-object scene.
 *
 * Beat one: a spam card, a hand taps it, it is destroyed. Beat two: a real
 * card, a hand with a line through it, and nothing happens to the card. That
 * is the whole game.
 */
type Beat = 'bad' | 'badDone' | 'good' | 'goodDone'

/** Broken where the sense breaks, not where the box happens to run out. */
const RULE: Record<Beat, [string, string]> = {
  bad: ['Tap to destroy', 'the bad ones'],
  badDone: ['Tap to destroy', 'the bad ones'],
  good: ['Hands off', 'the good ones'],
  goodDone: ['Hands off', 'the good ones'],
}

/** Pixel glints scattered over the ground, so it is a place and not a fill. */
const SPARKS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const

/** Drifting behind everything, at 20%: the world the game is set in. */
const FIELD: Array<{ label: string; trust: 'threat' | 'genuine'; lane: string }> = [
  { label: 'Unknown Caller', trust: 'threat', lane: 'a' },
  { label: 'Delivery Update', trust: 'genuine', lane: 'b' },
  { label: 'Fake Reward', trust: 'threat', lane: 'c' },
  { label: 'Genuine OTP', trust: 'genuine', lane: 'd' },
  { label: 'Suspicious Link', trust: 'threat', lane: 'e' },
  { label: 'Spam SMS', trust: 'threat', lane: 'f' },
  { label: 'Risky Message', trust: 'threat', lane: 'g' },
  { label: 'Friend’s Message', trust: 'genuine', lane: 'h' },
  { label: 'Fake Reward', trust: 'threat', lane: 'i' },
  { label: 'Calendar Reminder', trust: 'genuine', lane: 'j' },
]

const OUTCOME: Record<Beat, string> = {
  bad: '',
  badDone: 'Gone.',
  good: '',
  goodDone: 'It gets through. Good.',
}

const BAD_TAP = 1450
const BAD_HOLD = 1250
const GOOD_HOLD = 1900
const GOOD_END = 1350

export const GameIntro = ({ onPlay, returning, soundOn, onToggleSound }: Props) => {
  /**
   * A 1.5s hold on the wordmark before the rest arrives.
   *
   * Nothing moves across the boundary — the wordmark and the drifting cards
   * are the same elements before and after, sitting in their final positions
   * the whole time, and everything else is already in the layout at zero
   * opacity. So the handover is a cross-fade with no reflow: the bar leaves,
   * the rest arrives, and not a pixel of what was already on screen shifts.
   */
  const [loading, setLoading] = useState(true)
  /** Drives the mute control, which only exists once there is something to mute. */
  const [audible, setAudible] = useState(false)
  const [beat, setBeat] = useState<Beat>('bad')
  /** Set once the loop has shown both rules; drives the button's shimmer. */
  const seen = useRef(false)
  const [bursts, setBursts] = useState<Burst[]>([])
  const uid = useRef(0)
  const stage = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(id)
  }, [])

  /**
   * The onboarding loop.
   *
   * A browser will not let any page make a sound before it has been touched,
   * and we would not want it to: the rule is that nothing plays until the
   * user has acted. So on a first visit the loop is armed rather than started
   * — the first tap, click or key anywhere on the page builds the audio graph
   * and brings the music in. Coming back from a round the graph already
   * exists, so it starts on mount.
   */
  const sound = useRef(soundOn)
  sound.current = soundOn
  useEffect(() => {
    let live = true
    const begin = () => {
      if (!live) return
      audio.unlock()
      audio.setEnabled(sound.current)
      audio.startMusic()
      setAudible(true)
    }
    const arm = ['pointerdown', 'keydown', 'touchstart'] as const
    const once = () => {
      begin()
      arm.forEach((e) => window.removeEventListener(e, once))
    }
    if (audio.ready) begin()
    else arm.forEach((e) => window.addEventListener(e, once, { passive: true }))
    return () => {
      live = false
      arm.forEach((e) => window.removeEventListener(e, once))
      // Gameplay runs dry: seventeen seconds of timing cues should not have a
      // loop underneath them.
      audio.stopMusic()
    }
  }, [])

  const smash = useCallback(() => {
    const host = stage.current
    const el = card.current
    if (host && el) {
      const a = el.getBoundingClientRect()
      const b = host.getBoundingClientRect()
      const id = uid.current++
      setBursts((list) => [
        ...list,
        { id, x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2, tone: 'threat', bornAt: 0 },
      ])
      after(700, () => setBursts((list) => list.filter((x) => x.id !== id)))
    }
    audio.play('block')
    setBeat('badDone')
  }, [after])

  useEffect(() => {
    if (loading) return
    if (beat === 'bad') after(BAD_TAP, smash)
    if (beat === 'badDone') after(BAD_HOLD, () => setBeat('good'))
    if (beat === 'good') after(GOOD_HOLD, () => setBeat('goodDone'))
    if (beat === 'goodDone') {
      seen.current = true
      after(GOOD_END, () => setBeat('bad'))
    }
  }, [beat, after, smash, loading])

  // The button starts asking for attention once both rules have been shown.
  const taught = seen.current

  const bad = beat === 'bad' || beat === 'badDone'

  return (
    <section className={`intro${loading ? ' is-loading' : ''}`} aria-label="Spam Smash">
      <div className="intro__field" aria-hidden="true">
        <span className="intro__grain" />
        {SPARKS.map((sp) => (
          <span key={sp} className={`intro__spark intro__spark--${sp}`} />
        ))}
        {FIELD.map((c) => (
          <span key={c.lane} className={`intro__ghost intro__ghost--${c.lane}`} data-trust={c.trust}>
            {c.label}
          </span>
        ))}
      </div>


      <div className="intro__ident">
        {/* Whose game this is, before what it is called. Inside the ident so
            it is one of the elements that survives the loader handover
            untouched, rather than something that appears afterwards. */}
        <AirtelSafeLogo width={128} mono />
        <h1 className="intro__name">
          <span>Spam</span>
          <span>Smash</span>
        </h1>
        <span className="intro__loader" aria-hidden="true">
          <span className="intro__loader-bar" />
        </span>
      </div>

      {audible ? (
        <button
          type="button"
          className="intro__mute"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
        >
          {soundOn ? <SoundOnIcon size={17} /> : <SoundOffIcon size={17} />}
        </button>
      ) : null}

      {/* Says what the moving thing below is. Without it the demo is just an
          animation on a title screen; with it, it is the how-to. */}
      <p className="intro__howto">Instructions to play</p>

      <div className="intro__stage" ref={stage} aria-hidden="true">
        <span className="intro__spot" />

        {/* Mounted only once the loader has gone. Rendered behind it, the
            hand's approach and the card's arrival played out at opacity 0 and
            were over before anyone could see them — the tap hand measured a
            flat distance from the card across its whole visible life. */}
        {loading ? null : bad ? (
          <>
            <div ref={card} className="intro__card" data-trust="threat" data-state={beat}>
              {beat === 'badDone' ? <span className="intro__flash" /> : null}
              <span className="intro__face intro__face--a">
                <span className="intro__card-icon">{pixelFamilyIcon('call', 'threat', 20)}</span>
                <span>Spam Call</span>
                <span className="intro__card-flag">
                  <PixelCross size={26} />
                </span>
              </span>
            </div>
            {beat === 'bad' ? (
              <span className="intro__hand">
                <PixelHand size={62} />
              </span>
            ) : null}
          </>
        ) : (
          <>
            <div className="intro__card" data-trust="genuine" data-state={beat}>
              <span className="intro__face intro__face--a">
                <span className="intro__card-icon">{pixelFamilyIcon('call', 'genuine', 20)}</span>
                <span>Mom Calling</span>
                <span className="intro__card-flag">
                  <PixelTick size={26} />
                </span>
              </span>
            </div>
            {beat === 'good' ? (
              <span className="intro__nohand">
                <PixelHand size={62} />
                <span className="intro__nohand-badge">
                  <PixelCross size={20} />
                </span>
              </span>
            ) : null}
          </>
        )}

        {beat === 'badDone' ? <span className="intro__stamp">Blocked</span> : null}
        {beat === 'goodDone' ? (
          <span className="intro__stamp intro__stamp--safe">Let through</span>
        ) : null}

        {bursts.map((b) => (
          <ParticleBurst key={b.id} burst={b} />
        ))}
      </div>

      <p className="intro__caption" aria-live="polite">
        <span key={RULE[beat][0]} className="intro__caption-lead">
          <b>{RULE[beat][0]}</b>
          <b>{RULE[beat][1]}</b>
        </span>
        <span key={OUTCOME[beat] || 'blank'} className="intro__caption-sub">
          {OUTCOME[beat] || ' '}
        </span>
      </p>

      <div className="intro__cta">
        <button
          type="button"
          className={`btn btn--primary btn--lg${taught ? ' is-shimmer' : ''}`}
          onClick={onPlay}
        >
          {returning ? 'Play Again' : 'Play Now'}
        </button>
        <p className="btn-sub">Takes 20 seconds</p>
      </div>
    </section>
  )
}
