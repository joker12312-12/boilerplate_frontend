import React from 'react';
import { ISocial_Media_Props } from '@/lib/types';

// Simple Sparkles/Star icon
const Sparkles: React.FC<ISocial_Media_Props> = ({
  className,
  color = 'currentColor',
  width = 20,
  style,
}) => {
  const aspectRatio = 20 / 20;
  const height = width * aspectRatio;

  return (
    <span className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 20 20"
        fill="none"
        style={{ width, height, ...style }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Sparkles icon</title>
        {/* Large center star */}
        <path
          d="M10 2l1.16 3.53a1 1 0 00.68.68L15 8l-3.53 1.16a1 1 0 00-.68.68L10 15l-1.16-3.53a1 1 0 00-.68-.68L5 8l3.53-1.16a1 1 0 00.68-.68L10 2z"
          fill={color}
          opacity="0.7"
        />
        {/* Small sparkles */}
        <circle cx="16.5" cy="4" r="1.1" fill={color} opacity="0.5" />
        <circle cx="4" cy="15.5" r="0.8" fill={color} opacity="0.5" />
      </svg>
    </span>
  );
};

export default Sparkles;
