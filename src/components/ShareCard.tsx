import { useCallback, useRef, useState } from 'react'
import { AirtelSafeMark, ShareIcon } from '../assets/icons'
import { AirtelShield } from '../assets/AirtelSafeLogo'

interface Props {
  correct: number
  total: number
  bestStreak: number
  onClose: () => void
}

const CARD_W = 1080
const CARD_H = 1350

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const DISPLAY = `"Pixelify Sans", "Courier New", ui-monospace, monospace`
const UI = `Nunito, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`

const SKY_1 = '#8F0A1E'
const SKY_2 = '#E8112D'
const SKY_3 = '#FF6A52'
const INK = '#14224A'
const GOLD = '#C98A00'

/** `letterSpacing` is well supported but still missing from some lib.dom builds. */
const setTracking = (ctx: CanvasRenderingContext2D, value: string) => {
  ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = value
}

/**
 * Share card. Drawn natively on a canvas — no images in, no images fetched.
 * Only the game result is ever shared; nothing about the user's real traffic.
 */
export const ShareCard = ({ correct, total, bestStreak, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const challengeUrl = (() => {
    if (typeof window === 'undefined') return ''
    const u = new URL(window.location.href)
    u.searchParams.set('c', `${correct}-${total}-${bestStreak}`)
    return u.toString()
  })()

  const draw = useCallback(() => {
    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvas.width = CARD_W
    canvas.height = CARD_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Sky, same daylight gradient the game is played on.
    const bg = ctx.createLinearGradient(0, 0, 220, CARD_H)
    bg.addColorStop(0, SKY_1)
    bg.addColorStop(0.58, SKY_2)
    bg.addColorStop(1, SKY_3)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    const sun = ctx.createRadialGradient(CARD_W / 2, 180, 20, CARD_W / 2, 180, 620)
    sun.addColorStop(0, 'rgba(255,255,255,0.34)')
    sun.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = sun
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    ctx.textAlign = 'center'

    // Wordmark
    ctx.fillStyle = INK
    ctx.font = `700 42px ${DISPLAY}`
    setTracking(ctx, '14px')
    ctx.globalAlpha = 0.4
    ctx.fillText('SHIELD RUSH', CARD_W / 2, 176)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('SHIELD RUSH', CARD_W / 2, 170)
    setTracking(ctx, '0px')

    // White plate with the game's hard bottom edge
    ctx.fillStyle = 'rgba(20,34,74,0.22)'
    roundRect(ctx, 84, 268, CARD_W - 168, 720, 60)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    roundRect(ctx, 84, 252, CARD_W - 168, 720, 60)
    ctx.fill()

    // Score
    ctx.fillStyle = '#6B7BA6'
    ctx.font = `900 30px ${UI}`
    setTracking(ctx, '7px')
    ctx.fillText('MY SCORE', CARD_W / 2, 380)
    setTracking(ctx, '0px')

    ctx.fillStyle = INK
    ctx.font = `900 156px ${UI}`
    ctx.fillText(`${correct} / ${total}`, CARD_W / 2, 570)

    // Divider
    ctx.fillStyle = 'rgba(20,34,74,0.1)'
    roundRect(ctx, 210, 636, CARD_W - 420, 6, 3)
    ctx.fill()

    // Streak
    ctx.fillStyle = '#6B7BA6'
    ctx.font = `900 30px ${UI}`
    setTracking(ctx, '7px')
    ctx.fillText('BEST STREAK', CARD_W / 2, 722)
    setTracking(ctx, '0px')

    ctx.fillStyle = GOLD
    ctx.font = `900 108px ${UI}`
    ctx.fillText(`×${bestStreak}`, CARD_W / 2, 862)

    // Challenge
    ctx.font = `700 52px ${DISPLAY}`
    ctx.fillStyle = 'rgba(20,34,74,0.35)'
    ctx.fillText('Think you can beat me?', CARD_W / 2, 1122)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('Think you can beat me?', CARD_W / 2, 1116)

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = `700 32px ${UI}`
    ctx.fillText('Play Shield Rush on Airtel', CARD_W / 2, 1206)

    return canvas
  }, [bestStreak, correct, total])

  const toBlob = useCallback(async () => {
    // Canvas silently falls back if the display face has not loaded yet.
    await document.fonts?.ready?.catch?.(() => undefined)
    return new Promise<Blob | null>((resolve) => {
      const canvas = draw()
      if (!canvas) return resolve(null)
      canvas.toBlob((b) => resolve(b), 'image/png')
    })
  }, [draw])

  const flash = (msg: string) => {
    setNote(msg)
    window.setTimeout(() => setNote(null), 2200)
  }

  const onShare = useCallback(async () => {
    const text = `I handled ${correct}/${total} in Shield Rush. Think you can beat me?`
    try {
      const blob = await toBlob()
      if (blob && typeof navigator.canShare === 'function') {
        const file = new File([blob], 'shield-rush.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text, title: 'Shield Rush' })
          return
        }
      }
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Shield Rush', text, url: challengeUrl })
        return
      }
      await navigator.clipboard.writeText(`${text} ${challengeUrl}`)
      flash('Challenge link copied')
    } catch {
      /* user dismissed the sheet — nothing to report */
    }
  }, [challengeUrl, correct, toBlob, total])

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(challengeUrl)
      flash('Challenge link copied')
    } catch {
      flash('Copy not available here')
    }
  }, [challengeUrl])

  const onSave = useCallback(async () => {
    const blob = await toBlob()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'shield-rush.png'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [toBlob])

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Challenge a friend">
      <button type="button" className="sheet__scrim" onClick={onClose} aria-label="Close" />
      <div className="sheet__panel">
        <div className="share-card">
          <span className="share-card__glow" aria-hidden="true" />
          <p className="share-card__wordmark">SHIELD RUSH</p>

          <div className="share-card__plate">
            <p className="share-card__cap">My score</p>
            <p className="share-card__score">
              {correct} <span>/ {total}</span>
            </p>
            <div className="share-card__rule" />
            <p className="share-card__cap">Best streak</p>
            <p className="share-card__streak">×{bestStreak}</p>
          </div>

          <p className="share-card__challenge">Think you can beat me?</p>
          <p className="share-card__foot">
            <AirtelShield size={15} /> Play Shield Rush on Airtel
          </p>
        </div>

        <div className="sheet__actions">
          <button type="button" className="btn btn--primary" onClick={onShare}>
            <ShareIcon size={17} /> Share Challenge
          </button>
          <div className="sheet__row">
            <button type="button" className="btn btn--ghost" onClick={onCopy}>
              Copy Challenge Link
            </button>
            <button type="button" className="btn btn--ghost" onClick={onSave}>
              Save Card
            </button>
          </div>
          <button type="button" className="btn btn--text" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="sheet__note" aria-live="polite">
          {note ?? 'Only your game result is shared.'}
        </p>

        <div className="sheet__brand">
          <AirtelSafeMark compact />
        </div>
        <canvas ref={canvasRef} className="sr-only" aria-hidden="true" />
      </div>
    </div>
  )
}
