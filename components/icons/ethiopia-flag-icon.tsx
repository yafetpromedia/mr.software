import type { SVGAttributes } from "react";

/** Ethiopia — green · yellow · red tricolor with blue emblem disc. */
export function EthiopiaFlagIcon({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <rect width="36" height="8" y="0" fill="#078930" />
      <rect width="36" height="8" y="8" fill="#FCDD09" />
      <rect width="36" height="8" y="16" fill="#DA121A" />
      <circle cx="18" cy="12" r="5.2" fill="#0F47AF" />
      <path
        fill="#FCDD09"
        d="M18 8.2 L19.1 10.8 L21.9 10.8 L19.6 12.5 L20.5 15.1 L18 13.4 L15.5 15.1 L16.4 12.5 L14.1 10.8 L16.9 10.8 Z"
      />
      <path
        fill="none"
        stroke="#FCDD09"
        strokeWidth="0.55"
        strokeLinecap="round"
        d="M18 9.8 L18 14.2 M16.2 11.2 L19.8 11.2 M16.6 13.1 L19.4 9.3 M19.4 13.1 L16.6 9.3"
      />
    </svg>
  );
}
