export default function KaabaVisual() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <rect x="10" y="25" width="40" height="25" fill="#1a1a1a" stroke="#d4af37" strokeWidth="1.5"/>

      <path d="M 10 25 L 30 15 L 50 25" fill="#2a2a2a" stroke="#d4af37" strokeWidth="1.5"/>

      <rect x="22" y="35" width="16" height="15" fill="#d4af37" opacity="0.3"/>

      <line x1="30" y1="32" x2="30" y2="38" stroke="#d4af37" strokeWidth="2"/>
      <line x1="27" y1="35" x2="33" y2="35" stroke="#d4af37" strokeWidth="2"/>

      <rect x="12" y="27" width="36" height="2" fill="#d4af37" opacity="0.6"/>
      <rect x="12" y="40" width="36" height="2" fill="#d4af37" opacity="0.6"/>

      <circle cx="15" cy="22" r="1.5" fill="#ffd700"/>
      <circle cx="45" cy="22" r="1.5" fill="#ffd700"/>
      <circle cx="30" cy="17" r="1.5" fill="#ffd700"/>
    </svg>
  );
}
