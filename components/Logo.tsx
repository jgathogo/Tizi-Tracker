import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Tizi Tracker logo component featuring Kenyan flag colors.
 * 
 * The logo incorporates the Kenyan flag colors:
 * - Black: Strength and determination
 * - Red: The struggle for freedom
 * - Green: The land and natural wealth
 * - White: Peace and unity
 * 
 * Args:
 *   size (number): Size of the logo in pixels. Default: 40.
 *   className (string): Additional CSS classes.
 * 
 * Returns:
 *   JSX.Element: SVG logo component.
 */
export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with Kenyan flag colors gradient */}
      <defs>
        <linearGradient id="kenyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" /> {/* Black */}
          <stop offset="33%" stopColor="#DE2910" /> {/* Red */}
          <stop offset="66%" stopColor="#FFFFFF" /> {/* White */}
          <stop offset="100%" stopColor="#007A3D" /> {/* Green */}
        </linearGradient>
      </defs>
      
      {/* Main circle background */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#kenyanGradient)"
        stroke="#1e293b"
        strokeWidth="2"
      />
      
      {/* Stylized "T" for Tizi - using dumbbell-inspired design */}
      <g transform="translate(50, 50)">
        {/* Horizontal bar (top of T) */}
        <rect
          x="-25"
          y="-8"
          width="50"
          height="12"
          rx="6"
          fill="#FFFFFF"
          opacity="0.95"
        />
        
        {/* Vertical bar (stem of T) */}
        <rect
          x="-6"
          y="-8"
          width="12"
          height="30"
          rx="6"
          fill="#FFFFFF"
          opacity="0.95"
        />
        
        {/* Small accent circles (representing weights) */}
        <circle cx="-20" cy="0" r="4" fill="#000000" opacity="0.8" />
        <circle cx="20" cy="0" r="4" fill="#000000" opacity="0.8" />
      </g>
    </svg>
  );
};






