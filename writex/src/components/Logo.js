import React from "react";

function Logo() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="8" fill="url(#paint0_linear)" />
      <path
        d="M12 12h16v2H12zM12 19h16v2H12zM12 26h16v2H12z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1E88E5" />
          <stop offset="1" stopColor="#42A5F5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Logo;
