/**
 * Every sound in Shield Rush is synthesised at runtime with the Web Audio API.
 * No audio files, no network requests, nothing to autoplay before a tap.
 */

type Cue =
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

  play(cue: Cue) {
    if (!this.ctx || !this.enabled) return
    switch (cue) {
      case 'flick':
        this.whoosh(0.075, 1100, 300, 0.18)
        break
      case 'block':
        this.tone(660, { type: 'triangle', peak: 0.13, decay: 0.075 })
        this.tone(990, { type: 'sine', peak: 0.07, decay: 0.05, delay: 0.03 })
        break
      case 'genuine':
        this.tone(523.25, { type: 'sine', peak: 0.1, decay: 0.1 })
        this.tone(783.99, { type: 'sine', peak: 0.07, decay: 0.14, delay: 0.07 })
        break
      case 'miss':
        this.tone(120, { type: 'sine', peak: 0.2, decay: 0.2, slideTo: 62 })
        this.whoosh(0.05, 300, 90, 0.16)
        break
      case 'wrong':
        this.tone(320, { type: 'square', peak: 0.07, decay: 0.09, slideTo: 190 })
        break
      case 'streak':
        this.tone(880, { type: 'sine', peak: 0.08, decay: 0.07 })
        this.tone(1174.66, { type: 'sine', peak: 0.06, decay: 0.09, delay: 0.06 })
        break
      case 'takeover':
        this.tone(196, { type: 'sine', peak: 0.14, attack: 0.05, decay: 0.7, slideTo: 587.33 })
        this.whoosh(0.06, 200, 2400, 0.5)
        break
      case 'autoBlock':
        this.tone(740, { type: 'triangle', peak: 0.075, decay: 0.05 })
        break
      case 'result':
        ;[523.25, 659.25, 783.99].forEach((f, i) =>
          this.tone(f, { type: 'sine', peak: 0.09, decay: 0.34, delay: i * 0.075 }),
        )
        break
    }
  }
}

export const audio = new AudioKit()
