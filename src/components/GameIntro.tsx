import { useCallback, useEffect, useRef, useState } from 'react'
import { AirtelSafeMark, ShieldMark, SoundOffIcon, SoundOnIcon } from '../assets/icons'
import { PixelCross, PixelHand, PixelTick, pixelFamilyIcon } from '../assets/PixelIcon'
import { ParticleBurst } from '../assets/ParticleBurst'
import { PhoneDevice } from '../assets/PhoneDevice'
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
 * The intro shows the game instead of asking for it.
 *
 * Asking did not work. A screen that waits for the right tap is a screen you
 * can fail at, and the instruction has to be read before anything happens.
 * This one plays itself: spam arrives, a hand comes in and smashes it, a real
 * call arrives and is allowed through, and then it does it again. Nothing to
 * get right, nothing to read first — you watch it twice and you have it.
 *
 * The phone is the subject and sits high; the words sit under it and are
 * captions, not instructions.
 */
type Beat = 'spam' | 'gone' | 'real' | 'through'

/**
 * Captions that teach rather than narrate. "Spam is coming / watch what
 * happens" described the animation; these name the badge and say what it is
 * for, which is the only thing the player has to carry into the game.
 */
const CAPTION: Record<Beat, { lead: string; sub: string }> = {
  spam: { lead: 'Bad one ✕', sub: 'Tap it before it lands.' },
  gone: { lead: 'Tapped. Gone.', sub: 'It never reached the phone.' },
  real: { lead: 'Good one ✓', sub: 'Don’t tap. Let it in.' },
  through: { lead: 'It got in', sub: 'That’s exactly what you want.' },
}

/** The loop, in milliseconds from the start of each beat. */
const SPAM_TAP = 1150
const SPAM_HOLD = 850
const REAL_TRAVEL = 900
const REAL_HOLD = 950

export const GameIntro = ({ onPlay, soundOn, onToggleSound, onRules, returning }: Props) => {
  const [beat, setBeat] = useState<Beat>('spam')
  const [bursts, setBursts] = useState<Burst[]>([])
  const uid = useRef(0)
  const stage = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

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
    // Only if the visitor has already interacted — browsers block audio otherwise.
    audio.play('block')
    setBeat('gone')
  }, [after])

  useEffect(() => {
    if (beat === 'spam') after(SPAM_TAP, smash)
    if (beat === 'gone') after(SPAM_HOLD, () => setBeat('real'))
    if (beat === 'real') after(REAL_TRAVEL + 500, () => setBeat('through'))
    if (beat === 'through') after(REAL_HOLD, () => setBeat('spam'))
  }, [beat, after, smash])

  const caption = CAPTION[beat]
  // Kept mounted through `gone` so the break and the hand's retreat can
  // finish — unmounting on the tap cut both off at the frame they started.
  const showBad = beat === 'spam' || beat === 'gone'
  const showGood = beat === 'real' || beat === 'through'

  return (
    <section className="intro" aria-label="Shield Rush">
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

      <div className="intro__stage" ref={stage} aria-hidden="true">
        <div className="intro__glow" />

        <div className={`intro__device${beat === 'through' ? ' is-welcoming' : ''}`}>
          <PhoneDevice width={112} />
        </div>

        {showBad ? (
          <>
            <div ref={card} className="intro__card intro__card--bad" data-trust="threat">
              <span className="intro__card-icon">{pixelFamilyIcon('call', 'threat', 16)}</span>
              <span>Spam Call</span>
              <span className="intro__card-flag">
                <PixelCross size={19} />
              </span>
            </div>
            <span className="intro__finger">
              <PixelHand size={46} />
            </span>
          </>
        ) : null}

        {showGood ? (
          <div className={`intro__card intro__card--good${beat === 'through' ? ' is-in' : ''}`} data-trust="genuine">
            <span className="intro__card-icon">{pixelFamilyIcon('call', 'genuine', 16)}</span>
            <span>Mom Calling</span>
            <span className="intro__card-flag">
              <PixelTick size={19} />
            </span>
          </div>
        ) : null}

        {bursts.map((b) => (
          <ParticleBurst key={b.id} burst={b} />
        ))}
      </div>

      {/* Under the phone, because the phone is the thing being watched. */}
      <p key={beat} className="intro__caption" aria-live="polite">
        <span className="intro__caption-lead">{caption.lead}</span>
        <span className="intro__caption-sub">{caption.sub}</span>
      </p>

      <div className="intro__rule" aria-hidden="true">
        <span className="intro__rule-row" data-trust="threat">
          <span className="intro__rule-flag">
            <PixelCross size={20} />
          </span>
          <b>Tap it</b>
        </span>
        <span className="intro__rule-row" data-trust="genuine">
          <span className="intro__rule-flag">
            <PixelTick size={20} />
          </span>
          <b>Leave it</b>
        </span>
      </div>

      <div className="intro__cta">
        <button type="button" className="btn btn--primary btn--lg" onClick={onPlay}>
          {returning ? 'Play Again' : 'Play Now'}
        </button>
        {/* Says what the next 20 seconds will ask of them. */}
        <p className="btn-sub">20 seconds. Sort as many as you can.</p>
      </div>
    </section>
  )
}
