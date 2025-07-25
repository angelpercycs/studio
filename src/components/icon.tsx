"use client";

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  // You can add any additional props you want to pass to the SVG element
}

export const Icon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      <path d="m5.2 16.4-.9 2.3 2.3.9 2.5-1.9" />
      <path d="M11.2 3.8 9 6.3 6.5 4.4l.9-2.3" />
      <path d="M18.8 7.6l.9-2.3-2.3-.9-2.5 1.9" />
      <path d="M12.8 20.2 15 17.7l2.5 1.9-.9 2.3" />
      <path d="m5.2 7.6 2.3-.9L9.4 4.4l-2.3.9" />
      <path d="m16.4 18.8 1.9 2.5 2.3-.9.9-2.3" />
      <path d="M7.5 4.4 9.4 6.3l1.8-2.5-2.3-.9" />
      <path d="M17.7 15 15.8 17.7l-1.9-2.5 2.3.9" />
      <path d="M9.6 12.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0z" />
    </svg>
  );
};
