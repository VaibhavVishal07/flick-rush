# Shield Rush

A mobile-first mini-game for **Airtel Safe**.

Spam calls, suspicious links and dodgy messages fly at your phone from every
direction. Flick the bad ones away. Let the real ones through. For about
seventeen seconds it is fun, then it is fast, then it is genuinely too much —
and that is the point. Airtel Safe steps in and does the whole thing
automatically, faster and cleaner than you ever could.

The takeaway is never "be more careful online". It is "you shouldn't have to be."

## The 30 seconds

| Stage | Duration | What happens |
| --- | --- | --- |
| Ingress | — | Four stickers orbit a phone — three to tap, one to leave. One button: **Play Now**. |
| Tutorial | ~3.5s | A **TAP!** badge and a pressing finger ride the first threat; a **LEAVE IT** badge rides the genuine call. No "Next" button. |
| Countdown | ~1.9s | 3 · 2 · 1 |
| Gameplay | 17s | Learn → Rush → Chaos → Swarm → **Flood** |
| Takeover | ~5.5s | Everything freezes. "Tough keeping up?" · "You shouldn't have to." Then a banner names it plainly — **Airtel Safe is handling it automatically** — and counts the blocks and allows as they happen. The last 1.2s stops spawning so the field clears and the arc ends calm. |
| Result | — | Verdict first, then throughput: you against Airtel Safe on the same job, itemised. |

First play lands around 29 seconds. Replays skip the tutorial and are live in
about two.

## Running it

```bash
npm install
npm run dev        # vite dev server
npm run build      # typecheck + production build
npm run preview    # serve the build
```

No backend, no API keys, no environment variables.

## How it is built

React 18 + TypeScript + Vite. DOM-based gameplay driven by a single
`requestAnimationFrame` loop — no game engine, no canvas for the interface, so
everything stays inspectable and tunable in the browser.

### Look

The chips keep the softer treatment — rounded pills, gentle gradients, a
white or green keyline. The chrome around them (buttons, HUD keys, panels)
follows the retro references.

Drawn, not generated. Soft gradients, blurred drop shadows and translucent
white keylines are exactly what makes a UI read as machine-made, so none of
them survive: every surface is a **flat fill with a 3px black keyline, a
solid offset shadow with no blur, and a halftone dot screen**. Panels carry a
window title bar with the old ─ ▢ ✕ marks. Buttons slide into their own
shadow on press, in stepped rather than eased timing.


An Airtel-red arena: deep crimson overhead through to warm sand underfoot.
Because the ground is red, nothing that matters can be red — threats are the
cool-dark family (violet, indigo, amber), genuine items the bright family
(green, cyan), and the primary action is gold. Every object is a sticker with
a white keyline, a hard bottom edge and a real press travel.

Display type is Pixelify Sans, UI type is Inter, both embedded as woff2 data
URIs. **All numerals are Inter** — Pixelify's `5` reads as an `S` and its `8`
and `9` are hard to tell apart, which is no good on a clock or a score.
Object labels also use the UI face — a pixel `C` reads as an `O` at
12px, and the player has a fraction of a second to tell a spam call from Mom.

The Airtel Safe lockup is the supplied master artwork, inlined as SVG. Its
"safe" is set in black, so it always sits on a white plate; the shield alone
is used where space is tight, and a plain white glyph stands in wherever the
background is red.

```
src/
  game/
    gameConfig.ts     every tuning value — timings, physics, scoring, stages
    objectTypes.ts    the catalogue of incoming objects
    physics.ts        homing, flick launch, drag, knock-back
    spawnEngine.ts    lane rotation, weighted picking, spawn geometry
    scoring.ts        verdicts, streaks, tallies
    useGameEngine.ts  the loop, the phase machine, pointer handling
    audio.ts          Web Audio synthesis (no audio files)
    haptics.ts        feature-detected vibration
  components/         GameIntro, GameArena, PhoneTarget, ScoreHUD,
                      SafeTakeover, ResultScreen, ShareCard, …
  assets/             inline SVG icons, PhoneDevice, SafeField, ParticleBurst
  styles/             global / game / screens
```

### Rendering

React owns which objects exist; the loop writes `transform` and `opacity`
straight to the DOM nodes each frame. Spawning and despawning re-render, motion
does not.

### The last two seconds

The Flood stage is not winnable, and that is the argument. Spawns drop to
150ms with up to fourteen objects live, and from 12.5s the arena starts to
panic: the edges darken, saturation climbs and the clock pulses. By the time
"Tough keeping up?" appears, the player has already stopped coping — the line
describes what they are feeling rather than telling them to feel it.

### Character

Every nuisance behaves like the thing it is, because a shared silhouette
with a swapped accent colour is exactly what reads as machine-made. Spam
calls ring — pulsing arcs, a handset shaking in its cradle. Messages carry a
blinking unread dot and twitch twice as fast. Suspicious links glitch, with
an RGB split across the label and a scanline over the fill. Fake rewards
glint and breathe. Genuine items do none of it: a contact avatar with a
double ring, breathing slowly, sitting level.

### Telling good from bad

Colour alone is too slow to read at speed, and useless for colour-blind
players. Threats and genuine items differ on four independent channels:

| | Threats | Genuine |
| --- | --- | --- |
| **Value** | near-black | white |
| Silhouette | hard-edged tag, hazard bar, square icon | soft pill, round icon |
| Colour | hazard bar by category — red, orange, violet, amber | green or cyan |
| Glyph | ✕ in red | ✓ in green |
| Motion | constant jitter | glides, level |

Value carries it. Lightness is the one difference the eye resolves in
peripheral vision, before hue and long before you read a label — hue alone
was not enough at speed.

The ingress preview chips carry the same treatment, so the language is
taught before the first round rather than during it.

### The break

A flicked sticker does not sail off — it comes apart. On release it splits
along a diagonal into two halves (the same markup under two clip paths, so
the break always matches whatever the sticker said), flashes white, throws a
crack streak and a shockwave, and sprays confetti on an arc.

The piece that makes it land is **hitstop**: for ~95ms the struck object
crawls at 12% of its launch velocity while the split plays, then rockets away
under gravity. Without it the throw is so fast the sticker is off-screen
before the halves have separated, and the whole gesture reads as weightless.

Grab, release and impact each get their own tick: a short haptic and a click
on pick-up, a whoosh on release, a noise crack plus a major-third pop on the
break, and a 1.2% screen kick — much smaller than the shake a miss earns.

### Dopamine

The block sound climbs a semitone per consecutive block and resets when the
streak breaks — the oldest trick in arcade audio and still the strongest.
The score punches when it moves, streak milestones flash the whole screen,
and every block still breaks the sticker apart under hitstop.

### Letting one through

Doing nothing had no reward, which made half the game feel like the absence
of a mistake. A genuine item is now **pulled into the phone** rather than
deleted on contact: it accelerates inward, shrinks, and blooms green while
the device bounces and throws a soft green ring — the warm counterpart to
the red ripple a missed threat earns. It comes with its own soft haptic and
a rising major arpeggio that resolves an octave up.

### Interaction

**Tap** is the whole game: one touch anywhere on a sticker deals with it, and
the object is thrown straight out from the phone with a lift so it arcs.

Swiping still works and is measured properly — pointer samples are collected
on the way down and release velocity is taken over the last 90ms rather than
the final two events, so a jittery last frame cannot decide the throw. Past
the threshold the object launches along the gesture instead of radially.
Nobody is penalised for the instinct to flick, but nobody has to.

### Tuning

Everything lives in `src/game/gameConfig.ts`: durations, spawn radius, object
speed, flick threshold and boost, scoring, streak tiers, and the four
difficulty stages. Nothing in `/components` hard-codes a number that belongs
there.

## Assets

All of them are generated in the repository — inline SVG, CSS gradients and
shadows, and CSS particles. No images, no icon packages, no fonts fetched, no
audio files. Sound is synthesised with the Web Audio API and only after the
Play tap, so nothing ever autoplays.

Object labels are generic and fictional. There are no real brands, sender IDs
or URLs anywhere in the game — phone numbers are masked, and the closest thing
to a link is the words "Shortened link".

## Personalisation

`safetyReport` in `gameConfig.ts` mocks the weekly Airtel Safe summary:

```ts
export const safetyReport = {
  totalHandled: 18,
  spamCalls: 7,
  spamMessages: 6,
  suspiciousLinks: 5,
}
```

When present, the ingress says how much Airtel Safe handled this week and the
spawn mix leans toward the categories that user actually gets hit with. Set it
to `null` for the generic ingress. It never reaches the share card.

## Sharing

The share card is drawn on a canvas at publish time — score, best streak, and a
challenge line. It uses `navigator.share` with the image where supported,
falls back to sharing a link, then to copying one. Only the game result is ever
shared, never anything about real traffic. `?c=11-15-8` on the URL shows the
friend's score on the ingress.

## Accessibility

Reduced-motion support (weave and particles off, gameplay intact), 44px tap
targets, focus rings, aria labels on every control, a live region for verdicts,
pause, a sound toggle, and a keyboard fallback — space or enter flicks whatever
is closest to the phone, `p` or escape pauses.
