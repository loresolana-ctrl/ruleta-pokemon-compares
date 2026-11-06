"use client";
import { useRef } from "react";
import { PackType } from "@/lib/pokemon-data";

interface RouletteWheelProps {
  packs: PackType[];
  rotation: number;
  isSpinning: boolean;
  winnerIndex: number | null;
}

const WHEEL_COLORS = [
  "#CC2200", "#B8860B", "#1C1C2E", "#2D6A1F",
  "#4B0082", "#C45B00", "#3B2F8C", "#8B6914",
  "#2A2A2A", "#AA0000", "#C06000", "#0D47A1",
];

export default function RouletteWheel({ packs, rotation, isSpinning, winnerIndex }: RouletteWheelProps) {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const innerR = 38;
  const n = packs.length;
  const segAngle = (2 * Math.PI) / n;

  const segments = packs.map((pack, i) => {
    const startAngle = i * segAngle - Math.PI / 2;
    const endAngle = (i + 1) * segAngle - Math.PI / 2;
    const midAngle = startAngle + segAngle / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = segAngle > Math.PI ? 1 : 0;

    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    // Text & emoji position (65% of radius from center)
    const textR = r * 0.62;
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);
    const textDeg = (midAngle * 180) / Math.PI + 90;

    // Emoji closer to edge
    const emojiR = r * 0.82;
    const ex = cx + emojiR * Math.cos(midAngle);
    const ey = cy + emojiR * Math.sin(midAngle);

    const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
    const isWinner = winnerIndex === i;

    return { path, tx, ty, ex, ey, textDeg, pack, color, isWinner };
  });

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 24,
          height: size + 24,
          background: "radial-gradient(circle, transparent 60%, rgba(255,215,0,0.15) 80%, transparent 100%)",
          animation: isSpinning ? "winner-glow 0.8s ease-in-out infinite" : undefined,
        }}
      />

      {/* Pointer arrow (fixed at top) */}
      <div className="absolute z-20 pointer-events-none" style={{ top: -2, left: "50%", transform: "translateX(-50%)" }}>
        <svg width="36" height="42" viewBox="0 0 36 42">
          <defs>
            <filter id="arrow-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FFD700" floodOpacity="0.8" />
            </filter>
          </defs>
          <polygon
            points="18,6 34,36 18,28 2,36"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth="2"
            filter="url(#arrow-shadow)"
          />
          <polygon points="18,6 34,36 18,28 2,36" fill="url(#arrowGrad)" />
          <defs>
            <linearGradient id="arrowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF0A0" />
              <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* SVG Wheel */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={isSpinning ? "spin-transition" : ""}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <defs>
          <filter id="seg-shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0,0,0,0.5)" />
          </filter>
          {/* Outer ring gradient */}
          <radialGradient id="wheelRim" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="95%" stopColor="rgba(255,215,0,0.6)" />
            <stop offset="100%" stopColor="rgba(255,140,0,0.3)" />
          </radialGradient>
        </defs>

        {/* Segments */}
        {segments.map((seg, i) => (
          <g key={i}>
            <path
              d={seg.path}
              fill={seg.color}
              stroke="rgba(255,215,0,0.5)"
              strokeWidth="1.5"
              opacity={winnerIndex !== null && !seg.isWinner ? 0.55 : 1}
            />
            {/* Lighter inner accent */}
            <path
              d={seg.path}
              fill="rgba(255,255,255,0.06)"
              stroke="none"
            />
            {/* Emoji */}
            <text
              x={seg.ex}
              y={seg.ey}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${seg.textDeg}, ${seg.ex}, ${seg.ey})`}
              fontSize={n <= 6 ? 22 : n <= 9 ? 18 : 14}
              style={{ userSelect: "none" }}
            >
              {seg.pack.emoji}
            </text>
            {/* Pack short name */}
            <text
              x={seg.tx}
              y={seg.ty}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${seg.textDeg}, ${seg.tx}, ${seg.ty})`}
              fontSize={n <= 6 ? 11 : n <= 9 ? 9 : 7}
              fontFamily="var(--font-bangers), sans-serif"
              fill="white"
              stroke="rgba(0,0,0,0.7)"
              strokeWidth="3"
              paintOrder="stroke"
              letterSpacing="0.5"
              style={{ userSelect: "none" }}
            >
              {seg.pack.shortName}
            </text>
          </g>
        ))}

        {/* Outer rim */}
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="rgba(255,215,0,0.8)" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="rgba(255,140,0,0.3)" strokeWidth="2" />

        {/* Center hub */}
        <circle cx={cx} cy={cy} r={innerR + 4} fill="rgba(0,0,0,0.6)" />
        <circle cx={cx} cy={cy} r={innerR} fill="url(#hubGrad)" stroke="rgba(255,215,0,0.9)" strokeWidth="2.5" />
        <defs>
          <radialGradient id="hubGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFE55C" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </radialGradient>
        </defs>

        {/* Pokeball line on hub */}
        <line x1={cx - innerR + 4} y1={cy} x2={cx + innerR - 4} y2={cy} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={9} fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={4.5} fill="#1a1a1a" />

        {/* Segment divider dots on rim */}
        {segments.map((_, i) => {
          const angle = i * segAngle - Math.PI / 2;
          const dotR = r + 2;
          const dx = cx + dotR * Math.cos(angle);
          const dy = cy + dotR * Math.sin(angle);
          return <circle key={i} cx={dx} cy={dy} r={3.5} fill="#FFD700" />;
        })}
      </svg>

      {/* Winner highlight ring */}
      {winnerIndex !== null && !isSpinning && (
        <div
          className="absolute rounded-full pointer-events-none winner-glow"
          style={{ width: size, height: size, border: "3px solid #FFD700" }}
        />
      )}
    </div>
  );
}
