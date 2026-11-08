"use client";
import { useState, useRef, useCallback } from "react";
import { Pack, createPacks, getUnopenedPacks } from "@/lib/game-data";
import PackEditor from "@/components/PackEditor";
import WheelPicker from "@/components/WheelPicker";
import PackGrid from "@/components/PackGrid";
import PackReveal from "@/components/PackReveal";
import ParticipantWheel from "@/components/ParticipantWheel";

type Phase = "config" | "editor" | "game" | "bonus" | "reveal" | "summary";

interface SpinRecord {
  packNumber: number;
  content: string;
  spinIndex: number;
  roundIndex: number;
  winner?: string;
}

// ─── Stars ───────────────────────────────────────────────────────────────────
function StarField() {
  const stars = useRef(
    Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      dur: Math.random() * 4 + 2,
      del: Math.random() * 4,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {stars.current.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            "--duration": `${s.dur}s`,
            "--delay": `${s.del}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const particles = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * 100,
      color: ["#FFD700","#FF3333","#3B4CCA","#00CC44","#FF69B4","#FF8C00","#9933FF"][i % 7],
      size: Math.random() * 8 + 5,
      delay: Math.random() * 2,
      drift: (Math.random() - 0.5) * 120,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.current.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animation: `confetti-fall ${2.5 + Math.random() * 2}s linear forwards`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Logo (compact horizontal) ────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpg"
        alt="Compares TCG"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "2px solid rgba(255,215,0,0.7)",
          objectFit: "cover",
          flexShrink: 0,
          filter: "drop-shadow(0 0 10px rgba(255,215,0,0.4))",
        }}
      />
      <div className="flex flex-col">
        <h1
          className="text-gold"
          style={{
            fontFamily: "var(--font-bangers)",
            fontSize: "1.6rem",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          ⚡ RULETA POKÉMON ⚡
        </h1>
        <div
          className="text-gold"
          style={{
            fontFamily: "var(--font-bangers)",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            opacity: 0.65,
          }}
        >
          30 ANIVERSARIO — SUBASTA DE PREMIOS
        </div>
      </div>
    </div>
  );
}

// ─── StepControl ──────────────────────────────────────────────────────────────
function StepControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-white/50 uppercase tracking-widest" style={{ fontSize: "0.68rem" }}>{label}</span>
      <div className="flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,215,0,0.12)", border: "2px solid rgba(255,215,0,0.35)", color: "#FFD700" }}
          onClick={() => onChange(Math.max(min, value - 1))}
        >−</button>
        <input
          type="number"
          className="pokemon-input"
          style={{ width: 88 }}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
        />
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,215,0,0.12)", border: "2px solid rgba(255,215,0,0.35)", color: "#FFD700" }}
          onClick={() => onChange(Math.min(max, value + 1))}
        >+</button>
      </div>
      <span className="text-white/25 text-xs">{min}–{max.toLocaleString()}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("config");

  // Config
  const [totalPacks, setTotalPacks] = useState(10);
  const [spinsPerRound, setSpinsPerRound] = useState(1);
  const [withBonus, setWithBonus] = useState(false);

  // Game state
  const [packs, setPacks] = useState<Pack[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [spinsThisRound, setSpinsThisRound] = useState(0);
  const [spinsAvailable, setSpinsAvailable] = useState(1);
  const [highlightedPack, setHighlightedPack] = useState<number | null>(null);
  const [currentPack, setCurrentPack] = useState<Pack | null>(null);
  const [history, setHistory] = useState<SpinRecord[]>([]);
  const [spinIndex, setSpinIndex] = useState(0);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);

  // Participants persist across all rounds
  const [participants, setParticipants] = useState<string[]>([]);

  // Quick edit modal
  const [editModalPack, setEditModalPack] = useState<number | null>(null);
  const [editModalValue, setEditModalValue] = useState("");

  const startConfig = useCallback(() => {
    const newPacks = createPacks(totalPacks);
    setPacks(newPacks);
    setPhase("editor");
  }, [totalPacks]);

  const startGame = useCallback(() => {
    setCurrentRound(1);
    setSpinsThisRound(0);
    setSpinsAvailable(spinsPerRound);
    setHighlightedPack(null);
    setCurrentPack(null);
    setHistory([]);
    setSpinIndex(0);
    setCurrentWinner(null);
    setPhase("game");
  }, [spinsPerRound]);

  const handleWinner = useCallback((pack: Pack) => {
    const isLastPack = packs.filter((p) => !p.isOpened).length === 1;
    setHighlightedPack(pack.number);
    setCurrentPack(pack);
    setSpinIndex((s) => s + 1);
    if (withBonus && !isLastPack) {
      setCurrentWinner(null);
      setTimeout(() => setPhase("bonus"), 800);
    } else {
      setTimeout(() => setPhase("reveal"), 800);
    }
  }, [packs, withBonus]);

  const handleRevealClose = useCallback(() => {
    if (!currentPack) return;

    const updatedPacks = packs.map((p) =>
      p.number === currentPack.number
        ? { ...p, isOpened: true, openedOnSpin: spinIndex }
        : p
    );
    setPacks(updatedPacks);

    setHistory((h) => [
      ...h,
      { packNumber: currentPack.number, content: currentPack.content, spinIndex, roundIndex: currentRound, winner: currentWinner ?? undefined },
    ]);

    const newSpinsThisRound = spinsThisRound + 1;
    setSpinsThisRound(newSpinsThisRound);
    setHighlightedPack(null);
    setCurrentPack(null);
    setCurrentWinner(null);

    const unopened = updatedPacks.filter((p) => !p.isOpened);
    if (unopened.length === 0) {
      setPhase("summary");
      return;
    }

    const remainingSpins = spinsAvailable - newSpinsThisRound;
    if (remainingSpins > 0) {
      setPhase("game");
    } else {
      startNextRound();
    }
  }, [currentPack, packs, spinIndex, spinsThisRound, spinsAvailable, currentRound, currentWinner]);

  const handleParticipantResult = useCallback((winnerName: string) => {
    setCurrentWinner(winnerName);
    setPhase("reveal");
  }, []);

  const startNextRound = useCallback(() => {
    setCurrentRound((r) => r + 1);
    setSpinsThisRound(0);
    setSpinsAvailable(spinsPerRound);
    setPhase("game");
  }, [spinsPerRound]);

  const updatePackContent = useCallback((number: number, content: string) => {
    setPacks((prev) => prev.map((p) => (p.number === number ? { ...p, content } : p)));
    if (currentPack?.number === number) {
      setCurrentPack((p) => p ? { ...p, content } : p);
    }
  }, [currentPack]);

  const openEditModal = useCallback((number: number) => {
    const pack = packs.find((p) => p.number === number);
    if (!pack) return;
    setEditModalPack(number);
    setEditModalValue(pack.content);
  }, [packs]);

  const saveEditModal = useCallback(() => {
    if (editModalPack === null) return;
    updatePackContent(editModalPack, editModalValue);
    setEditModalPack(null);
  }, [editModalPack, editModalValue, updatePackContent]);

  const unopened = getUnopenedPacks(packs);
  const remainingSpins = spinsAvailable - spinsThisRound;

  return (
    <main
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StarField />
      {phase === "summary" && <Confetti />}

      {/* ── HEADER ───────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
          padding: "9px 24px",
          borderBottom: "1px solid rgba(255,215,0,0.12)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Logo />
      </div>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: "12px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── CONFIG ────────────────────────────────────────────── */}
        {phase === "config" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
            }}
          >
            <div className="glass-panel w-full max-w-lg p-6 flex flex-col items-center gap-6">
              <h2 className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "1.6rem", letterSpacing: "0.06em" }}>
                CONFIGURAR SUBASTA
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 justify-center w-full">
                <StepControl label="Total de premios" value={totalPacks} min={1} max={1000} onChange={setTotalPacks} />
                <StepControl label="Tiros por ronda" value={spinsPerRound} min={1} max={20} onChange={setSpinsPerRound} />
              </div>

              <button
                className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all w-full justify-center"
                style={{
                  background: withBonus ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)",
                  border: `2px solid ${withBonus ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.1)"}`,
                }}
                onClick={() => setWithBonus((v) => !v)}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: withBonus ? "#FFD700" : "transparent", border: "2px solid rgba(255,215,0,0.6)" }}
                >
                  {withBonus && <span className="text-black font-bold" style={{ fontSize: 12 }}>✓</span>}
                </div>
                <span style={{ fontFamily: "var(--font-bangers)", fontSize: "1.1rem", letterSpacing: "0.05em", color: withBonus ? "#FFD700" : "rgba(255,255,255,0.5)" }}>
                  🎫 Ruleta de participantes (opcional)
                </span>
              </button>

              {withBonus && (
                <p className="text-white/40 text-xs text-center -mt-3">
                  Antes de cada premio (excepto el último), sortea entre los participantes quién lo gana. Puedes editar los nombres en vivo durante el juego.
                </p>
              )}

              <button
                className="btn-pokemon w-full py-3 rounded-2xl"
                style={{ fontSize: "1.6rem", letterSpacing: "0.1em" }}
                onClick={startConfig}
              >
                CONFIGURAR PREMIOS →
              </button>
            </div>
          </div>
        )}

        {/* ── EDITOR ────────────────────────────────────────────── */}
        {phase === "editor" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              overflowY: "auto",
            }}
          >
            <PackEditor
              packs={packs}
              onChange={setPacks}
              onConfirm={startGame}
            />
          </div>
        )}

        {/* ── GAME ──────────────────────────────────────────────── */}
        {phase === "game" && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflow: "hidden",
            }}
          >
            {/* Status bar */}
            <div
              className="glass-panel px-4 py-2 flex items-center justify-between flex-wrap gap-2"
              style={{ flexShrink: 0 }}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest">Ronda</div>
                  <div style={{ fontFamily: "var(--font-bangers)", fontSize: "1.3rem", color: "#FFD700", letterSpacing: "0.05em" }}>
                    {currentRound}
                  </div>
                </div>
                <div className="w-px h-7 bg-white/10" />
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest">Tiros restantes</div>
                  <div style={{ fontFamily: "var(--font-bangers)", fontSize: "1.3rem", color: "#FF8C00", letterSpacing: "0.05em" }}>
                    {remainingSpins} / {spinsAvailable}
                  </div>
                </div>
                <div className="w-px h-7 bg-white/10" />
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest">Premios</div>
                  <div style={{ fontFamily: "var(--font-bangers)", fontSize: "1.3rem", color: "#4ade80", letterSpacing: "0.05em" }}>
                    {unopened.length} / {packs.length}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-xs px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                  style={{ border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", background: "transparent" }}
                  onClick={() => setPhase("editor")}
                >
                  ✏️ Editar premios
                </button>
                <button
                  className="text-xs px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                  style={{ border: "1px solid rgba(255,80,80,0.3)", color: "#ff8080", background: "transparent" }}
                  onClick={() => setPhase("config")}
                >
                  ↩ Reiniciar
                </button>
              </div>
            </div>

            {/* Two-column layout: wheel LEFT, grid RIGHT */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                gap: 12,
                alignItems: "stretch",
              }}
            >
              {/* Left: circular wheel */}
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WheelPicker
                  availablePacks={unopened}
                  allPacks={packs}
                  onWinner={handleWinner}
                  disabled={unopened.length === 0}
                  wheelSize={270}
                />
              </div>

              {/* Right: pack grid + history */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minHeight: 0 }}>
                  <PackGrid
                    packs={packs}
                    highlightedNumber={highlightedPack}
                    onEditPack={openEditModal}
                    fillHeight
                  />
                </div>

                {history.length > 0 && (
                  <div
                    className="glass-panel p-3"
                    style={{ flexShrink: 0, maxHeight: 76, overflowY: "auto" }}
                  >
                    <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Entregados esta sesión</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[...history].reverse().map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700" }}
                        >
                          <span style={{ fontFamily: "var(--font-bangers)" }}>#{h.packNumber}</span>
                          {h.winner && <span className="text-white/60">→ {h.winner}</span>}
                          {h.content && (
                            <span className="text-white/40" style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {h.content}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REVEAL ────────────────────────────────────────────── */}
        {phase === "reveal" && currentPack && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
              {currentWinner && (
                <div
                  className="flex items-center gap-2 px-5 py-2 rounded-full winner-glow"
                  style={{
                    background: "rgba(255,215,0,0.12)",
                    border: "2px solid #FFD700",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🏆</span>
                  <span
                    style={{
                      fontFamily: "var(--font-bangers)",
                      fontSize: "1.5rem",
                      letterSpacing: "0.06em",
                      color: "#FFD700",
                    }}
                  >
                    {currentWinner}
                  </span>
                </div>
              )}
              <PackReveal
                pack={currentPack}
                onEdit={(content) => updatePackContent(currentPack.number, content)}
                onClose={handleRevealClose}
              />
            </div>
          </div>
        )}

        {/* ── BONUS (participant wheel) ──────────────────────────── */}
        {phase === "bonus" && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <ParticipantWheel
              participants={participants}
              onParticipantsChange={setParticipants}
              onResult={handleParticipantResult}
            />
          </div>
        )}

        {/* ── SUMMARY ───────────────────────────────────────────── */}
        {phase === "summary" && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflow: "hidden",
            }}
          >
            <div className="text-center" style={{ flexShrink: 0 }}>
              <h2 className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", letterSpacing: "0.06em" }}>
                🏆 ¡SUBASTA COMPLETADA! 🏆
              </h2>
              <p className="text-white/50 text-sm mt-0.5">
                {history.length} premio{history.length !== 1 ? "s" : ""} entregado{history.length !== 1 ? "s" : ""} en {currentRound} ronda{currentRound !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Scrollable table */}
            <div
              className="glass-panel overflow-hidden"
              style={{ flex: 1, minHeight: 0 }}
            >
              <div style={{ height: "100%", overflowY: "auto" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,215,0,0.2)" }}>
                      <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-white/40">Tiro</th>
                      <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-white/40">Premio</th>
                      <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-white/40">Ronda</th>
                      {history.some((h) => h.winner) && (
                        <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-white/40">Ganador</th>
                      )}
                      <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-white/40">Contenido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span className="text-white/30 text-sm">#{i + 1}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span style={{ fontFamily: "var(--font-bangers)", fontSize: "1.2rem", color: "#FFD700", letterSpacing: "0.04em" }}>
                            PREMIO {h.packNumber}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-white/50 text-sm">Ronda {h.roundIndex}</span>
                        </td>
                        {history.some((r) => r.winner) && (
                          <td className="px-5 py-3">
                            {h.winner ? (
                              <span style={{ fontFamily: "var(--font-bangers)", fontSize: "1rem", color: "#FFD700", letterSpacing: "0.04em" }}>
                                🏆 {h.winner}
                              </span>
                            ) : (
                              <span className="text-white/25 text-sm">—</span>
                            )}
                          </td>
                        )}
                        <td className="px-5 py-3">
                          {h.content ? (
                            <span className="text-white text-sm">{h.content}</span>
                          ) : (
                            <span className="text-white/25 text-sm italic">Sin contenido</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer row */}
            <div style={{ flexShrink: 0, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {packs.filter((p) => !p.isOpened).length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-white/40 text-xs">Sin entregar:</span>
                  {packs.filter((p) => !p.isOpened).map((p) => (
                    <span
                      key={p.number}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
                    >
                      #{p.number}
                    </span>
                  ))}
                </div>
              )}
              <button
                className="btn-pokemon px-8 py-3 rounded-2xl ml-auto"
                style={{ fontSize: "1.3rem", letterSpacing: "0.08em", flexShrink: 0 }}
                onClick={() => setPhase("config")}
              >
                🔄 NUEVA SUBASTA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── QUICK EDIT MODAL ──────────────────────────────────── */}
      {editModalPack !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditModalPack(null); }}
        >
          <div className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "1.4rem", letterSpacing: "0.06em" }}>
                PREMIO #{editModalPack}
              </div>
              <button className="text-white/50 hover:text-white text-xl" onClick={() => setEditModalPack(null)}>✕</button>
            </div>
            <textarea
              className="w-full bg-transparent text-white text-sm resize-none px-3 py-2 rounded-lg"
              style={{ border: "1px solid rgba(255,215,0,0.4)", outline: "none", minHeight: 80 }}
              placeholder="Contenido del premio…"
              value={editModalValue}
              onChange={(e) => setEditModalValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) saveEditModal(); }}
            />
            <div className="flex gap-3">
              <button className="btn-pokemon flex-1 py-2.5 rounded-xl" style={{ fontSize: "1rem", letterSpacing: "0.06em" }} onClick={saveEditModal}>
                Guardar
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
                onClick={() => setEditModalPack(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
