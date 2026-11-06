"use client";
import { useState, useCallback, useRef } from "react";

const COLORS = [
  "#CC2200", "#2D6A1F", "#3B4CCA", "#B8860B",
  "#4B0082", "#C45B00", "#0D47A1", "#7B1717",
  "#1C6B1C", "#8B1A8B", "#1A5F7A", "#7A5C1A",
];

interface Props {
  participants: string[];
  onParticipantsChange: (p: string[]) => void;
  onResult: (winner: string) => void;
}

export default function ParticipantWheel({ participants, onParticipantsChange, onResult }: Props) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addParticipant = () => {
    const name = newName.trim();
    if (!name) return;
    onParticipantsChange([...participants, name]);
    setNewName("");
  };

  const removeParticipant = (idx: number) => {
    onParticipantsChange(participants.filter((_, i) => i !== idx));
  };

  const updateParticipant = (idx: number, value: string) => {
    const updated = [...participants];
    updated[idx] = value;
    onParticipantsChange(updated);
  };

  const n = participants.length;

  const spin = useCallback(() => {
    if (isSpinning || winner || n < 2) return;

    const winnerIdx = Math.floor(Math.random() * n);
    const wonName = participants[winnerIdx];

    const segDeg = 360 / n;
    const center = winnerIdx * segDeg + segDeg * (0.3 + Math.random() * 0.4);
    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const needed = ((360 - center - currentMod) % 360 + 360) % 360;
    const newRotation = rotation + extraSpins + needed;

    setIsSpinning(true);
    setRotation(newRotation);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsSpinning(false);
      setWinner(wonName);
    }, 5200);
  }, [isSpinning, winner, n, participants, rotation]);

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const innerR = 28;
  const hasWinner = winner !== null && !isSpinning;
  const fontSize = n <= 6 ? 11 : n <= 10 ? 9 : n <= 16 ? 7 : 6;

  const segments = participants.map((name, i) => {
    const segAngle = (2 * Math.PI) / n;
    const startAngle = i * segAngle - Math.PI / 2;
    const endAngle = (i + 1) * segAngle - Math.PI / 2;
    const midAngle = startAngle + segAngle / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = segAngle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    const textR = r * 0.65;
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);
    const textDeg = (midAngle * 180) / Math.PI + 90;

    const color = COLORS[i % COLORS.length];
    const isWin = hasWinner && winner === name;

    return { path, tx, ty, textDeg, name, color, isWin };
  });

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 22 }}>🎫</span>
        <h3 className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "1.5rem", letterSpacing: "0.06em" }}>
          RULETA DE PARTICIPANTES
        </h3>
        <span style={{ fontSize: 22 }}>🎫</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 w-full items-start justify-center">

        {/* ── Participant editor ──────────────────────────── */}
        <div className="glass-panel p-4 flex flex-col gap-3 w-full lg:w-72 flex-shrink-0">
          <div className="text-white/50 text-xs uppercase tracking-widest">
            Participantes ({n})
          </div>

          {/* Add new */}
          <div className="flex gap-2">
            <input
              className="flex-1 bg-transparent text-white text-sm px-3 py-2 rounded-lg"
              style={{ border: "1px solid rgba(255,215,0,0.35)", outline: "none" }}
              placeholder="Nombre del participante…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addParticipant()}
            />
            <button
              className="btn-pokemon px-3 py-2 rounded-lg"
              style={{ fontSize: "1.2rem" }}
              onClick={addParticipant}
              disabled={!newName.trim()}
            >
              +
            </button>
          </div>

          {/* Editable list */}
          <div className="flex flex-col gap-1.5" style={{ maxHeight: 260, overflowY: "auto" }}>
            {participants.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <input
                  className="flex-1 bg-transparent text-white text-sm px-2 py-1 rounded-lg min-w-0"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                  value={name}
                  onChange={e => updateParticipant(i, e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "rgba(255,215,0,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  className="text-white/35 hover:text-red-400 transition-colors flex-shrink-0 text-sm"
                  onClick={() => removeParticipant(i)}
                >
                  ✕
                </button>
              </div>
            ))}
            {n === 0 && (
              <div className="text-white/25 text-sm text-center py-3 italic">
                Agrega al menos 2 participantes…
              </div>
            )}
          </div>
        </div>

        {/* ── Wheel ───────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <div className="relative flex items-center justify-center select-none">
            {/* Pointer */}
            <div className="absolute z-20 pointer-events-none" style={{ top: -2, left: "50%", transform: "translateX(-50%)" }}>
              <svg width="30" height="34" viewBox="0 0 30 34">
                <defs>
                  <linearGradient id="arrowGP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFF0A0" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </linearGradient>
                </defs>
                <polygon points="15,5 29,29 15,22 1,29" fill="url(#arrowGP)" stroke="#FF8C00" strokeWidth="1.5" />
              </svg>
            </div>

            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className={isSpinning ? "spin-transition" : ""}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <defs>
                <radialGradient id="hubPW" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFE55C" />
                  <stop offset="100%" stopColor="#B8860B" />
                </radialGradient>
              </defs>

              {n === 0 ? (
                <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.03)" stroke="rgba(255,215,0,0.2)" strokeWidth="2" />
              ) : (
                <>
                  {segments.map((s, i) => (
                    <g key={i}>
                      <path
                        d={s.path}
                        fill={s.isWin ? "#FFD700" : s.color}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1.5"
                        opacity={hasWinner && !s.isWin ? 0.5 : 1}
                      />
                      <text
                        x={s.tx} y={s.ty}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${s.textDeg}, ${s.tx}, ${s.ty})`}
                        fontSize={fontSize}
                        fontFamily="var(--font-bangers)"
                        fill={s.isWin ? "#1a0a00" : "white"}
                        stroke="rgba(0,0,0,0.7)"
                        strokeWidth="2.5"
                        paintOrder="stroke"
                        letterSpacing="0.5"
                      >
                        {s.name.length > 9 ? s.name.slice(0, 8) + "…" : s.name}
                      </text>
                    </g>
                  ))}
                  {segments.map((_, i) => {
                    const a = i * (2 * Math.PI / n) - Math.PI / 2;
                    return (
                      <circle
                        key={i}
                        cx={cx + (r + 2) * Math.cos(a)}
                        cy={cy + (r + 2) * Math.sin(a)}
                        r={2.5}
                        fill="#FFD700"
                      />
                    );
                  })}
                </>
              )}

              <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(255,215,0,0.7)" strokeWidth="2.5" />
              <circle cx={cx} cy={cy} r={innerR + 3} fill="rgba(0,0,0,0.6)" />
              <circle cx={cx} cy={cy} r={innerR} fill="url(#hubPW)" stroke="rgba(255,215,0,0.9)" strokeWidth="2" />
              <line x1={cx - 22} y1={cy} x2={cx + 22} y2={cy} stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r={7} fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r={3.5} fill="#1a1a1a" />
            </svg>

            {hasWinner && (
              <div
                className="absolute rounded-full pointer-events-none winner-glow"
                style={{ width: size, height: size, border: "3px solid #FFD700" }}
              />
            )}
          </div>

          {/* Spin button */}
          {!hasWinner && (
            <button
              className="btn-pokemon px-12 py-3 rounded-2xl disabled:opacity-40"
              style={{ fontSize: "1.8rem", letterSpacing: "0.1em" }}
              onClick={spin}
              disabled={isSpinning || n < 2}
            >
              {isSpinning ? (
                <span className="flex items-center gap-2">
                  <span className="pokeball-spin inline-block">⚙</span> GIRANDO…
                </span>
              ) : n < 2 ? "AGREGA PARTICIPANTES" : "¡GIRAR!"}
            </button>
          )}

          {/* Winner card */}
          {hasWinner && (
            <div
              className="glass-panel p-5 flex flex-col items-center gap-3 text-center w-full max-w-xs winner-glow"
              style={{ border: "2px solid #FFD700" }}
            >
              <span style={{ fontSize: 44 }}>🏆</span>
              <div style={{ fontFamily: "var(--font-bangers)", fontSize: "2rem", color: "#FFD700", letterSpacing: "0.06em" }}>
                {winner}
              </div>
              <div className="text-white/50 text-sm">¡Ganó este sobre!</div>
              <button
                className="btn-pokemon w-full py-2.5 rounded-xl mt-1"
                style={{ fontSize: "1.2rem", letterSpacing: "0.08em" }}
                onClick={() => { onResult(winner!); setWinner(null); }}
              >
                ABRIR SOBRE →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
