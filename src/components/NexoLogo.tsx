import React from 'react';

interface NexoLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'white';
  showSubtitle?: boolean;
}

export const NexoLogo: React.FC<NexoLogoProps> = ({
  className = 'h-10',
  variant = 'full',
  showSubtitle = false,
}) => {
  const isWhite = variant === 'white';
  const textColor = isWhite ? '#FFFFFF' : '#0F1012';
  const redColor = '#E11D48';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 380 95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-w-full overflow-visible"
        aria-label="Nexo Autospares Logo"
      >
        {/* Aerodynamic Car Outline Swoosh over Logo */}
        <path
          d="M 32 36 C 85 24, 155 12, 230 14 C 290 15, 305 28, 305 28 C 305 28, 255 24, 215 26 C 180 28, 140 33, 105 40 Z"
          fill={redColor}
        />
        <path
          d="M 28 38 C 75 22, 160 8, 245 10 C 275 11, 310 24, 310 24 C 310 24, 260 16, 215 16 C 145 16, 70 30, 28 38 Z"
          fill={textColor}
        />

        {/* NEXO Main Typographic Wordmark */}
        {/* N */}
        <path
          d="M 30 68 L 48 35 L 59 35 L 59 68 L 48 68 L 48 45 L 34 68 Z"
          fill={textColor}
        />
        <rect x="30" y="35" width="11" height="33" fill={textColor} />
        <rect x="54" y="35" width="11" height="33" fill={textColor} />

        {/* E */}
        <path
          d="M 72 35 L 112 35 L 112 43 L 83 43 L 83 48 L 108 48 L 108 55 L 83 55 L 83 60 L 114 60 L 114 68 L 72 68 Z"
          fill={textColor}
        />

        {/* X with Red Accent Slash */}
        <path
          d="M 122 35 L 140 35 L 165 68 L 147 68 Z"
          fill={textColor}
        />
        {/* Red slashing segment of the X */}
        <path
          d="M 154 35 L 169 35 L 134 68 L 119 68 Z"
          fill={redColor}
        />

        {/* O Enclosed with Cog Gear */}
        <ellipse
          cx="205"
          cy="51.5"
          rx="19"
          ry="17"
          fill="none"
          stroke={textColor}
          strokeWidth="11"
        />
        {/* Inner red ring in O */}
        <circle cx="205" cy="51.5" r="9" fill="none" stroke={redColor} strokeWidth="3" />

        {/* Gear Teeth on the right edge */}
        <g stroke={textColor} strokeWidth="5" strokeLinecap="round">
          <line x1="228" y1="36" x2="236" y2="31" />
          <line x1="235" y1="46" x2="245" y2="44" />
          <line x1="236" y1="58" x2="245" y2="60" />
          <line x1="228" y1="68" x2="236" y2="73" />
        </g>

        {/* AUTO SPARES Subtitle in Red heavy tracked caps */}
        <text
          x="30"
          y="87"
          fontFamily="'Barlow Condensed', sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="15"
          letterSpacing="4.5"
          fill={redColor}
        >
          AUTO SPARES
        </text>

        {/* Tagline separator hairline */}
        <line x1="28" y1="93" x2="255" y2="93" stroke={redColor} strokeWidth="1.2" opacity="0.6" />
      </svg>
    </div>
  );
};
