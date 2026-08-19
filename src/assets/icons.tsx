import { AirtelSafeLogo } from './AirtelSafeLogo'

/**
 * Chrome icons — pause, sound, share — plus the Airtel Safe marks. Every one is
 * an inline SVG built here: no image files, no icon packages, no remote
 * assets. Family glyphs live in PixelIcon instead, drawn on a 12x12 grid so
 * they match the type rather than a UI kit.
 */

type IconProps = {
  size?: number
  className?: string
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
})

/** Airtel Safe mark — a shield with a confident tick. */
export const ShieldMark = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className} strokeWidth={1.9}>
    <path d="M12 3.2 19 6v6c0 4.2-2.8 7.4-7 8.8-4.2-1.4-7-4.6-7-8.8V6Z" />
    <path d="M9 12.2 11.2 14.4 15.4 10" />
  </svg>
)

export const PauseIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} strokeWidth={2.1}>
    <path d="M9.2 5.5v13M14.8 5.5v13" />
  </svg>
)

export const PlayIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} strokeWidth={2}>
    <path d="M7.5 5.2 18.6 12 7.5 18.8Z" />
  </svg>
)

export const SoundOnIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 9.4h3.2L12.6 6v12L8.2 14.6H5Z" />
    <path d="M16 9.6a3.6 3.6 0 0 1 0 4.8M18.5 7.2a7 7 0 0 1 0 9.6" />
  </svg>
)

export const SoundOffIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 9.4h3.2L12.6 6v12L8.2 14.6H5Z" />
    <path d="M16.2 10.2 20 14M20 10.2 16.2 14" />
  </svg>
)

export const ShareIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 15.5V4.2M8.4 7.6 12 4l3.6 3.6" />
    <path d="M5.5 13v5.4a1.6 1.6 0 0 0 1.6 1.6h9.8a1.6 1.6 0 0 0 1.6-1.6V13" />
  </svg>
)

/**
 * Airtel Safe lockup on its white plate. The plate matters: the master
 * artwork sets "safe" in black, which would vanish on the game's blue sky.
 */
export const AirtelSafeMark = ({ compact = false }: { compact?: boolean }) => (
  <span className={`brand-mark${compact ? ' brand-mark--compact' : ''}`}>
    <AirtelSafeLogo width={compact ? 82 : 104} />
  </span>
)

