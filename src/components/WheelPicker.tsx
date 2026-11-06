"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { Pack } from "@/lib/game-data";

const MAX_SEGS = 36;

function packHue(n: number) {
  return (n * 137.508) % 360;
}

interface Props {
  availablePacks: Pack[];
  allPacks: Pack[];
  onWinner: (pack: Pack) => void;
  disabled?: boolean;
}

export default function WheelPicker({ availablePacks, onWinner, disabled }: Props) {
  const n = availablePacks.length;
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Pack | null>(null);
  const [displayPacks, setDisplayPacks] = useState<Pack[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSpinning && !winner) {
      setDisplayPacks(n <= MAX_SEGS ? availablePacks : availablePacks.slice(0, MAX_SEGS));
    }
  }, [availablePacks, isSpinning, winner, n]);

  const spin = useCallback(() => {
    if (isSpinning || winner || n === 0 || disabled) return;

    const winnerIdx = Math.floor(Math.random() * n);
    const wonPack = availablePacks[winnerIdx];

    let newDisplay: Pack[];
    let segIdx: number;

    if (n <= MAX_SEGS) {
      newDisplay = availablePacks;
      segIdx = winnerIdx;
    } else {
      const others = availablePacks.filter(p => p.number !== wonPack.number);
      const sample = [...others].sort(() => Math.random() - 0.5).slice(0, MAX_SEGS - 1);
      newDisplay = [...sample, wonPack].sort((a, b) => a.number - b.number);
      segIdx = newDisplay.findIndex(p => p.number === wonPack.number);
    }

    setDisplayPacks(newDisplay);

    const segCount = newDisplay.length;
    const segDeg = 360 / segCount;
    const center = segIdx * segDeg + segDeg * (0.3 + Math.random() * 0.4);
    const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const needed = ((360 - center - currentMod) % 360 + 360) % 360;
    const newRotation = rotation + extraSpins + needed;

    setIsSpinning(true);
    setRotation(newRotation);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsSpinning(false);
      setWinner(wonPack);
      setTimeout(() => {
        onWinner(wonPack);
        setWinner(null);
      }, 1000);
    }, 5200);
  }, [isSpinning, winner, n, availablePacks, rotation, disabled, onWinner]);

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const innerR = 36;
  const seg = displayPacks.length;
  const hasWinner = winner !== null && !isSpinning;
  const fontSize = seg <= 10 ? 13 : seg <= 16 ? 10 : seg <= 24 ? 8 : 7;

  if (n === 0) {
    return (
      <div className="flex flex-col items-center gap-4 select-none">
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: size, height: size, border: "3px solid rgba(255,215,0,0.2)", background: "rgba(255,255,255,0.03)" }}
        >
          <span className="text-white/30 text-sm">¡Todos los premios entregados!</span>
        </div>
      </div>
    );
  }

  const svgSegments = displayPacks.map((pack, i) => {
    const segAngle = (2 * Math.PI) / seg;
    const startAngle = i * segAngle - Math.PI / 2;
    const endAngle = (i + 1) * segAngle - Math.PI / 2;
    const midAngle = startAngle + segAngle / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = segAngle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    const textR = r * 0.63;
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);
    const textDeg = (midAngle * 180) / Math.PI + 90;

    const h = packHue(pack.number);
    const color = `hsl(${h},55%,22%)`;
    const isWin = hasWinner && winner?.number === pack.number;

    return { path, tx, ty, textDeg, number: pack.number, color, isWin };
  });

  return (
    <div className="flex flex-col items-center gap-5 w-full select-none">
      <div className="relative flex items-center justify-center">
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

        {/* Pointer */}
        <div className="absolute z-20 pointer-events-none" style={{ top: -2, left: "50%", transform: "translateX(-50%)" }}>
          <svg width="36" height="42" viewBox="0 0 36 42">
            <defs>
              <linearGradient id="arrowGW" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF0A0" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
            </defs>
            <polygon points="18,6 34,36 18,28 2,36" fill="url(#arrowGW)" stroke="#FF8C00" strokeWidth="2" filter="url(#shadow-arrow)" />
            <defs>
              <filter id="shadow-arrow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FFD700" floodOpacity="0.8" />
              </filter>
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
            <radialGradient id="hubWP" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFE55C" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </radialGradient>
          </defs>

          {svgSegments.map((s, i) => (
            <g key={i}>
              <path
                d={s.path}
                fill={s.isWin ? "#FFD700" : s.color}
                stroke="rgba(255,215,0,0.4)"
                strokeWidth="1.5"
                opacity={hasWinner && !s.isWin ? 0.5 : 1}
              />
              <text
                x={s.tx} y={s.ty}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${s.textDeg}, ${s.tx}, ${s.ty})`}
                fontSize={fontSize}
                fontFamily="'Courier New', monospace"
                fontWeight="900"
                fill={s.isWin ? "#1a0a00" : "white"}
                stroke="rgba(0,0,0,0.6)"
                strokeWidth="2.5"
                paintOrder="stroke"
              >
                {s.number}
              </text>
            </g>
          ))}

          {/* Rim */}
          <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="rgba(255,215,0,0.8)" strokeWidth="3" />
          <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="rgba(255,140,0,0.3)" strokeWidth="2" />

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={innerR + 4} fill="rgba(0,0,0,0.6)" />
          <circle cx={cx} cy={cy} r={innerR} fill="url(#hubWP)" stroke="rgba(255,215,0,0.9)" strokeWidth="2.5" />
          <line x1={cx - innerR + 4} y1={cy} x2={cx + innerR - 4} y2={cy} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={9} fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={4.5} fill="#1a1a1a" />

          {/* Divider dots on rim */}
          {svgSegments.map((_, i) => {
            const a = i * (2 * Math.PI / seg) - Math.PI / 2;
            const dx = cx + (r + 2) * Math.cos(a);
            const dy = cy + (r + 2) * Math.sin(a);
            return <circle key={i} cx={dx} cy={dy} r={3.5} fill="#FFD700" />;
          })}
        </svg>

        {hasWinner && (
          <div
            className="absolute rounded-full pointer-events-none winner-glow"
            style={{ width: size, height: size, border: "3px solid #FFD700" }}
          />
        )}
      </div>

      {/* Status */}
      <div
        style={{
          fontFamily: "var(--font-bangers)",
          fontSize: "1.2rem",
          letterSpacing: "0.1em",
          color: hasWinner ? "#FFD700" : "rgba(255,255,255,0.4)",
          textShadow: hasWinner ? "0 0 20px rgba(255,215,0,0.6)" : "none",
          minHeight: "1.5rem",
          transition: "color 0.3s",
        }}
      >
        {hasWinner
          ? `¡PREMIO #${winner!.number} SELECCIONADO!`
          : isSpinning
          ? "GIRANDO…"
          : `${n} PREMIO${n !== 1 ? "S" : ""} DISPONIBLE${n !== 1 ? "S" : ""}`}
      </div>

      {n > MAX_SEGS && !isSpinning && !hasWinner && (
        <div className="text-white/25 text-xs -mt-3">
          Mostrando {seg} de {n} premios — el ganador se elige entre todos
        </div>
      )}

      {!hasWinner && (
        <button
          className="btn-pokemon px-14 py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: "2.2rem", letterSpacing: "0.1em" }}
          onClick={spin}
          disabled={isSpinning || n === 0 || disabled}
        >
          {isSpinning ? (
            <span className="flex items-center gap-3">
              <span className="pokeball-spin inline-block">⚙</span>
              GIRANDO…
            </span>
          ) : "¡ G I R A R !"}
        </button>
      )}
    </div>
  );
}
