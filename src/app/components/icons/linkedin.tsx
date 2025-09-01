import { ISocial_Media_Props } from '@/lib/types';
import React from 'react';

const LinkedIn: React.FC<ISocial_Media_Props> = ({
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
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width, height, ...style }}
      >
        <g clipPath="url(#clip0_4_476)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24.1111 24.1114H19.9561V17.0344C19.9561 15.0941 19.2188 14.0098 17.6831 14.0098C16.0124 14.0098 15.1395 15.1382 15.1395 17.0344V24.1114H11.1352V10.6299H15.1395V12.4459C15.1395 12.4459 16.3435 10.218 19.2044 10.218C22.0639 10.218 24.1111 11.9642 24.1111 15.5757V24.1114ZM6.35811 8.86461C4.99416 8.86461 3.88892 7.75069 3.88892 6.37689C3.88892 5.00308 4.99416 3.88916 6.35811 3.88916C7.72205 3.88916 8.82664 5.00308 8.82664 6.37689C8.82664 7.75069 7.72205 8.86461 6.35811 8.86461ZM4.29046 24.1114H8.46591V10.6299H4.29046V24.1114Z"
            fill={color}
          />
        </g>
        <defs>
          <clipPath id="clip0_4_476">
            <rect width="28" height="28" fill={color} />
          </clipPath>
        </defs>
      </svg>
    </span>
  );
};

export default LinkedIn;
