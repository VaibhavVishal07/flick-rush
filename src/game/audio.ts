/**
 * Every sound in Spam Smash is synthesised at runtime with the Web Audio API.
 * No audio files, no network requests, nothing to autoplay before a tap.
 *
 * That includes the music. The onboarding loop below is a two-bar chiptune
 * pattern scheduled note by note against the audio clock, so it costs a few
 * oscillators rather than a download, and it can start on the exact beat the
 * screen asks for it.
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

/**
 * The score. One loop that runs from the onboarding screen all the way to the
 * result, changing mood instead of stopping and starting, so the whole thing
 * plays as a single piece with an arc rather than as four cues.
 *
 * Every pattern is two bars of sixteenths, `0` for a rest. They share a key
 * (A minor to F) and a grid, so a mood can be swapped on any step and the
 * next note still belongs to the same music.
 */
export type Mood = 'menu' | 'play' | 'panic' | 'calm'

const BPM = 128
const STEP = 60 / BPM / 4
const A1 = 55, A2 = 110, E2 = 82.41, E3 = 164.81, F2 = 87.31, C3 = 130.81, G2 = 98, Bb2 = 116.54
const A4 = 440, C5 = 523.25, E5 = 659.25, A5 = 880, B4 = 493.88, D5 = 587.33
const F4 = 349.23, F5 = 698.46, G5 = 783.99, Eb5 = 622.25, Bb4 = 466.16, C6 = 1046.5

interface Pattern {
  /** Multiplies the tempo. Panic is not a different tune, it is a faster one. */
  rate: number
  /** Overall level, relative to the music bus. */
  level: number
  bass: number[]
  lead: number[]
  hat: number[]
  /** Waveforms, so the moods differ in timbre and not only in density. */
  bassType: OscillatorType
  leadType: OscillatorType
  /** Note length multiplier — long for calm, clipped for panic. */
  hold: number
}

/** Waiting to start: a groove, not a drive. Room left over the top for cues. */
const MENU: Pattern = {
  rate: 1,
  level: 1,
  bassType: 'square',
  leadType: 'triangle',
  hold: 1,
  bass: [
    A2, 0, 0, E3, 0, 0, A2, 0, A2, 0, 0, E3, 0, 0, A2, 0,
    F2, 0, 0, C3, 0, 0, F2, 0, F2, 0, 0, C3, 0, 0, F2, 0,
  ],
  lead: [
    A4, 0, C5, 0, E5, 0, C5, 0, E5, 0, A5, 0, E5, 0, C5, 0,
    F4, 0, A4, 0, C5, 0, A4, 0, C5, 0, F5, 0, C5, 0, A4, 0,
  ],
  /** Offbeat only — on the beat it would fight the bass. */
  hat: [
    0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
    0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
  ],
}

/** Playing: same tune, driven. Bass on every eighth, hats on every offbeat. */
const PLAY: Pattern = {
  rate: 1.06,
  level: 1,
  bassType: 'square',
  leadType: 'square',
  hold: 0.85,
  bass: [
    A2, 0, A2, E3, 0, A2, A2, 0, A2, 0, A2, E3, 0, A2, E2, 0,
    F2, 0, F2, C3, 0, F2, F2, 0, F2, 0, F2, C3, 0, F2, G2, 0,
  ],
  lead: [
    A4, 0, C5, E5, 0, C5, E5, 0, A5, 0, E5, C5, 0, E5, D5, 0,
    F4, 0, A4, C5, 0, A4, C5, 0, F5, 0, C5, A4, 0, C5, B4, 0,
  ],
  hat: [
    0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0,
    0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0,
  ],
}

/**
 * The last stretch, when the field stops being winnable. A third faster, a
 * saw bass an octave down, hats on every step, and the melody bent onto the
 * flat fifth and flat sixth — the same key, going wrong.
 */
const PANIC: Pattern = {
  rate: 1.34,
  level: 1.18,
  bassType: 'sawtooth',
  leadType: 'sawtooth',
  hold: 0.7,
  bass: [
    A1, A1, A2, A1, A1, A1, A2, A1, A1, A1, A2, A1, E2, E2, E2, E2,
    A1, A1, A2, A1, A1, A1, A2, A1, Bb2, 0, A1, A1, E2, E2, E2, E2,
  ],
  lead: [
    A5, 0, Eb5, 0, E5, 0, Eb5, 0, A5, 0, G5, 0, Eb5, 0, D5, 0,
    Bb4, 0, Eb5, 0, E5, 0, G5, 0, A5, 0, Eb5, 0, C5, 0, Bb4, 0,
  ],
  hat: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ],
}

/**
 * After Airtel Safe steps in. Half speed, no percussion, and the first major
 * chord in the whole piece — the relief has to be audible, not just visible.
 */
const CALM: Pattern = {
  rate: 0.5,
  level: 0.8,
  bassType: 'sine',
  leadType: 'sine',
  hold: 2.6,
  bass: [
    F2, 0, 0, 0, 0, 0, 0, 0, C3, 0, 0, 0, 0, 0, 0, 0,
    A2, 0, 0, 0, 0, 0, 0, 0, E3, 0, 0, 0, 0, 0, 0, 0,
  ],
  lead: [
    C5, 0, 0, 0, F5, 0, 0, 0, A5, 0, 0, 0, F5, 0, 0, 0,
    E5, 0, 0, 0, A5, 0, 0, 0, C6, 0, 0, 0, A5, 0, 0, 0,
  ],
  hat: new Array(32).fill(0),
}

const MOODS: Record<Mood, Pattern> = { menu: MENU, play: PLAY, panic: PANIC, calm: CALM }

/** Under the cues by a wide margin: this is a floor, not a foreground. */
const MUSIC_GAIN = 0.17

class AudioKit {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private music: {
    bus: GainNode
    timer: number
    step: number
    next: number
    mood: Mood
  } | null = null
  enabled = true

  /** True once a gesture has built the graph — music can start without waiting. */
  get ready() {
    return this.ctx !== null
  }

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

  /* -------------------------------------------------------------- music -- */

  /**
   * Set what the music is doing. `null` stops it.
   *
   * Starting is a no-op until a gesture has unlocked the graph, so this can be
   * called on mount without ever being the thing that autoplays. Changing mood
   * on a loop that is already running swaps the pattern in place — the cursor,
   * the bus and the fade all survive, so the piece never restarts.
   */
  setMood(mood: Mood | null) {
    if (!mood) {
      this.stopMusic()
      return
    }
    const ctx = this.ctx
    if (!ctx || !this.master) return
    if (this.music) {
      if (this.music.mood === mood) return
      this.music.mood = mood
      return
    }
    void ctx.resume()
    const bus = ctx.createGain()
    // Faded in rather than switched on: a loop that simply appears at full
    // level reads as a glitch, not as music starting.
    bus.gain.setValueAtTime(0.0001, ctx.currentTime)
    bus.gain.exponentialRampToValueAtTime(MUSIC_GAIN, ctx.currentTime + 1.1)
    bus.connect(this.master)
    this.music = { bus, timer: 0, step: 0, next: ctx.currentTime + 0.08, mood }
    this.music.timer = window.setInterval(() => this.pump(), 25)
  }

  /** Fade out and tear down. Safe to call when nothing is playing. */
  stopMusic() {
    const m = this.music
    const ctx = this.ctx
    if (!m || !ctx) return
    this.music = null
    window.clearInterval(m.timer)
    const t = ctx.currentTime
    m.bus.gain.cancelScheduledValues(t)
    m.bus.gain.setValueAtTime(Math.max(m.bus.gain.value, 0.0001), t)
    m.bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.38)
    window.setTimeout(() => m.bus.disconnect(), 700)
  }

  get musicPlaying() {
    return this.music !== null
  }

  /**
   * Schedule every step that falls inside the next 150ms and step the cursor.
   *
   * The interval that drives this is throttled to about once a second in a
   * background tab, which would leave the cursor far behind the clock and then
   * fire a whole bar at once on return. If that happens the loop resyncs to
   * now instead of catching up.
   */
  private pump() {
    const ctx = this.ctx
    const m = this.music
    if (!ctx || !m) return
    if (m.next < ctx.currentTime) m.next = ctx.currentTime + 0.02
    while (m.next < ctx.currentTime + 0.15) {
      // Read every step, so a mood change lands on the next note rather than
      // at the end of the bar.
      const pat = MOODS[m.mood]
      const i = m.step % pat.bass.length
      const t = m.next
      const lv = pat.level
      if (pat.bass[i]) {
        this.blip(pat.bass[i], t, 0.16 * pat.hold, pat.bassType, 0.22 * lv, m.bus)
      }
      if (pat.lead[i]) {
        this.blip(pat.lead[i], t, 0.11 * pat.hold, pat.leadType, 0.13 * lv, m.bus)
      }
      if (pat.hat[i]) this.tick(t, m.bus)
      m.step++
      m.next += STEP / pat.rate
    }
  }

  /** One note, at an absolute time on the audio clock. */
  private blip(
    freq: number,
    at: number,
    dur: number,
    type: OscillatorType,
    peak: number,
    dest: GainNode,
  ) {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, at)
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(gain).connect(dest)
    osc.start(at)
    osc.stop(at + dur + 0.02)
  }

  /** A hat: filtered noise, short enough to be a tick rather than a hiss. */
  private tick(at: number, dest: GainNode) {
    const ctx = this.ctx
    if (!ctx || !this.noise) return
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7200
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.05, at + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05)
    src.connect(hp).connect(gain).connect(dest)
    src.start(at)
    src.stop(at + 0.08)
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
