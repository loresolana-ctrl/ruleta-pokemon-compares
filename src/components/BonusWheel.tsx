"use client";
import { useCallback, useRef, useState } from "react";
import { PriceOption, PRICE_OPTIONS } from "@/lib/game-data";

const WHEEL_SIZE = 300;
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const R = WHEEL_SIZE / 2 - 10;

interface BonusWheelProps {
  onResult: (price: number) => void;
}

export default function BonusWheel({ onResult }: BonusWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<PriceOption | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const options = PRICE_OPTIONS;
  const n = options.length;
  const segAngle = (2 * Math.PI) / n;

  const segments = options.map((opt, i) => {
    const startAngle = i * segAngle - Math.PI / 2;
    const endAngle = (i + 1) * segAngle - Math.PI / 2;
    const midAngle = startAngle + segAngle / 2;

    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const largeArc = segAngle > Math.PI ? 1 : 0;

    const path = `M ${CX} ${CY} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;

    const textR = R * 0.62;
    const tx = CX + textR * Math.cos(midAngle);
    const ty = CY + textR * Math.sin(midAngle);
    const textDeg = (midAngle * 180) / Math.PI + 90;

    const emojiR = R * 0.83;
    const ex = CX + emojiR * Math.cos(midAngle);
    const ey = CY + emojiR * Math.sin(midAngle);

    return { path, tx, ty, ex, ey, textDeg, opt };
  });

  const spin = useCallback(() => {
    if (isSpinning || winner) return;
    setIsSpinning(true);

    const winnerIdx = Math.floor(Math.random() * n);
    const segDeg = 360 / n;
    const center = winnerIdx * segDeg + segDeg * (0.3 + Math.random() * 0.4);
    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 360;
    const currentMod = rotation % 360;
    const needed = ((360 - center - currentMod) % 360 + 360) % 360;
    const newRotation = rotation + extraSpins + needed;

    setRotation(newRotation);

    timeoutRef.current = setTimeout(() => {
      const won = options[winnerIdx];
      setWinner(won);
      setIsSpinning(false);
    }, 5200);
  }, [isSpinning, winner, rotation, n, options]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 22 }}>💰</span>
        <h3
          className="text-gold"
          style={{ fontFamily: "var(--font-bangers)", fontSize: "1.5rem", letterSpacing: "0.06em" }}
        >
          PRECIO DEL SOBRE
        </h3>
        <span style={{ fontSize: 22 }}>💰</span>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute z-20 pointer-events-none" style={{ top: -2, left: "50%", transform: "translateX(-50%)" }}>
          <svg width="30" height="34" viewBox="0 0 30 34">
            <polygon points="15,5 29,29 15,22 1,29" fill="#FFD700" stroke="#FF8C00" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Wheel */}
        <svg
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
          className={isSpinning ? "spin-transition" : ""}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((seg, i) => (
            <g key={i}>
              <path
                d={seg.path}
                fill={seg.opt.color}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
                opacity={winner && winner.id !== seg.opt.id ? 0.5 : 1}
              />
              <text
                x={seg.ex} y={seg.ey}
                textAnchor="middle" dominantBaseline="middle"
                transform={`rotate(${seg.textDeg}, ${seg.ex}, ${seg.ey})`}
                fontSize="20"
              >
                {seg.opt.emoji}
              </text>
              <text
                x={seg.tx} y={seg.ty}
                textAnchor="middle" dominantBaseline="middle"
                transform={`rotate(${seg.textDeg}, ${seg.tx}, ${seg.ty})`}
                fontSize="13"
                fontFamily="var(--font-bangers)"
                fill="white"
                stroke="rgba(0,0,0,0.7)"
                strokeWidth="2.5"
                paintOrder="stroke"
                letterSpacing="0.3"
              >
                {seg.opt.name}
              </text>
            </g>
          ))}
          <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="rgba(255,215,0,0.7)" strokeWidth="2.5" />
          {/* Hub */}
          <circle cx={CX} cy={CY} r={28} fill="url(#hubG2)" stroke="rgba(255,215,0,0.9)" strokeWidth="2" />
          <defs>
            <radialGradient id="hubG2" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFE55C" />
              <stop offset="100%" stopColor="#B8860B" />
            </radialGradient>
          </defs>
          <line x1={CX - 24} y1={CY} x2={CX + 24} y2={CY} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={8} fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={4} fill="#1a1a1a" />
          {segments.map((_, i) => {
            const a = i * segAngle - Math.PI / 2;
            const dx = CX + (R + 2) * Math.cos(a);
            const dy = CY + (R + 2) * Math.sin(a);
            return <circle key={i} cx={dx} cy={dy} r={3} fill="#FFD700" />;
          })}
        </svg>
      </div>

      {!winner && (
        <button
          className="btn-pokemon px-12 py-3 rounded-2xl disabled:opacity-40"
          style={{ fontSize: "1.8rem", letterSpacing: "0.1em" }}
          onClick={spin}
          disabled={isSpinning}
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <span className="pokeball-spin inline-block">⚙</span> GIRANDO…
            </span>
          ) : "¡GIRAR PRECIO!"}
        </button>
      )}

      {winner && (
        <div
          className="glass-panel p-5 flex flex-col items-center gap-3 text-center w-full max-w-xs winner-glow"
          style={{ border: `2px solid ${winner.color}` }}
        >
          <span style={{ fontSize: 44 }}>{winner.emoji}</span>
          <div
            style={{ fontFamily: "var(--font-bangers)", fontSize: "2.2rem", color: winner.color, letterSpacing: "0.06em" }}
          >
            ${winner.value} pesos
          </div>
          <div className="text-white/60 text-sm">{winner.description}</div>
          <button
            className="btn-pokemon w-full py-2.5 rounded-xl mt-1"
            style={{ fontSize: "1.2rem", letterSpacing: "0.08em" }}
            onClick={() => onResult(winner.value)}
          >
            ABRIR SOBRE →
          </button>
        </div>
      )}
    </div>
  );
}
