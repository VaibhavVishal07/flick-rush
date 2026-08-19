import type { Family, Trust } from '../game/objectTypes'

/**
 * Pixel icons, drawn by hand on a 12x12 grid.
 *
 * The previous set was rounded-stroke vector glyphs — the house style of
 * every icon library there is, and completely at odds with a game built out
 * of Pixelify Sans, 3px keylines and hard offset shadows. These are solid
 * cells on a grid with `crispEdges`, so they belong to the same world as the
 * type. Each map is 12 rows of 12 characters:
 *
 *   `.` empty   `#` ink (currentColor)   `o` accent (--px-accent)
 */

const G = 12

type Map = readonly string[]

/* A ringing bell. A handset silhouette collapses into a blob at this size. */
const CALL: Map = [
  '.....##.....',
  '....####....',
  '...######...',
  '...######...',
  '..########..',
  '..########..',
  '.##########.',
  '.##########.',
  '############',
  '............',
  '....####....',
  '.....##.....',
]

const SMS: Map = [
  '############',
  '##........##',
  '##.oooooo.##',
  '##........##',
  '##.oooooo.##',
  '##........##',
  '##.oooo...##',
  '##........##',
  '############',
  '...####.....',
  '..####......',
  '.####.......',
]

/* A hook, eye and all. Phishing drawn as the thing it is — and the eye loop
   is what stops it reading as a letter J. */
const LINK: Map = [
  '....####....',
  '...##..##...',
  '...##..##...',
  '....####....',
  '.....##.....',
  '.....##.....',
  '.....##.....',
  '.##..##.....',
  '###..##.....',
  '###.###.....',
  '.######.....',
  '..####......',
]

/* A crown. "You've won!" in one shape, which is exactly what a fake reward
   is pretending to be. */
const ALERT: Map = [
  '............',
  '.##......##.',
  '.##..##..##.',
  '.##.####.##.',
  '.##.####.##.',
  '.##########.',
  '.##########.',
  '.##oo##oo##.',
  '.##########.',
  '.##########.',
  '............',
  '............',
]

/* Head and shoulders, filled — the hollow outline read as a signet ring. */
const CONTACT: Map = [
  '....####....',
  '...######...',
  '...######...',
  '....####....',
  '............',
  '...######...',
  '..##oooo##..',
  '.##oooooo##.',
  '##oooooooo##',
  '##oooooooo##',
  '##oooooooo##',
  '............',
]

/* A taped parcel: box edges, a band across and a seam down. The strapless
   version read as a picture frame. */
const DELIVERY: Map = [
  '............',
  '############',
  '##oo####oo##',
  '##oo####oo##',
  '############',
  '############',
  '##oo####oo##',
  '##oo####oo##',
  '##oo####oo##',
  '############',
  '............',
  '............',
]

const CALENDAR: Map = [
  '..##....##..',
  '..##....##..',
  '############',
  '############',
  '#..........#',
  '#.oo.oo.oo.#',
  '#..........#',
  '#.oo.oo.oo.#',
  '#..........#',
  '#.oo.oo....#',
  '#..........#',
  '############',
]

const OTP: Map = [
  '...######...',
  '..##....##..',
  '..##....##..',
  '..##....##..',
  '############',
  '##oooooooo##',
  '##oo####oo##',
  '##oo####oo##',
  '##ooo##ooo##',
  '##ooo##ooo##',
  '##oooooooo##',
  '############',
]

const CROSS: Map = [
  '............',
  '.##......##.',
  '.###....###.',
  '..###..###..',
  '...######...',
  '....####....',
  '....####....',
  '...######...',
  '..###..###..',
  '.###....###.',
  '.##......##.',
  '............',
]

const TICK: Map = [
  '............',
  '..........##',
  '.........###',
  '........###.',
  '.##....###..',
  '.###..###...',
  '..######....',
  '...####.....',
  '....##......',
  '............',
  '............',
  '............',
]

/** Merge horizontally adjacent cells into one rect — fewer nodes per frame. */
const runs = (map: Map, char: string) => {
  const out: { x: number; y: number; w: number }[] = []
  map.forEach((row, y) => {
    let start = -1
    for (let x = 0; x <= G; x++) {
      const on = row[x] === char
      if (on && start < 0) start = x
      else if (!on && start >= 0) {
        out.push({ x: start, y, w: x - start })
        start = -1
      }
    }
  })
  return out
}

const Grid = ({ map, size }: { map: Map; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${G} ${G}`}
    shapeRendering="crispEdges"
    aria-hidden="true"
    focusable="false"
  >
    {runs(map, '#').map((r) => (
      <rect key={`i${r.y}-${r.x}`} x={r.x} y={r.y} width={r.w} height={1} fill="currentColor" />
    ))}
    {runs(map, 'o').map((r) => (
      <rect
        key={`a${r.y}-${r.x}`}
        x={r.x}
        y={r.y}
        width={r.w}
        height={1}
        fill="var(--px-accent, currentColor)"
      />
    ))}
  </svg>
)

export const PixelCross = ({ size = 13 }: { size?: number }) => <Grid map={CROSS} size={size} />
export const PixelTick = ({ size = 13 }: { size?: number }) => <Grid map={TICK} size={size} />

const FAMILY: Record<string, Map> = {
  call: CALL,
  sms: SMS,
  link: LINK,
  alert: ALERT,
  delivery: DELIVERY,
  calendar: CALENDAR,
  otp: OTP,
}

export const pixelFamilyIcon = (family: Family, trust: Trust, size = 22) => {
  const map = family === 'call' && trust === 'genuine' ? CONTACT : (FAMILY[family] ?? SMS)
  return <Grid map={map} size={size} />
}
