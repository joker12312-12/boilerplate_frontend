import React from 'react';
import { ISocial_Media_Props } from '@/lib/types';

// Classic Dollar Sign ($) Icon with a single path
const Dollar: React.FC<ISocial_Media_Props> = ({
  className,
  color = 'currentColor',
  width = 22,
  style,
}) => {
  const aspectRatio = 22 / 22;
  const height = width * aspectRatio;

  return (
    <span className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 22 22"
        fill="none"
        style={{ width, height, ...style }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Dollar icon</title>
        <path
          d="
                        M11 3
                        V19
                        M15.5 6.5
                        c0-2-2-3.5-4.5-3.5s-4.5 1.5-4.5 3.5c0 2.2 2.3 2.9 4.5 3.5s4.5 1.3 4.5 3.5c0 2-2 3.5-4.5 3.5s-4.5-1.5-4.5-3.5
                        "
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
};

export default Dollar;
