import { useCallback, useRef, useState } from 'react'
import { AirtelSafeMark, ShareIcon, ShieldMark } from '../assets/icons'

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

const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif`

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

    // Ground
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
    bg.addColorStop(0, '#141016')
    bg.addColorStop(0.55, '#0B0B0E')
    bg.addColorStop(1, '#0A0A0C')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Airtel red bloom
    const bloom = ctx.createRadialGradient(CARD_W / 2, 300, 40, CARD_W / 2, 300, 720)
    bloom.addColorStop(0, 'rgba(232, 17, 45, 0.34)')
    bloom.addColorStop(1, 'rgba(232, 17, 45, 0)')
    ctx.fillStyle = bloom
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Card plate
    ctx.fillStyle = 'rgba(255,255,255,0.045)'
    roundRect(ctx, 88, 300, CARD_W - 176, 700, 56)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.textAlign = 'center'

    // Wordmark
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = `600 34px ${FONT}`
    setTracking(ctx, '10px')
    ctx.fillText('SHIELD RUSH', CARD_W / 2, 196)
    setTracking(ctx, '0px')

    // Score
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = `600 30px ${FONT}`
    setTracking(ctx, '6px')
    ctx.fillText('MY SCORE', CARD_W / 2, 420)
    setTracking(ctx, '0px')

    ctx.fillStyle = '#FFFFFF'
    ctx.font = `700 190px ${FONT}`
    ctx.fillText(`${correct} / ${total}`, CARD_W / 2, 590)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(220, 668)
    ctx.lineTo(CARD_W - 220, 668)
    ctx.stroke()

    // Streak
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = `600 30px ${FONT}`
    setTracking(ctx, '6px')
    ctx.fillText('BEST STREAK', CARD_W / 2, 754)
    setTracking(ctx, '0px')

    ctx.fillStyle = '#FF3348'
    ctx.font = `700 118px ${FONT}`
    ctx.fillText(`×${bestStreak}`, CARD_W / 2, 890)

    // Challenge
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `600 52px ${FONT}`
    ctx.fillText('Think you can beat me?', CARD_W / 2, 1130)

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = `500 30px ${FONT}`
    ctx.fillText('Play Shield Rush on Airtel', CARD_W / 2, 1218)

    return canvas
  }, [bestStreak, correct, total])

  const toBlob = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        const canvas = draw()
        if (!canvas) return resolve(null)
        canvas.toBlob((b) => resolve(b), 'image/png')
      }),
    [draw],
  )

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
            <ShieldMark size={13} /> Play Shield Rush on Airtel
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
