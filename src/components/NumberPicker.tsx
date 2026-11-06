"use client";
import { useState, useCallback, useEffect, useRef } from "react";

interface NumberPickerProps {
  availableNumbers: number[];
  onWinner: (n: number) => void;
  disabled?: boolean;
}

export default function NumberPicker({ availableNumbers, onWinner, disabled }: NumberPickerProps) {
  const [display, setDisplay] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  const spin = useCallback(() => {
    if (isSpinning || disabled || availableNumbers.length === 0) return;

    const target = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    setIsSpinning(true);
    setWinner(null);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const steps = 55;
    let accumulated = 0;

    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const interval = 25 + Math.pow(progress, 2.2) * 500;
      accumulated += interval;
      const isLast = i === steps - 1;
      const idx = i;

      const t = setTimeout(() => {
        if (isLast) {
          setDisplay(target);
          setWinner(target);
          setIsSpinning(false);
          setTimeout(() => onWinner(target), 600);
        } else {
          const pool = availableNumbers.length > 1
            ? availableNumbers.filter((n) => n !== (idx > 0 ? target : -1))
            : availableNumbers;
          setDisplay(pool[Math.floor(Math.random() * pool.length)]);
        }
      }, accumulated);

      timeoutsRef.current.push(t);
    }
  }, [isSpinning, disabled, availableNumbers, onWinner]);

  const digits = display !== null ? String(display).padStart(4, "0").split("") : ["?", "?", "?", "?"];
  const hasWinner = winner !== null && !isSpinning;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Digital display */}
      <div
        className="relative flex gap-2 p-4 rounded-2xl"
        style={{
          background: "rgba(0,0,0,0.7)",
          border: `3px solid ${hasWinner ? "#FFD700" : "rgba(255,215,0,0.3)"}`,
          boxShadow: hasWinner
            ? "0 0 60px rgba(255,215,0,0.7), 0 0 120px rgba(255,140,0,0.4)"
            : isSpinning
            ? "0 0 30px rgba(255,215,0,0.3)"
            : "none",
          transition: "box-shadow 0.4s, border-color 0.4s",
        }}
      >
        {digits.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 72,
              height: 100,
              background: "rgba(10,10,30,0.9)",
              border: "2px solid rgba(255,215,0,0.2)",
              fontFamily: "'Courier New', monospace",
              fontSize: "3.5rem",
              fontWeight: 900,
              color: hasWinner ? "#FFD700" : isSpinning ? "#FF8C00" : "rgba(255,215,0,0.4)",
              textShadow: hasWinner
                ? "0 0 20px rgba(255,215,0,0.9)"
                : isSpinning
                ? "0 0 10px rgba(255,140,0,0.7)"
                : "none",
              transition: "color 0.15s, text-shadow 0.15s",
              letterSpacing: "-0.02em",
            }}
          >
            {d}
          </div>
        ))}

        {/* Scanning line when spinning */}
        {isSpinning && (
          <div
            className="absolute inset-x-4 rounded pointer-events-none"
            style={{
              height: 3,
              background: "linear-gradient(90deg, transparent, #FF8C00, #FFD700, #FF8C00, transparent)",
              animation: "scan-line 0.4s ease-in-out infinite alternate",
              top: "50%",
            }}
          />
        )}
      </div>

      {/* Status label */}
      <div
        style={{
          fontFamily: "var(--font-bangers)",
          fontSize: "1.2rem",
          letterSpacing: "0.1em",
          color: hasWinner ? "#FFD700" : "rgba(255,255,255,0.4)",
          textShadow: hasWinner ? "0 0 20px rgba(255,215,0,0.6)" : "none",
          minHeight: "1.6rem",
        }}
      >
        {hasWinner
          ? `¡SOBRE #${winner} SELECCIONADO!`
          : isSpinning
          ? "GIRANDO…"
          : availableNumbers.length === 0
          ? "¡TODOS LOS SOBRES ABIERTOS!"
          : `${availableNumbers.length} SOBRE${availableNumbers.length !== 1 ? "S" : ""} DISPONIBLE${availableNumbers.length !== 1 ? "S" : ""}`}
      </div>

      {/* Spin button */}
      {!hasWinner && !disabled && (
        <button
          className="btn-pokemon px-14 py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: "2.2rem", letterSpacing: "0.1em" }}
          onClick={spin}
          disabled={isSpinning || availableNumbers.length === 0}
        >
          {isSpinning ? (
            <span className="flex items-center gap-3">
              <span className="pokeball-spin inline-block">⚙</span>
              GIRANDO…
            </span>
          ) : (
            "¡ G I R A R !"
          )}
        </button>
      )}

      <style>{`
        @keyframes scan-line {
          from { top: 30%; opacity: 0.8; }
          to   { top: 70%; opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
