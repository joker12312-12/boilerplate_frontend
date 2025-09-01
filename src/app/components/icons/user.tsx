import React from 'react';
import { ISocial_Media_Props } from '@/lib/types';

// User Icon (Person Silhouette)
const User: React.FC<ISocial_Media_Props> = ({
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
        <title>User icon</title>
        {/* Head */}
        <circle cx="12" cy="8" r="4" fill={color} />
        {/* Shoulders / Body */}
        <path
          d="M4 19c0-2.761 3.582-5 8-5s8 2.239 8 5v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z"
          fill={color}
        />
      </svg>
    </span>
  );
};

export default User;
