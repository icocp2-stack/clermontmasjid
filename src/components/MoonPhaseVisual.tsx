interface MoonPhaseVisualProps {
  illumination: number;
  phase: number;
}

export default function MoonPhaseVisual({ illumination, phase }: MoonPhaseVisualProps) {
  const size = 60;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2;

  const isWaxing = phase < 0.5;

  const shadowOffset = (illumination - 0.5) * 2;

  const createMoonPath = () => {
    const rightCurve = shadowOffset;

    return `
      M ${centerX},${centerY - radius}
      A ${radius},${radius} 0 0 1 ${centerX},${centerY + radius}
      A ${Math.abs(rightCurve * radius)},${radius} 0 0 ${rightCurve > 0 ? 1 : 0} ${centerX},${centerY - radius}
      Z
    `;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="2"
      />

      <path
        d={createMoonPath()}
        fill="#e2e8f0"
        opacity="0.95"
      />

      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="#64748b"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}
