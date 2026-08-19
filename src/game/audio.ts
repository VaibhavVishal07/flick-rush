/**
 * Every sound in Spam Smash is synthesised at runtime with the Web Audio API.
 * No audio files, no network requests, nothing to autoplay before a tap.
 */

type Cue =
  | 'grab'
  | 'flick'
  | 'block'
  | 'genuine'
  | 'miss'
  | 'wrong'
  | 'streak'
  | 'takeover'
  | 'autoBlock'
  | 'result'

class AudioKit {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  enabled = true

  /** Call from inside a user gesture (the Play tap). */
  unlock() {
    if (this.ctx) {
      void this.ctx.resume()
      return
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return
    try {
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.5
      this.master.connect(this.ctx.destination)
      this.noise = this.makeNoise(this.ctx)
    } catch {
      this.ctx = null
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (this.master) this.master.gain.value = on ? 0.5 : 0
  }

  private makeNoise(ctx: AudioContext) {
    const len = Math.floor(ctx.sampleRate * 0.4)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    return buf
  }

  private env(node: GainNode, peak: number, attack: number, decay: number) {
    const t = this.ctx!.currentTime
    node.gain.setValueAtTime(0.0001, t)
    node.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack)
    node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  }

  private tone(
    freq: number,
    opts: {
      type?: OscillatorType
      peak?: number
      attack?: number
      decay?: number
      slideTo?: number
      delay?: number
    } = {},
  ) {
    const ctx = this.ctx
    if (!ctx || !this.master || !this.enabled) return
    const {
      type = 'sine',
      peak = 0.16,
      attack = 0.004,
      decay = 0.12,
      slideTo,
      delay = 0,
    } = opts
    const t0 = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + attack + decay)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(peak, t0 + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay)
    osc.connect(gain).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + attack + decay + 0.05)
  }

  private whoosh(peak = 0.1, from = 900, to = 240, dur = 0.22) {
    const ctx = this.ctx
    if (!ctx || !this.master || !this.noise || !this.enabled) return
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 0.9
    filter.frequency.setValueAtTime(from, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + dur)
    const gain = ctx.createGain()
    this.env(gain, peak, 0.012, dur)
    src.connect(filter).connect(gain).connect(this.master)
    src.start()
    src.stop(ctx.currentTime + dur + 0.06)
  }

  /** `step` transposes a cue up in semitones — used to climb a streak. */
  play(cue: Cue, step = 0) {
    if (!this.ctx || !this.enabled) return
    const k = Math.pow(2, Math.min(step, 12) / 12)
    switch (cue) {
      // A tiny click the instant a sticker is picked up.
      case 'grab':
        this.tone(1568, { type: 'square', peak: 0.035, attack: 0.002, decay: 0.028 })
        break
      // Air moving past a thrown sticker.
      case 'flick':
        this.whoosh(0.085, 1500, 360, 0.15)
        break
      // Something breaking: a noise crack under a bright major-third pop.
      case 'block':
        this.whoosh(0.11, 5200, 900, 0.075)
        this.tone(784 * k, { type: 'triangle', peak: 0.15, decay: 0.07 })
        this.tone(1046.5 * k, { type: 'triangle', peak: 0.11, decay: 0.09, delay: 0.045 })
        break
      // A rising major arpeggio that resolves an octave up — the sound of
      // something arriving safely, not merely of nothing going wrong.
      case 'genuine':
        this.tone(523.25, { type: 'sine', peak: 0.12, decay: 0.16 })
        this.tone(659.25, { type: 'sine', peak: 0.1, decay: 0.18, delay: 0.06 })
        this.tone(783.99, { type: 'sine', peak: 0.09, decay: 0.2, delay: 0.12 })
        this.tone(1046.5, { type: 'triangle', peak: 0.07, decay: 0.3, delay: 0.18 })
        break
      // A cartoon bonk, not an alarm.
      case 'miss':
        this.tone(196, { type: 'triangle', peak: 0.2, decay: 0.22, slideTo: 82 })
        this.whoosh(0.05, 420, 110, 0.18)
        break
      // Comic slide down — playful, never punitive.
      case 'wrong':
        this.tone(440, { type: 'square', peak: 0.06, decay: 0.16, slideTo: 220 })
        break
      // Coin-style rising arpeggio.
      case 'streak':
        ;[659.25, 880, 1174.66].forEach((f, i) =>
          this.tone(f, { type: 'triangle', peak: 0.1, decay: 0.1, delay: i * 0.055 }),
        )
        break
      // The cavalry: a sweep under a bright fifth.
      case 'takeover':
        this.tone(146.83, {
          type: 'sawtooth',
          peak: 0.1,
          attack: 0.06,
          decay: 0.75,
          slideTo: 587.33,
        })
        this.tone(880, { type: 'triangle', peak: 0.1, decay: 0.4, delay: 0.42 })
        this.tone(1318.51, { type: 'triangle', peak: 0.08, decay: 0.45, delay: 0.5 })
        this.whoosh(0.07, 240, 3200, 0.55)
        break
      case 'autoBlock':
        this.tone(1046.5, { type: 'triangle', peak: 0.07, decay: 0.045 })
        break
      // Four-note fanfare on the way to the result.
      case 'result':
        ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          this.tone(f, { type: 'triangle', peak: 0.1, decay: 0.3, delay: i * 0.085 }),
        )
        break
    }
  }
}

export const audio = new AudioKit()
