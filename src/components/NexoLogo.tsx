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
      <img
        src="/nexo-autospare.png"
        alt="Nexo Logo"
        className="h-full"
      />
      {variant === 'full' && (
        <div className="ml-2">
          <p className="text-sm font-bold" style={{ color: textColor }}>
            NEXO
          </p>
          {showSubtitle && (
            <p className="text-xs font-semibold" style={{ color: redColor }}>
              AUTO SPARES
            </p>
          )}
        </div>
      )}
    </div>
  );
};
