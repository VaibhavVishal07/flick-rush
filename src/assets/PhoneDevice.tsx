/**
 * A friendly, bright device silhouette — deliberately not a recognisable
 * handset. Chunky white body, thick navy keyline, sunny screen. Built
 * entirely from SVG primitives.
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
          <stop offset="0" stopColor="#BFE4FF" />
          <stop offset="0.55" stopColor="#8FD0FF" />
          <stop offset="1" stopColor="#FFE0AE" />
        </linearGradient>
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

      {/* Screen */}
      <rect x="9.5" y="9.5" width="47" height="104" rx="11" fill="url(#sr-screen)" />
      <rect
        x="9.5"
        y="9.5"
        width="47"
        height="104"
        rx="11"
        stroke="#14224A"
        strokeWidth="3"
        strokeOpacity="0.16"
      />

      {/* Notch */}
      <rect x="25" y="13" width="16" height="4" rx="2" fill="#14224A" fillOpacity="0.4" />

      {/* Abstracted content — bars, never real UI */}
      <g fill="#14224A" fillOpacity="0.17">
        <rect x="16" y="27" width="26" height="5" rx="2.5" />
        <rect x="16" y="38" width="34" height="5" rx="2.5" />
        <rect x="16" y="49" width="19" height="5" rx="2.5" />
        <rect x="16" y="68" width="31" height="5" rx="2.5" />
        <rect x="16" y="79" width="23" height="5" rx="2.5" />
      </g>

      {/* A glint of glass */}
      <path
        d="M13 100 Q13 92 21 92 L36 92 L18 112 Q13 110 13 104 Z"
        fill="#FFFFFF"
        fillOpacity="0.4"
      />
    </svg>
  )
}
