/**
 * A neutral device silhouette — deliberately not a recognisable handset.
 * Built entirely from SVG primitives.
 */
export const PhoneDevice = ({ width = 62 }: { width?: number }) => {
  const height = width * 1.92
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 62 119"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sr-device-body" x1="8" y1="0" x2="56" y2="119">
          <stop offset="0" stopColor="#23232B" />
          <stop offset="0.52" stopColor="#121217" />
          <stop offset="1" stopColor="#0B0B0F" />
        </linearGradient>
        <linearGradient id="sr-device-screen" x1="10" y1="8" x2="52" y2="112">
          <stop offset="0" stopColor="#15151C" />
          <stop offset="1" stopColor="#08080B" />
        </linearGradient>
        <linearGradient id="sr-device-sheen" x1="0" y1="0" x2="62" y2="60">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.10" />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="60" height="117" rx="15" fill="url(#sr-device-body)" />
      <rect
        x="1"
        y="1"
        width="60"
        height="117"
        rx="15"
        stroke="#31313B"
        strokeOpacity="0.9"
        strokeWidth="1"
      />
      <rect x="5.5" y="5.5" width="51" height="108" rx="11" fill="url(#sr-device-screen)" />
      <rect x="5.5" y="5.5" width="51" height="108" rx="11" fill="url(#sr-device-sheen)" />
      <rect x="24" y="9.5" width="14" height="3.4" rx="1.7" fill="#000" fillOpacity="0.55" />

      {/* Abstracted content — bars, never real UI. */}
      {/* A whisper of the brand reflected in the glass. */}
      <ellipse cx="31" cy="104" rx="26" ry="16" fill="#E8112D" fillOpacity="0.1" />

      <g fill="#FFFFFF" fillOpacity="0.07">
        <rect x="12" y="24" width="28" height="4" rx="2" />
        <rect x="12" y="34" width="38" height="4" rx="2" />
        <rect x="12" y="44" width="20" height="4" rx="2" />
        <rect x="12" y="62" width="34" height="4" rx="2" />
        <rect x="12" y="72" width="24" height="4" rx="2" />
        <rect x="12" y="90" width="38" height="4" rx="2" />
      </g>
    </svg>
  )
}
