import { useCallback, useEffect, useRef, useState } from 'react'
import { AirtelSafeMark, ShieldMark, SoundOffIcon, SoundOnIcon } from '../assets/icons'
import { PixelCross, PixelTick, pixelFamilyIcon } from '../assets/PixelIcon'
import { ParticleBurst } from '../assets/ParticleBurst'
import { PhoneDevice } from '../assets/PhoneDevice'
import { audio } from '../game/audio'
import { haptics } from '../game/haptics'
import type { Burst } from '../game/types'

interface Props {
  onPlay: () => void
  soundOn: boolean
  onToggleSound: () => void
  onRules: () => void
  returning: boolean
}

/**
 * The onboarding. All of it, in one place.
 *
 * It used to run twice — a preview here and a tutorial inside the timed game —
 * which taught the same thing twice and taught it badly both times, because
 * neither could slow down. This screen owns the job instead, and the game now
 * starts on the countdown.
 *
 * The method is hand-holding, literally: one card on screen, one instruction,
 * and nothing moves on until the player does the thing. Four beats, each
 * gated or timed, each with a visible consequence.
 */
type Step = 'phone' | 'tapBad' | 'badDone' | 'leaveGood' | 'goodDone' | 'ready'

const SCRIPT: Record<Step, { lead: string; sub: string }> = {
  phone: { lead: 'This is your phone', sub: 'Things keep trying to get in.' },
  tapBad: { lead: 'This one is spam', sub: 'Tap it!' },
  badDone: { lead: 'Blocked!', sub: 'It never reached your phone.' },
  leaveGood: { lead: 'This one is real', sub: 'Mom is calling. Don’t tap — watch.' },
  goodDone: { lead: 'She got through', sub: 'Real things should reach you.' },
  ready: { lead: 'That’s the whole game', sub: 'Red ✕ = tap it. Green ✓ = leave it.' },
}

export const GameIntro = ({ onPlay, soundOn, onToggleSound, onRules, returning }: Props) => {
  // Anyone who has played already skips straight to the button.
  const [step, setStep] = useState<Step>(returning ? 'ready' : 'phone')
  const [nudged, setNudged] = useState(false)
  const [bursts, setBursts] = useState<Burst[]>([])
  const uid = useRef(0)
  const stage = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // The beats that run on their own. `tapBad` and `leaveGood` are not here —
  // one waits for a tap, the other for the card to finish its journey.
  useEffect(() => {
    if (step === 'phone') after(1900, () => setStep('tapBad'))
    if (step === 'badDone') after(1500, () => setStep('leaveGood'))
    if (step === 'leaveGood') after(2600, () => setStep('goodDone'))
    if (step === 'goodDone') after(1600, () => setStep('ready'))
  }, [step, after])

  const burstAt = useCallback((el: HTMLElement, tone: Burst['tone']) => {
    const host = stage.current
    if (!host) return
    const a = el.getBoundingClientRect()
    const b = host.getBoundingClientRect()
    const id = uid.current++
    setBursts((list) => [
      ...list,
      { id, x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2, tone, bornAt: 0 },
    ])
    after(700, () => setBursts((list) => list.filter((x) => x.id !== id)))
  }, [after])

  const tapBad = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (step !== 'tapBad') return
      audio.unlock()
      burstAt(e.currentTarget, 'threat')
      audio.play('block')
      haptics.block()
      setStep('badDone')
    },
    [step, burstAt],
  )

  // Tapping the real one is the mistake worth making here, where it is free.
  const tapGood = useCallback(() => {
    if (step !== 'leaveGood' || nudged) return
    audio.unlock()
    audio.play('wrong')
    haptics.wrong()
    setNudged(true)
    after(1500, () => setNudged(false))
  }, [step, nudged, after])

  const line = nudged
    ? { lead: 'No — leave that one!', sub: 'Green ✓ is real. Let it in.' }
    : SCRIPT[step]

  const showBad = step === 'tapBad'
  const showGood = step === 'leaveGood' || step === 'goodDone'

  return (
    <section className="intro" aria-label="Shield Rush" data-step={step}>
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

      <p key={line.lead} className="intro__coach" aria-live="polite">
        <span className="intro__coach-lead">{line.lead}</span>
        <span className="intro__coach-sub">{line.sub}</span>
      </p>

      <div className="intro__stage" ref={stage}>
        <div className="intro__glow" aria-hidden="true" />

        <div
          className={`intro__device${step === 'goodDone' ? ' is-welcoming' : ''}`}
          aria-hidden="true"
        >
          <PhoneDevice width={104} />
        </div>

        {step === 'phone' ? (
          <>
            <span className="intro__pointer intro__pointer--phone" aria-hidden="true" />
            <span className="intro__tag" aria-hidden="true">
              your phone
            </span>
          </>
        ) : null}

        {showBad ? (
          <>
            <button type="button" className="intro__card intro__card--bad" data-trust="threat" onClick={tapBad}>
              <span className="intro__card-icon">{pixelFamilyIcon('call', 'threat', 16)}</span>
              <span>Spam Call</span>
              <span className="intro__card-flag">
                <PixelCross size={19} />
              </span>
            </button>
            <span className="intro__hand" aria-hidden="true">
              <span className="intro__hand-ring" />
              <span className="intro__hand-ring intro__hand-ring--late" />
              <span className="intro__hand-dot" />
            </span>
          </>
        ) : null}

        {showGood ? (
          <button
            type="button"
            className={`intro__card intro__card--good${step === 'goodDone' ? ' is-in' : ''}${
              nudged ? ' is-refused' : ''
            }`}
            data-trust="genuine"
            onClick={tapGood}
          >
            <span className="intro__card-icon">{pixelFamilyIcon('call', 'genuine', 16)}</span>
            <span>Mom Calling</span>
            <span className="intro__card-flag">
              <PixelTick size={19} />
            </span>
          </button>
        ) : null}

        {step === 'leaveGood' && !nudged ? (
          <span className="intro__handsoff" aria-hidden="true">
            DON’T TAP
          </span>
        ) : null}

        {step === 'ready' ? (
          <div className="intro__rule" aria-hidden="true">
            <span className="intro__rule-row" data-trust="threat">
              <span className="intro__rule-flag">
                <PixelCross size={22} />
              </span>
              <b>Tap it</b>
            </span>
            <span className="intro__rule-row" data-trust="genuine">
              <span className="intro__rule-flag">
                <PixelTick size={22} />
              </span>
              <b>Leave it</b>
            </span>
          </div>
        ) : null}

        {bursts.map((b) => (
          <ParticleBurst key={b.id} burst={b} />
        ))}
      </div>

      <h1 className="intro__title">
        Shield<span>Rush</span>
      </h1>

      <div className="intro__cta">
        <button
          type="button"
          className={`btn btn--primary btn--lg${step === 'ready' ? ' is-ready' : ''}`}
          onClick={onPlay}
        >
          {returning ? 'Play Again' : 'Play Now'}
        </button>
        <p className="btn-sub">
          {step === 'ready' ? 'Takes 20 seconds' : 'Or skip the intro'}
        </p>
      </div>
    </section>
  )
}
