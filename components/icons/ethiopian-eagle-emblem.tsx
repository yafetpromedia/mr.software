import type { SVGAttributes } from "react";

/** Stylized Ethiopian heraldic eagle with pentagram — modern line-art emblem. */
export function EthiopianEagleEmblem({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient id="ethio-eagle-gold" x1="20" y1="10" x2="100" y2="110">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="45%" stopColor="#F4C430" />
          <stop offset="100%" stopColor="#E8940A" />
        </linearGradient>
        <linearGradient id="ethio-eagle-wing" x1="0" y1="60" x2="120" y2="60">
          <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F4C430" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="ethio-eagle-glow" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="58" r="52" fill="url(#ethio-eagle-glow)" />

      {/* Rays — Ethiopian star burst */}
      <g stroke="url(#ethio-eagle-gold)" strokeWidth="1.2" strokeLinecap="round" opacity="0.55">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 60 + Math.cos(rad) * 46;
          const y2 = 58 + Math.sin(rad) * 46;
          return <line key={deg} x1="60" y1="58" x2={x2} y2={y2} />;
        })}
      </g>

      {/* Pentagram */}
      <path
        fill="url(#ethio-eagle-gold)"
        d="M60 34 L64.5 47.5 L79 47.5 L67.2 56.5 L71.8 70 L60 61.5 L48.2 70 L52.8 56.5 L41 47.5 L55.5 47.5 Z"
        opacity="0.92"
      />

      {/* Eagle — spread wings */}
      <path
        fill="url(#ethio-eagle-wing)"
        d="M60 52 C48 52 28 44 14 58 C22 62 34 64 42 62 C36 70 38 82 48 86 C52 78 56 72 60 70 C64 72 68 78 72 86 C82 82 84 70 78 62 C86 64 98 62 106 58 C92 44 72 52 60 52 Z"
      />
      <path
        fill="url(#ethio-eagle-gold)"
        d="M60 52 C56 52 52 58 52 64 C52 70 56 76 60 78 C64 76 68 70 68 64 C68 58 64 52 60 52 Z"
      />
      {/* Head */}
      <path
        fill="url(#ethio-eagle-gold)"
        d="M60 48 C57 44 58 38 62 36 C66 38 67 44 64 48 C63 50 61 50 60 48 Z"
      />
      {/* Beak */}
      <path fill="#E8940A" d="M64 40 L70 38 L64 44 Z" />
      {/* Tail feathers */}
      <path
        fill="url(#ethio-eagle-gold)"
        opacity="0.85"
        d="M60 78 L54 96 L60 90 L66 96 Z"
      />

      {/* Wing detail lines */}
      <path
        stroke="#E8940A"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
        d="M28 58 L42 62 M92 58 L78 62 M20 56 L34 60 M100 56 L86 60"
      />
    </svg>
  );
}
