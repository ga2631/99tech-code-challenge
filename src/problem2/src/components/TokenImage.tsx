import React, { useState } from 'react';
import { BASE_TOKEN_ICON_URL, TOKEN_METADATA } from '../constants/tokens';

interface TokenImageProps {
  symbol: string;
  size?: number;
  className?: string;
}

export const TokenImage: React.FC<TokenImageProps> = ({ symbol, size = 28, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const meta = TOKEN_METADATA[symbol];
  const bgColor = meta?.color || '#6366F1';
  const iconUrl = `${BASE_TOKEN_ICON_URL}/${symbol}.svg`;

  if (hasError) {
    return (
      <div
        className={`token-avatar ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: bgColor,
          fontSize: `${Math.max(10, Math.floor(size * 0.4))}px`,
        }}
        title={symbol}
      >
        {symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <div
      className={`token-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
      }}
    >
      <img
        src={iconUrl}
        alt={symbol}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
