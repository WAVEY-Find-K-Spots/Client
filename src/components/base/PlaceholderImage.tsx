import { useState } from 'react';

interface PlaceholderImageProps {
  alt: string;
  className?: string;
  iconClassName?: string;
  label?: string;
}

export function PlaceholderImage({ alt, className = '', iconClassName = '', label }: PlaceholderImageProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`relative bg-gray-100 flex flex-col items-center justify-center overflow-hidden ${className}`}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <i className={`ri-image-line text-gray-400 ${iconClassName}`}></i>
      {label && (
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 px-2 text-center leading-tight">
          {label}
        </p>
      )}
      {showTooltip && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <p className="text-white text-[10px] sm:text-xs px-2 text-center">
            이미지를 추가해주세요
          </p>
        </div>
      )}
    </div>
  );
}