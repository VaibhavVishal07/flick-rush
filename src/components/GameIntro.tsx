import { useCallback, useEffect, useRef, useState } from 'react'
import { AirtelSafeMark, ShieldMark, SoundOffIcon, SoundOnIcon } from '../assets/icons'
import { PixelCross, PixelHand, PixelTick, pixelFamilyIcon } from '../assets/PixelIcon'
import { ParticleBurst } from '../assets/ParticleBurst'
import { audio } from '../game/audio'
import type { Burst } from '../game/types'

interface Props {
  onPlay: () => void
  soundOn: boolean
  onToggleSound: () => void
  onRules: () => void
  returning: boolean
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
  good: ['Don’t tap', 'the good ones'],
  goodDone: ['Don’t tap', 'the good ones'],
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
]

const OUTCOME: Record<Beat, string> = {
  bad: '',
  badDone: 'Gone.',
  good: '',
  goodDone: 'Still here.',
}

const BAD_TAP = 1450
const BAD_HOLD = 1250
const GOOD_HOLD = 1900
const GOOD_END = 1350

export const GameIntro = ({ onPlay, soundOn, onToggleSound, onRules, returning }: Props) => {
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

  const bad = beat === 'bad' || beat === 'badDone'
  // The button starts asking for attention once both rules have been shown.
  const taught = seen.current

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

      <header className="intro__top">
        <AirtelSafeMark />
        <div className="intro__tools">
          <button type="button" className="hud__btn" onClick={onRules} aria-label="How to play">
            <ShieldMark size={17} />
          </button>
          <button
            type="button"
            className="hud__btn"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
          >
            {soundOn ? <SoundOnIcon size={17} /> : <SoundOffIcon size={17} />}
          </button>
        </div>
      </header>

      <div className="intro__ident">
        <h1 className="intro__name">
          <span>Spam</span>
          <span>Smash</span>
        </h1>
        <span className="intro__loader" aria-hidden="true">
          <span className="intro__loader-bar" />
        </span>
      </div>

      <div className="intro__stage" ref={stage} aria-hidden="true">
        <span className="intro__spot" />

        {bad ? (
          <>
            <div ref={card} className="intro__card" data-trust="threat" data-state={beat}>
              {/* Two clipped copies of the same face, thrown opposite ways, so
                  the card comes apart along a diagonal instead of shrinking
                  politely out of existence. */}
              {beat === 'badDone' ? <span className="intro__flash" /> : null}
              <span className="intro__face intro__face--a">
                <span className="intro__card-icon">{pixelFamilyIcon('call', 'threat', 20)}</span>
                <span>Spam Call</span>
                <span className="intro__card-flag">
                  <PixelCross size={26} />
                </span>
              </span>
              <span className="intro__face intro__face--b" aria-hidden="true">
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
