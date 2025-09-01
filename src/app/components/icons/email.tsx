import { ISocial_Media_Props } from '@/lib/types';
import React from 'react';

const Email: React.FC<ISocial_Media_Props> = ({
  className,
  color = 'currentColor',
  width = 28,
  style,
}) => {
  const aspectRatio = 28 / 28;
  const height = width * aspectRatio;

  return (
    <span className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width, height, ...style }}
      >
        <g clipPath="url(#clip0_email)">
          <rect width="24" height="24" rx="4" fill="none" />
          <path
            d="M3 6.75C3 5.50736 4.00736 4.5 5.25 4.5H18.75C19.9926 4.5 21 5.50736 21 6.75V17.25C21 18.4926 19.9926 19.5 18.75 19.5H5.25C4.00736 19.5 3 18.4926 3 17.25V6.75ZM5.25 6C4.83579 6 4.5 6.33579 4.5 6.75V7.11346L12 12.2464L19.5 7.11346V6.75C19.5 6.33579 19.1642 6 18.75 6H5.25ZM19.5 8.61604L12.4608 13.3733C12.1798 13.5656 11.8202 13.5656 11.5392 13.3733L4.5 8.61604V17.25C4.5 17.6642 4.83579 18 5.25 18H18.75C19.1642 18 19.5 17.6642 19.5 17.25V8.61604Z"
            fill={color}
          />
        </g>
        <defs>
          <clipPath id="clip0_email">
            <rect width="24" height="24" rx="4" fill={color} />
          </clipPath>
        </defs>
      </svg>
    </span>
  );
};

export default Email;
