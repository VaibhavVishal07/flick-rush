import { AirtelSafeLogo } from './AirtelSafeLogo'

/**
 * The hero device for the takeover: a large, modern handset mockup running
 * Airtel Safe. Deliberately generic — no maker's marks — but detailed enough
 * to read as a real phone at this size. Its lower half is meant to bleed off
 * the bottom of the screen.
 */
export const PhoneHero = ({ width = 240 }: { width?: number }) => (
  <div className="hero-phone" style={{ width }}>
    <svg viewBox="0 0 240 480" width={width} height={width * 2} aria-hidden="true">
      <defs>
        <linearGradient id="sr-hero-frame" x1="0" y1="0" x2="240" y2="480">
          <stop offset="0" stopColor="#3a3d48" />
          <stop offset="0.5" stopColor="#1b1d26" />
          <stop offset="1" stopColor="#2b2e39" />
        </linearGradient>
        <linearGradient id="sr-hero-wall" x1="20" y1="20" x2="220" y2="460">
          <stop offset="0" stopColor="#ffe6e6" />
          <stop offset="0.42" stopColor="#ffd0cf" />
          <stop offset="1" stopColor="#ffb9a6" />
        </linearGradient>
        <clipPath id="sr-hero-clip">
          <rect x="13" y="13" width="214" height="454" rx="38" />
        </clipPath>
      </defs>

      {/* Frame */}
      <rect x="2" y="2" width="236" height="476" rx="48" fill="url(#sr-hero-frame)" />
      <rect
        x="2"
        y="2"
        width="236"
        height="476"
        rx="48"
        stroke="#0b0c12"
        strokeWidth="4"
      />
      <rect
        x="9"
        y="9"
        width="222"
        height="462"
        rx="42"
        stroke="#5b5f6e"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />

      {/* Side keys */}
      <rect x="0" y="112" width="3" height="26" rx="1.5" fill="#0b0c12" />
      <rect x="0" y="152" width="3" height="42" rx="1.5" fill="#0b0c12" />
      <rect x="0" y="204" width="3" height="42" rx="1.5" fill="#0b0c12" />
      <rect x="237" y="168" width="3" height="62" rx="1.5" fill="#0b0c12" />

      {/* Screen */}
      <rect x="13" y="13" width="214" height="454" rx="38" fill="url(#sr-hero-wall)" />

      <g clipPath="url(#sr-hero-clip)">
        {/* Status bar */}
        <rect x="34" y="34" width="26" height="8" rx="4" fill="#14224A" fillOpacity="0.6" />
        <g fill="#14224A" fillOpacity="0.55">
          <rect x="163" y="38" width="4" height="5" rx="1.4" />
          <rect x="170" y="35" width="4" height="8" rx="1.4" />
          <rect x="177" y="32" width="4" height="11" rx="1.4" />
        </g>
        <rect
          x="187"
          y="33"
          width="20"
          height="10"
          rx="3.4"
          stroke="#14224A"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
        <rect x="190" y="36" width="11" height="4" rx="1.6" fill="#14224A" fillOpacity="0.55" />
      </g>

      {/* Dynamic island */}
      <rect x="88" y="24" width="64" height="20" rx="10" fill="#07080c" />
      <circle cx="142" cy="34" r="4" fill="#12141c" />
    </svg>

    {/* Live content sits in HTML so it can animate with the rest of the game. */}
    <div className="hero-phone__screen">
      <div className="hero-phone__brand">
        <AirtelSafeLogo width={116} />
      </div>
      <p className="hero-phone__state">
        <span className="hero-phone__dot" aria-hidden="true" />
        Protected
      </p>
      <ul className="hero-phone__rows" aria-hidden="true">
        <li>
          <span className="hero-phone__tag">Blocked</span>
          <span className="hero-phone__bar" />
        </li>
        <li>
          <span className="hero-phone__tag">Blocked</span>
          <span className="hero-phone__bar hero-phone__bar--short" />
        </li>
        <li className="is-allowed">
          <span className="hero-phone__tag">Allowed</span>
          <span className="hero-phone__bar" />
        </li>
      </ul>
    </div>
  </div>
)
