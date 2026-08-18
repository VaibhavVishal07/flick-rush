import type { Family, Trust } from '../game/objectTypes'
import { AirtelSafeLogo } from './AirtelSafeLogo'

/**
 * Every icon in Shield Rush is an inline SVG built here.
 * No image files, no icon packages, no remote assets.
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

/** Incoming call handset. */
export const ThreatCallIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6.2 3.6 8.4 3l1.7 4-2 1.4a11 11 0 0 0 5.5 5.5l1.4-2 4 1.7-.6 2.2a2 2 0 0 1-2.2 1.5C10.8 16.7 7.3 13.2 4.7 5.8A2 2 0 0 1 6.2 3.6Z" />
  </svg>
)

/** Message bubble. */
export const MessageIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5Z" />
    <path d="M8.5 8.8h7M8.5 11.8h4" />
  </svg>
)

/** Chain link. */
export const LinkIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l2.8-2.8a3.6 3.6 0 0 0-5.1-5.1l-1.4 1.4" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-2.8 2.8a3.6 3.6 0 0 0 5.1 5.1l1.4-1.4" />
  </svg>
)

/** Warning triangle. */
export const WarningIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 4.5 21 19.5H3Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

/** Saved contact — the calm counterpart to ThreatCallIcon. */
export const ContactIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8.6" r="3.4" />
    <path d="M5.4 19.4a6.8 6.8 0 0 1 13.2 0" />
  </svg>
)

/** Parcel. */
export const DeliveryIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3.6 20 7.6v8.8L12 20.4 4 16.4V7.6Z" />
    <path d="M4 7.6 12 11.6l8-4M12 11.6v8.8" />
  </svg>
)

/** Calendar. */
export const CalendarIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3.8" y="5.2" width="16.4" height="15" rx="2.4" />
    <path d="M3.8 9.8h16.4M8.4 3.4v3.6M15.6 3.4v3.6" />
  </svg>
)

/** One-time passcode. */
export const OtpIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3.6" y="8.2" width="16.8" height="11.4" rx="2.6" />
    <path d="M7.8 8.2V6.4a4.2 4.2 0 0 1 8.4 0v1.8" />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

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

export const LinkChainIcon = ({ size = 20, className }: IconProps) => (
  <LinkIcon size={size} className={className} />
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


export const familyIcon = (family: Family, trust: Trust, size = 22) => {
  switch (family) {
    case 'call':
      return trust === 'threat' ? <ThreatCallIcon size={size} /> : <ContactIcon size={size} />
    case 'sms':
      return <MessageIcon size={size} />
    case 'link':
      return <LinkIcon size={size} />
    case 'alert':
      return <WarningIcon size={size} />
    case 'delivery':
      return <DeliveryIcon size={size} />
    case 'calendar':
      return <CalendarIcon size={size} />
    case 'otp':
      return <OtpIcon size={size} />
    default:
      return <MessageIcon size={size} />
  }
}
