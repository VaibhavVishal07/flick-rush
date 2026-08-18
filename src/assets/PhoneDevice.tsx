/**
 * The thing you're defending. Deliberately not a recognisable handset, but
 * detailed enough to read as *your* phone. Fewer, larger elements than a real
 * home screen — at this size legibility beats fidelity.
 */
export const PhoneDevice = ({ width = 89 }: { width?: number }) => {
  const height = width * 1.9
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 74 141"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sr-wall" x1="12" y1="12" x2="62" y2="130">
          <stop offset="0" stopColor="#EAF4FF" />
          <stop offset="0.45" stopColor="#CFE6FF" />
          <stop offset="1" stopColor="#FFE1C4" />
        </linearGradient>
        <linearGradient id="sr-body" x1="4" y1="4" x2="70" y2="137">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F0F3FA" />
        </linearGradient>
        <clipPath id="sr-wall-clip">
          <rect x="10" y="10" width="54" height="121" rx="13" />
        </clipPath>
      </defs>

      {/* Body */}
      <rect x="3.5" y="3.5" width="67" height="134" rx="20" fill="url(#sr-body)" />
      <rect
        x="3.5"
        y="3.5"
        width="67"
        height="134"
        rx="20"
        stroke="#14224A"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Side buttons */}
      <rect x="1.2" y="40" width="3" height="11" rx="1.5" fill="#14224A" />
      <rect x="1.2" y="55" width="3" height="11" rx="1.5" fill="#14224A" />
      <rect x="69.8" y="45" width="3" height="16" rx="1.5" fill="#14224A" />

      {/* Screen */}
      <rect x="10" y="10" width="54" height="121" rx="13" fill="url(#sr-wall)" />

      <g clipPath="url(#sr-wall-clip)">
        {/* Status bar */}
        <rect x="14.5" y="15.5" width="8" height="3" rx="1.5" fill="#14224A" fillOpacity="0.5" />
        <g fill="#14224A" fillOpacity="0.45">
          <rect x="46" y="17" width="1.8" height="1.8" rx="0.6" />
          <rect x="48.6" y="16" width="1.8" height="2.8" rx="0.6" />
          <rect x="51.2" y="15" width="1.8" height="3.8" rx="0.6" />
        </g>
        <rect
          x="55"
          y="15.2"
          width="7.4"
          height="3.8"
          rx="1.3"
          stroke="#14224A"
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <rect x="56.1" y="16.3" width="4.2" height="1.6" rx="0.6" fill="#14224A" fillOpacity="0.45" />

        {/* The hero element: an incoming call the game is all about */}
        <rect x="14" y="24" width="46" height="21" rx="7" fill="#FFFFFF" />
        <rect
          x="14"
          y="24"
          width="46"
          height="21"
          rx="7"
          stroke="#14224A"
          strokeOpacity="0.1"
          strokeWidth="1.4"
        />
        <circle cx="24" cy="34.5" r="6" fill="#E8112D" />
        <path
          d="M21.6 32.2a5.6 5.6 0 0 0 4.9 4.9l1.1-1.6 2.4 1.1-.3 1.4a1.4 1.4 0 0 1-1.6 1c-4.2-.8-6.5-3.1-8.1-7.5a1.4 1.4 0 0 1 1-1.6l1.4-.3 1.1 2.4-1.9.2Z"
          fill="#fff"
          transform="translate(-0.6 -0.4) scale(0.98)"
        />
        <rect x="33" y="30" width="22" height="3" rx="1.5" fill="#14224A" fillOpacity="0.4" />
        <rect x="33" y="36" width="14" height="2.6" rx="1.3" fill="#14224A" fillOpacity="0.2" />

        {/* App grid — two rows, generous tiles */}
        <g>
          <rect x="15" y="55" width="14" height="14" rx="4.6" fill="#E8112D" />
          <rect x="30" y="55" width="14" height="14" rx="4.6" fill="#22C55E" />
          <rect x="45" y="55" width="14" height="14" rx="4.6" fill="#3B82F6" />
          <rect x="15" y="76" width="14" height="14" rx="4.6" fill="#FBBF24" />
          <rect x="30" y="76" width="14" height="14" rx="4.6" fill="#8B5CF6" />
          <rect x="45" y="76" width="14" height="14" rx="4.6" fill="#06B6D4" />
        </g>
        <g fill="#14224A" fillOpacity="0.16">
          <rect x="16.5" y="71" width="11" height="2" rx="1" />
          <rect x="31.5" y="71" width="11" height="2" rx="1" />
          <rect x="46.5" y="71" width="11" height="2" rx="1" />
          <rect x="16.5" y="92" width="11" height="2" rx="1" />
          <rect x="31.5" y="92" width="11" height="2" rx="1" />
          <rect x="46.5" y="92" width="11" height="2" rx="1" />
        </g>

        {/* Page dots */}
        <g fill="#14224A" fillOpacity="0.28">
          <circle cx="34" cy="102" r="1.5" />
          <circle cx="40" cy="102" r="1.5" fillOpacity="0.5" />
        </g>

        {/* Dock */}
        <rect x="14" y="109" width="46" height="17" rx="7" fill="#FFFFFF" fillOpacity="0.6" />
        <g>
          <rect x="18" y="112.5" width="10" height="10" rx="3.4" fill="#E8112D" fillOpacity="0.85" />
          <rect x="32" y="112.5" width="10" height="10" rx="3.4" fill="#14224A" fillOpacity="0.8" />
          <rect x="46" y="112.5" width="10" height="10" rx="3.4" fill="#22C55E" fillOpacity="0.85" />
        </g>

        {/* Glass glint */}
        <path d="M4 92 Q4 82 14 82 L32 82 L8 112 Q4 106 4 98 Z" fill="#FFFFFF" fillOpacity="0.3" />
      </g>

      {/* Screen keyline + notch */}
      <rect
        x="10"
        y="10"
        width="54"
        height="121"
        rx="13"
        stroke="#14224A"
        strokeWidth="3"
        strokeOpacity="0.18"
      />
      <rect x="29" y="6.6" width="16" height="4.4" rx="2.2" fill="#14224A" />
    </svg>
  )
}
