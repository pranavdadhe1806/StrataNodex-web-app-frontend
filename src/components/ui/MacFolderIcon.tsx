interface MacFolderIconProps {
  size?: number;
  isSystem?: boolean;
}

export default function MacFolderIcon({ size = 64, isSystem = false }: MacFolderIconProps) {
  const id = isSystem ? 'sys' : 'reg';
  const w = size;
  const h = size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }}
    >
      <defs>
        {/* Body gradient — top lighter, bottom slightly darker */}
        <linearGradient id={`body-${id}`} x1="50" y1="28" x2="50" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isSystem ? '#F2855A' : '#62CFFA'} />
          <stop offset="100%" stopColor={isSystem ? '#C85A2A' : '#34AADC'} />
        </linearGradient>

        {/* Tab gradient */}
        <linearGradient id={`tab-${id}`} x1="20" y1="18" x2="20" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isSystem ? '#E07040' : '#4AB8E8'} />
          <stop offset="100%" stopColor={isSystem ? '#C05828' : '#2898C8'} />
        </linearGradient>

        {/* Top shine on body */}
        <linearGradient id={`shine-${id}`} x1="50" y1="28" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.32" />
          <stop offset="100%" stopColor="white" stopOpacity="0.0" />
        </linearGradient>

        {/* Bottom shadow on body */}
        <linearGradient id={`shadow-${id}`} x1="50" y1="70" x2="50" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.18" />
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id={`dropshadow-${id}`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      {/* ── Tab (back flap) ── */}
      <path
        d="M8 30 L8 26 Q8 22 12 22 L36 22 Q39 22 41 25 L44 30 Z"
        fill={`url(#tab-${id})`}
      />

      {/* ── Body ── */}
      <rect
        x="6" y="28"
        width="88" height="62"
        rx="8" ry="8"
        fill={`url(#body-${id})`}
        filter={`url(#dropshadow-${id})`}
      />

      {/* ── Top shine highlight ── */}
      <rect
        x="6" y="28"
        width="88" height="34"
        rx="8" ry="8"
        fill={`url(#shine-${id})`}
      />

      {/* ── Bottom depth shadow ── */}
      <rect
        x="6" y="58"
        width="88" height="32"
        rx="0 0 8 8"
        fill={`url(#shadow-${id})`}
      />

      {/* ── Inner top edge bright line ── */}
      <rect
        x="7" y="29"
        width="86" height="2"
        rx="1"
        fill="rgba(255,255,255,0.28)"
      />

      {/* ── Left edge subtle highlight ── */}
      <rect
        x="6" y="28"
        width="3" height="62"
        rx="2"
        fill="rgba(255,255,255,0.18)"
      />
    </svg>
  );
}
