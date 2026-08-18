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
| Ingress | — | Objects drift toward a phone. One button: **Play Now**. |
| Tutorial | ~3.5s | One threat to flick, one genuine call to let through. No "Next" button. |
| Countdown | ~1.9s | 3 · 2 · 1 |
| Gameplay | 17s | Learn → Rush → Chaos → Impossible |
| Takeover | ~3.6s | Everything freezes. "Tough keeping up?" · "You shouldn't have to." Then Airtel Safe handles it. |
| Result | — | You _n_/_N_ vs Airtel Safe _N_/_N_, plus share and Safety Report. |

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

### Flick physics

Pointer samples are collected on the way down, and release velocity is measured
over the last 90ms rather than the final two events — a jittery last frame
should not decide the throw. Past the threshold the object launches along the
measured vector, boosted and capped, with inertia, spin, scale and fade. A slow
but deliberate drag still throws, just gently. A tap does nothing and hands the
object back to gravity.

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
