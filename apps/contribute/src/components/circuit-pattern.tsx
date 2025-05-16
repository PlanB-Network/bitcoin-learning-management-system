import type React from 'react';

interface CircuitPatternProps {
  className?: string;
}

export const CircuitPattern: React.FC<CircuitPatternProps> = ({
  className = '',
}) => {
  return (
    <div className={`w-full h-full opacity-30 ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Circuit pattern</title>
        {/* Left circuits */}
        <path
          d="M0 80 L140 80 L150 90 L240 90"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <path
          d="M0 110 L100 110 L120 130 L240 130"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <path
          d="M160 20 L160 70 L170 80 L240 80"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <circle cx="240" cy="80" r="4" fill="#FF8A3D" />
        <circle cx="240" cy="90" r="4" fill="#FF8A3D" />
        <circle cx="240" cy="130" r="4" fill="#FF8A3D" />

        {/* Right circuits */}
        <path
          d="M1440 50 L1300 50 L1280 70 L1200 70"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <path
          d="M1440 100 L1320 100 L1300 120 L1200 120"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <path
          d="M1270 20 L1270 60 L1250 80 L1200 80"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <circle cx="1200" cy="70" r="4" fill="#FF8A3D" />
        <circle cx="1200" cy="80" r="4" fill="#FF8A3D" />
        <circle cx="1200" cy="120" r="4" fill="#FF8A3D" />

        {/* Middle connecting circuits */}
        <path
          d="M500 140 L550 140 L570 120 L800 120"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <path
          d="M900 120 L950 120 L970 140 L1050 140"
          stroke="#FF8A3D"
          strokeWidth="1.5"
        />
        <circle cx="800" cy="120" r="4" fill="#FF8A3D" />
        <circle cx="900" cy="120" r="4" fill="#FF8A3D" />
      </svg>
    </div>
  );
};

export const FooterCircuitPattern: React.FC<CircuitPatternProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`w-full h-full absolute top-0 left-0 opacity-10 ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Circuit pattern background</title>
        {/* Left side circuits */}
        <path
          d="M60 80 L140 80 L160 100 L230 100"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <path
          d="M20 120 L100 120 L120 140 L200 140"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <path
          d="M80 160 L120 160 L140 180 L220 180"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <circle cx="230" cy="100" r="3" fill="#FF8A3D" />
        <circle cx="200" cy="140" r="3" fill="#FF8A3D" />
        <circle cx="220" cy="180" r="3" fill="#FF8A3D" />

        {/* Right side circuits */}
        <path
          d="M1380 120 L1300 120 L1280 140 L1200 140"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <path
          d="M1340 170 L1260 170 L1240 190 L1180 190"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <path
          d="M1360 60 L1280 60 L1260 80 L1160 80"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <circle cx="1200" cy="140" r="3" fill="#FF8A3D" />
        <circle cx="1180" cy="190" r="3" fill="#FF8A3D" />
        <circle cx="1160" cy="80" r="3" fill="#FF8A3D" />

        {/* Connected paths */}
        <path
          d="M300 220 L400 220 L420 200 L600 200"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <path
          d="M900 200 L1000 200 L1020 220 L1100 220"
          stroke="#FF8A3D"
          strokeWidth="1"
        />
        <circle cx="600" cy="200" r="3" fill="#FF8A3D" />
        <circle cx="900" cy="200" r="3" fill="#FF8A3D" />
      </svg>
    </div>
  );
};
