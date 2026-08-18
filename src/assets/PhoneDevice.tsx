/**
 * The thing you're defending. Deliberately not a recognisable handset — but
 * detailed enough to read as *your* phone: status bar, a live notification,
 * an app grid and a home indicator. Built entirely from SVG primitives.
 */
export const PhoneDevice = ({ width = 66 }: { width?: number }) => {
  const height = width * 1.86
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 66 123"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sr-screen" x1="10" y1="10" x2="56" y2="114">
          <stop offset="0" stopColor="#DCEEFF" />
          <stop offset="0.5" stopColor="#BBDFFF" />
          <stop offset="1" stopColor="#FFE3BC" />
        </linearGradient>
        <linearGradient id="sr-notif" x1="12" y1="26" x2="54" y2="38">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F2F7FF" />
        </linearGradient>
        <clipPath id="sr-screen-clip">
          <rect x="9.5" y="9.5" width="47" height="104" rx="11" />
        </clipPath>
      </defs>

      {/* Body */}
      <rect x="3" y="3" width="60" height="117" rx="17" fill="#FFFFFF" />
      <rect
        x="3"
        y="3"
        width="60"
        height="117"
        rx="17"
        stroke="#14224A"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Side buttons */}
      <rect x="1.4" y="34" width="2.6" height="9" rx="1.3" fill="#14224A" />
      <rect x="1.4" y="47" width="2.6" height="9" rx="1.3" fill="#14224A" />
      <rect x="62" y="38" width="2.6" height="13" rx="1.3" fill="#14224A" />

      {/* Screen */}
      <rect x="9.5" y="9.5" width="47" height="104" rx="11" fill="url(#sr-screen)" />

      <g clipPath="url(#sr-screen-clip)">
        {/* Status bar: time, signal, battery */}
        <rect x="13" y="13.6" width="7" height="2.6" rx="1.3" fill="#14224A" fillOpacity="0.55" />
        <g fill="#14224A" fillOpacity="0.5">
          <rect x="41.2" y="15" width="1.5" height="1.6" rx="0.5" />
          <rect x="43.4" y="14.2" width="1.5" height="2.4" rx="0.5" />
          <rect x="45.6" y="13.4" width="1.5" height="3.2" rx="0.5" />
        </g>
        <rect
          x="48.8"
          y="13.6"
          width="6.4"
          height="3.2"
          rx="1.1"
          stroke="#14224A"
          strokeOpacity="0.45"
          strokeWidth="0.9"
        />
        <rect x="49.8" y="14.5" width="3.6" height="1.4" rx="0.5" fill="#14224A" fillOpacity="0.5" />

        {/* Notification card — the reason the game exists */}
        <rect x="12.5" y="21" width="41" height="13" rx="4.5" fill="url(#sr-notif)" />
        <circle cx="19.5" cy="27.5" r="3.6" fill="#E8112D" />
        <path
          d="M18.1 26.1a3.4 3.4 0 0 0 3 3l.7-1 1.5.7-.2.9a.9.9 0 0 1-1 .6c-2.6-.5-4-1.9-5-4.6a.9.9 0 0 1 .6-1l.9-.2.7 1.5-1.2.1Z"
          fill="#fff"
        />
        <rect x="25.5" y="24.4" width="19" height="2.2" rx="1.1" fill="#14224A" fillOpacity="0.42" />
        <rect x="25.5" y="28.4" width="13" height="2" rx="1" fill="#14224A" fillOpacity="0.22" />

        {/* App grid */}
        <g>
          <rect x="13.5" y="41" width="11" height="11" rx="3.4" fill="#E8112D" fillOpacity="0.9" />
          <rect x="27.5" y="41" width="11" height="11" rx="3.4" fill="#22C55E" fillOpacity="0.85" />
          <rect x="41.5" y="41" width="11" height="11" rx="3.4" fill="#3B82F6" fillOpacity="0.85" />
          <rect x="13.5" y="57" width="11" height="11" rx="3.4" fill="#FBBF24" fillOpacity="0.9" />
          <rect x="27.5" y="57" width="11" height="11" rx="3.4" fill="#8B5CF6" fillOpacity="0.85" />
          <rect x="41.5" y="57" width="11" height="11" rx="3.4" fill="#06B6D4" fillOpacity="0.85" />
        </g>
        <g fill="#14224A" fillOpacity="0.18">
          <rect x="14.5" y="53.6" width="9" height="1.6" rx="0.8" />
          <rect x="28.5" y="53.6" width="9" height="1.6" rx="0.8" />
          <rect x="42.5" y="53.6" width="9" height="1.6" rx="0.8" />
          <rect x="14.5" y="69.6" width="9" height="1.6" rx="0.8" />
          <rect x="28.5" y="69.6" width="9" height="1.6" rx="0.8" />
          <rect x="42.5" y="69.6" width="9" height="1.6" rx="0.8" />
        </g>

        {/* Dock */}
        <rect x="12.5" y="79" width="41" height="16" rx="6" fill="#FFFFFF" fillOpacity="0.55" />
        <g fillOpacity="0.75">
          <rect x="16" y="82.5" width="9" height="9" rx="2.8" fill="#E8112D" />
          <rect x="28.5" y="82.5" width="9" height="9" rx="2.8" fill="#14224A" />
          <rect x="41" y="82.5" width="9" height="9" rx="2.8" fill="#22C55E" />
        </g>

        {/* Home indicator */}
        <rect x="25" y="106" width="16" height="2.4" rx="1.2" fill="#14224A" fillOpacity="0.4" />

        {/* Glass glint */}
        <path d="M6 96 Q6 88 14 88 L30 88 L10 112 Q6 108 6 100 Z" fill="#FFFFFF" fillOpacity="0.34" />
      </g>

      {/* Screen keyline + notch */}
      <rect
        x="9.5"
        y="9.5"
        width="47"
        height="104"
        rx="11"
        stroke="#14224A"
        strokeWidth="2.6"
        strokeOpacity="0.2"
      />
      <rect x="26" y="6.6" width="14" height="4" rx="2" fill="#14224A" />
    </svg>
  )
}
