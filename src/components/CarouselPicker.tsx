"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { Pack } from "@/lib/game-data";

const VISIBLE = 7;   // must be odd
const HALF = 3;      // (VISIBLE-1)/2

// Unique color per pack number using golden-ratio hue distribution
function packHue(n: number) {
  return (n * 137.508) % 360;
}
function packColors(n: number, isOpen: boolean) {
  const h = packHue(n);
  if (isOpen) return { bg: `hsl(${h},15%,14%)`, border: `hsl(${h},20%,30%)`, text: `hsl(${h},20%,45%)` };
  return {
    bg: `linear-gradient(155deg, hsl(${h},55%,18%) 0%, hsl(${h+30},65%,28%) 100%)`,
    border: `hsl(${h},60%,48%)`,
    text: `hsl(${h},80%,78%)`,
  };
}

interface CarouselPickerProps {
  availablePacks: Pack[];
  allPacks: Pack[];        // full list (to detect opened ones)
  onWinner: (pack: Pack) => void;
  disabled?: boolean;
}

export default function CarouselPicker({
  availablePacks, allPacks, onWinner, disabled
}: CarouselPickerProps) {
  const n = availablePacks.length;
  const [centerIdx, setCenterIdx] = useState(0);   // index into availablePacks
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Pack | null>(null);
  const [speed, setSpeed] = useState<"fast" | "med" | "slow" | "idle">("idle");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const numWidth = String(allPacks[allPacks.length - 1]?.number ?? n).length;

  const spin = useCallback(() => {
    if (isSpinning || winner || n === 0 || disabled) return;

    const targetLocalIdx = Math.floor(Math.random() * n);
    const start = centerIdx;
    setIsSpinning(true);
    setWinner(null);
    setSpeed("fast");
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const extraLoops = (Math.floor(Math.random() * 4) + 5) * n;
    const fwd = ((targetLocalIdx - (start % n) + n) % n);
    const total = extraLoops + fwd;
    const STEPS = 60;

    let elapsed = 0;
    for (let i = 0; i < STEPS; i++) {
      const t = i / (STEPS - 1);
      const interval = 22 + Math.pow(t, 1.9) * 680;
      elapsed += interval;

      // easeOutCubic – how far along the total movement we are
      const eased = 1 - Math.pow(1 - t, 3);
      const moved = Math.round(eased * total);
      const newCenter = start + moved;
      const isLast = i === STEPS - 1;
      const phase: typeof speed = t < 0.38 ? "fast" : t < 0.68 ? "med" : "slow";

      const to = setTimeout(() => {
        setCenterIdx(newCenter);
        setSpeed(isLast ? "idle" : phase);
        if (isLast) {
          setIsSpinning(false);
          const won = availablePacks[targetLocalIdx];
          setWinner(won);
          setTimeout(() => onWinner(won), 1000);
        }
      }, elapsed);
      timeoutsRef.current.push(to);
    }
  }, [isSpinning, winner, n, centerIdx, availablePacks, disabled, onWinner]);

  // Build the VISIBLE cards around centerIdx
  const cards = Array.from({ length: VISIBLE }, (_, i) => {
    const pos = i - HALF;  // –3 … +3
    const localIdx = ((centerIdx + pos) % n + n) % n;
    return { pack: availablePacks[localIdx], pos };
  });

  // Transition duration per speed phase
  const transMs = speed === "fast" ? 0 : speed === "med" ? 55 : 130;

  const hasWinner = winner !== null && !isSpinning;

  return (
    <div className="flex flex-col items-center gap-5 w-full select-none">

      {/* ── Carousel track ─────────────────────────────── */}
      <div className="carousel-track relative flex items-center justify-center w-full" style={{ minHeight: 180, overflowX: "hidden", overflowY: "visible" }}>
        {/* Rail lines (top and bottom of cards area) */}
        <div className="carousel-rail" style={{ top: "13%" }} />
        <div className="carousel-rail" style={{ bottom: "11%" }} />

        {/* Fixed golden frame around center slot */}
        <div
          className="absolute z-20 pointer-events-none rounded-2xl"
          style={{
            width: 108,
            height: 162,
            border: `3px solid ${hasWinner ? "#FFD700" : "rgba(255,215,0,0.55)"}`,
            boxShadow: hasWinner
              ? "0 0 50px rgba(255,215,0,0.85), 0 0 100px rgba(255,140,0,0.4)"
              : isSpinning
              ? "0 0 25px rgba(255,215,0,0.35)"
              : "0 0 15px rgba(255,215,0,0.2)",
            transition: "box-shadow 0.4s",
          }}
        />

        {/* Arrow pointer (top) */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{ top: -10, left: "50%", transform: "translateX(-50%)" }}
        >
          <svg width="26" height="18" viewBox="0 0 26 18">
            <polygon points="13,16 1,1 25,1" fill="#FFD700" stroke="#FF8C00" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Cards row */}
        <div className="flex items-center" style={{ gap: 10 }}>
          {cards.map(({ pack, pos }) => {
            const abs = Math.abs(pos);
            const scale = 1 - abs * 0.085;
            const opacity = Math.max(0.12, 1 - abs * 0.2);
            const blur = speed === "fast" && abs <= 2 ? `blur(${abs * 1.5}px)` : "none";
            const isCenter = pos === 0;
            const col = packColors(pack.number, false);
            const isWinner = hasWinner && pack.number === winner?.number && isCenter;

            return (
              <div
                key={pos}
                style={{
                  width: 92,
                  height: 138,
                  flexShrink: 0,
                  transform: `scale(${scale})`,
                  opacity,
                  filter: blur,
                  transition: `transform ${transMs}ms ease, opacity ${transMs}ms ease, filter ${transMs}ms ease`,
                  borderRadius: 14,
                  border: `2.5px solid ${isWinner ? "#FFD700" : col.border}`,
                  background: isWinner
                    ? "linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(255,140,0,0.15) 100%)"
                    : col.bg,
                  boxShadow: isCenter
                    ? isWinner
                      ? `0 0 35px rgba(255,215,0,0.6), inset 0 0 25px rgba(255,215,0,0.08)`
                      : `0 0 18px rgba(255,215,0,0.25)`
                    : "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 6px 8px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top bar */}
                <div
                  className="w-full flex items-center justify-center gap-1 rounded-md py-0.5"
                  style={{ background: "rgba(0,0,0,0.35)" }}
                >
                  <span style={{ fontSize: 8, letterSpacing: "0.18em", color: col.text, fontFamily: "var(--font-bangers)" }}>
                    POKÉMON
                  </span>
                </div>

                {/* Number – main hero */}
                <div className="flex flex-col items-center gap-0" style={{ flex: 1, justifyContent: "center" }}>
                  <span
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: isCenter ? "1.65rem" : "1.35rem",
                      fontWeight: 900,
                      color: isWinner ? "#FFD700" : "white",
                      textShadow: isCenter
                        ? isWinner
                          ? "0 0 18px rgba(255,215,0,0.9)"
                          : "0 0 8px rgba(255,255,255,0.4)"
                        : "none",
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                      transition: "color 0.2s, text-shadow 0.2s",
                    }}
                  >
                    {String(pack.number).padStart(numWidth, "0")}
                  </span>
                  {/* Content preview (center only) */}
                  {isCenter && pack.content && (
                    <span
                      className="mt-1 text-center"
                      style={{
                        fontSize: "0.48rem",
                        color: "rgba(255,215,0,0.65)",
                        letterSpacing: "0.04em",
                        maxWidth: 76,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pack.content}
                    </span>
                  )}
                </div>

                {/* Bottom pokeball */}
                <div style={{ opacity: 0.18 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="11" fill="none" stroke="white" strokeWidth="1.8" />
                    <line x1="1" y1="12" x2="23" y2="12" stroke="white" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="4" fill="white" />
                    <circle cx="12" cy="12" r="2" fill="#333" />
                  </svg>
                </div>

                {/* Holographic overlay on center */}
                {isCenter && (
                  <div
                    className="absolute inset-0 pointer-events-none holo-card"
                    style={{ borderRadius: 12 }}
                  />
                )}

                {/* Dot pattern */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "10px 10px",
                    borderRadius: 12,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Status text ──────────────────────────────────── */}
      <div
        style={{
          fontFamily: "var(--font-bangers)",
          fontSize: "1.15rem",
          letterSpacing: "0.1em",
          color: hasWinner ? "#FFD700" : "rgba(255,255,255,0.35)",
          textShadow: hasWinner ? "0 0 20px rgba(255,215,0,0.6)" : "none",
          minHeight: "1.5rem",
          transition: "color 0.3s",
        }}
      >
        {hasWinner
          ? `¡SOBRE #${winner!.number} SELECCIONADO!`
          : isSpinning
          ? "GIRANDO…"
          : n === 0
          ? "¡TODOS LOS SOBRES ABIERTOS!"
          : `${n} SOBRE${n !== 1 ? "S" : ""} DISPONIBLE${n !== 1 ? "S" : ""}`}
      </div>

      {/* ── Spin button ──────────────────────────────────── */}
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
          ) : (
            "¡ G I R A R !"
          )}
        </button>
      )}
    </div>
  );
}
