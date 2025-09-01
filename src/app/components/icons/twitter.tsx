import { ISocial_Media_Props } from '@/lib/types';
import React from 'react';

const Twitter: React.FC<ISocial_Media_Props> = ({
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
        width="23"
        height="24"
        viewBox="0 0 23 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width, height, ...style }}
      >
        <g clipPath="url(#clip0_4_472)">
          <path
            d="M13.6904 10.24L22.254 0.5H20.2254L12.7865 8.95539L6.8494 0.5H0L8.97997 13.2873L0 23.4999H2.0286L9.87927 14.5688L16.1506 23.4999H23M2.76077 1.99681H5.87727L20.2239 22.0766H17.1066"
            fill={color}
          />
        </g>
        <defs>
          <clipPath id="clip0_4_472">
            <rect
              width="23"
              height="23"
              fill={color}
              transform="translate(0 0.5)"
            />
          </clipPath>
        </defs>
      </svg>
    </span>
  );
};

export default Twitter;
