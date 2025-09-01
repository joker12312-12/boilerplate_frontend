import React from 'react';
import { ISocial_Media_Props } from '@/lib/types';

// Document Icon (Simple paper/document style)
const Doc: React.FC<ISocial_Media_Props> = ({
  className,
  color = 'currentColor',
  width = 24,
  style,
}) => {
  const aspectRatio = 24 / 24;
  const height = width * aspectRatio;

  return (
    <span className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        style={{ width, height, ...style }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Document icon</title>
        {/* Main document rectangle */}
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="3"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        {/* Document lines */}
        <rect
          x="7"
          y="7"
          width="10"
          height="2"
          rx="1"
          fill={color}
          opacity="0.6"
        />
        <rect
          x="7"
          y="11"
          width="7"
          height="2"
          rx="1"
          fill={color}
          opacity="0.35"
        />
        <rect
          x="7"
          y="15"
          width="6"
          height="2"
          rx="1"
          fill={color}
          opacity="0.2"
        />
      </svg>
    </span>
  );
};

export default Doc;
