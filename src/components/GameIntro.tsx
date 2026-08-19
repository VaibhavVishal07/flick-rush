import { useCallback, useMemo, useRef, useState } from 'react'
import { AirtelSafeMark, ShieldMark, SoundOffIcon, SoundOnIcon } from '../assets/icons'
import { PixelCross, PixelTick, pixelFamilyIcon } from '../assets/PixelIcon'
import { ParticleBurst } from '../assets/ParticleBurst'
import { PhoneDevice } from '../assets/PhoneDevice'
import { audio } from '../game/audio'
import { haptics } from '../game/haptics'
import type { Burst } from '../game/types'
import type { Family, Trust } from '../game/objectTypes'

interface Props {
  onPlay: () => void
  soundOn: boolean
  onToggleSound: () => void
  onRules: () => void
  returning: boolean
}

/**
 * The first screen is the tutorial.
 *
 * People kept tapping these stickers, which was read as a bug and is actually
 * the whole lesson trying to happen on its own: the screen shows things flying
 * at a phone, so of course a thumb goes for them. Nothing happened, so nothing
 * was learned, and the real teaching was left to a timed screen where a player
 * is already under pressure.
 *
 * So the stickers are real here. Tap a black one and it blows up. Tap a pale
 * one and the game says no. There is no clock, no score and nothing to lose —
 * you find out what the game is by poking it, which is the only explanation
 * that works without reading.
 */
const PREVIEW: Array<{ id: string; label: string; family: Family; trust: Trust }> = [
  { id: 'a', label: 'Spam Call', family: 'call', trust: 'threat' },
  { id: 'b', label: 'Suspicious Link', family: 'link', trust: 'threat' },
  { id: 'c', label: 'Mom Calling', family: 'call', trust: 'genuine' },
  { id: 'd', label: 'Spam SMS', family: 'sms', trust: 'threat' },
]

const THREATS = PREVIEW.filter((p) => p.trust === 'threat').length

export const GameIntro = ({ onPlay, soundOn, onToggleSound, onRules, returning }: Props) => {
  const [popped, setPopped] = useState<string[]>([])
  const [breaking, setBreaking] = useState<string[]>([])
  const [scolded, setScolded] = useState<string | null>(null)
  const [bursts, setBursts] = useState<Burst[]>([])
  const uid = useRef(0)
  const stage = useRef<HTMLDivElement>(null)

  const cleared = popped.length >= THREATS

  /**
   * Coach line. One thing at a time, and only ever the next thing.
   *
   * Every line names the badge by colour and by shape — "red ✕", "green ✓" —
   * because those two marks are the entire rule, and a mark you can point at
   * beats a sentence about trust. The last line is the rule as an equation.
   */
  const coach = useMemo(() => {
    if (scolded) return { key: 'oops', lead: 'Not that one!', sub: 'Green ✓ means real. Let it through.' }
    if (cleared) return { key: 'done', lead: 'That’s the whole game', sub: 'Red ✕ = tap it. Green ✓ = leave it.' }
    if (popped.length) return { key: 'mid', lead: 'Nice — one gone!', sub: 'Get the rest. Leave the green ✓ alone.' }
    return { key: 'start', lead: 'Tap the red ✕', sub: 'It’s spam, heading for your phone.' }
  }, [scolded, cleared, popped.length])

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
    window.setTimeout(() => setBursts((list) => list.filter((x) => x.id !== id)), 700)
  }, [])

  const onChip = useCallback(
    (p: (typeof PREVIEW)[number], e: React.MouseEvent<HTMLButtonElement>) => {
      // The tap is the user gesture the audio graph has been waiting for.
      audio.unlock()
      if (p.trust === 'threat') {
        if (breaking.includes(p.id) || popped.includes(p.id)) return
        burstAt(e.currentTarget, 'threat')
        audio.play('block')
        haptics.block()
        setBreaking((list) => [...list, p.id])
        window.setTimeout(() => setPopped((list) => [...list, p.id]), 380)
      } else {
        audio.play('wrong')
        haptics.wrong()
        setScolded(p.id)
        window.setTimeout(() => setScolded(null), 1600)
      }
    },
    [breaking, popped, burstAt],
  )

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

      <p key={coach.key} className="intro__coach" aria-live="polite">
        <span className="intro__coach-lead">{coach.lead}</span>
        <span className="intro__coach-sub">{coach.sub}</span>
      </p>

      <div className="intro__stage" ref={stage}>
        <div className="intro__glow" aria-hidden="true" />
        <div className="intro__device" aria-hidden="true">
          <PhoneDevice width={96} />
        </div>
        {PREVIEW.filter((p) => !popped.includes(p.id)).map((p) => (
          <button
            key={p.id}
            type="button"
            className={`intro__chip intro__chip--${p.id}${
              breaking.includes(p.id) ? ' is-breaking' : ''
            }${scolded === p.id ? ' is-scolded' : ''}${
              p.trust === 'threat' && !popped.length && !breaking.length ? ' is-inviting' : ''
            }`}
            data-trust={p.trust}
            data-family={p.family}
            onClick={(e) => onChip(p, e)}
            aria-label={
              p.trust === 'threat' ? `${p.label} — spam, tap to block` : `${p.label} — real, leave it`
            }
          >
            <span className="intro__chip-icon">{pixelFamilyIcon(p.family, p.trust, 14)}</span>
            <span>{p.label}</span>
            <span className="intro__chip-flag">
              {p.trust === 'threat' ? <PixelCross size={17} /> : <PixelTick size={17} />}
            </span>
          </button>
        ))}

        {bursts.map((b) => (
          <ParticleBurst key={b.id} burst={b} />
        ))}
      </div>

      <div className="intro__copy">
        <h1 className="intro__title">
          Shield<span>Rush</span>
        </h1>
      </div>

      <div className="intro__cta">
        <button
          type="button"
          className={`btn btn--primary btn--lg${cleared ? ' is-ready' : ''}`}
          onClick={onPlay}
        >
          {returning ? 'Play Again' : 'Play Now'}
        </button>
        <p className="btn-sub">Takes 20 seconds</p>
      </div>
    </section>
  )
}
