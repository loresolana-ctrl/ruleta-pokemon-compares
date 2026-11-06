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
    <>
      {/* Dark overlay over the map background */}
      <div className="bg-overlay" />
      {/* Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
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
    </>
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

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Compares TCG logo image */}
      <div
        className="relative"
        style={{
          filter: "drop-shadow(0 0 24px rgba(255,215,0,0.5)) drop-shadow(0 0 48px rgba(204,34,0,0.3))",
          animation: "logo-float 4s ease-in-out infinite",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.jpg"
          alt="Compares TCG"
          style={{
            width: "clamp(130px, 22vw, 190px)",
            height: "clamp(130px, 22vw, 190px)",
            borderRadius: "50%",
            border: "3px solid rgba(255,215,0,0.7)",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Gold ring glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: "0 0 0 3px rgba(255,215,0,0.25), 0 0 40px rgba(255,215,0,0.2)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Title */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 22 }}>⚡</span>
        <h1
          className="text-gold"
          style={{
            fontFamily: "var(--font-bangers)",
            fontSize: "clamp(1.6rem, 5vw, 2.8rem)",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          RULETA POKÉMON
        </h1>
        <span style={{ fontSize: 22 }}>⚡</span>
      </div>

      {/* Subtitle badge */}
      <div
        className="flex items-center gap-2 px-4 py-1 rounded-full"
        style={{
          background: "linear-gradient(90deg, rgba(204,34,0,0.15), rgba(255,215,0,0.2), rgba(30,58,138,0.15))",
          border: "1px solid rgba(255,215,0,0.35)",
        }}
      >
        <span style={{ fontSize: 13 }}>🏆</span>
        <span className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "1rem", letterSpacing: "0.1em" }}>
          30 ANIVERSARIO — SUBASTA DE PREMIOS
        </span>
        <span style={{ fontSize: 13 }}>🏆</span>
      </div>

      <style>{`
        @keyframes logo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
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
    <main className="relative min-h-screen flex flex-col items-center pb-16" style={{ zIndex: 2 }}>
      <StarField />
      {phase === "summary" && <Confetti />}

      <div className="relative w-full max-w-4xl mx-auto px-4 pt-8 flex flex-col items-center gap-7" style={{ zIndex: 10 }}>
        <Logo />

        {/* ── CONFIG ────────────────────────────────────────────── */}
        {phase === "config" && (
          <div className="glass-panel w-full max-w-lg p-8 flex flex-col items-center gap-8">
            <h2 className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "1.8rem", letterSpacing: "0.06em" }}>
              CONFIGURAR SUBASTA
            </h2>

            <div className="flex flex-col sm:flex-row gap-8 justify-center w-full">
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
              <p className="text-white/40 text-xs text-center -mt-4">
                Antes de cada premio (excepto el último), sortea entre los participantes quién lo gana. Puedes editar los nombres en vivo durante el juego.
              </p>
            )}

            <button
              className="btn-pokemon w-full py-4 rounded-2xl"
              style={{ fontSize: "1.8rem", letterSpacing: "0.1em" }}
              onClick={startConfig}
            >
              CONFIGURAR PREMIOS →
            </button>
          </div>
        )}

        {/* ── EDITOR ────────────────────────────────────────────── */}
        {phase === "editor" && (
          <PackEditor
            packs={packs}
            onChange={setPacks}
            onConfirm={startGame}
          />
        )}

        {/* ── GAME ──────────────────────────────────────────────── */}
        {phase === "game" && (
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Status bar */}
            <div className="glass-panel w-full px-5 py-3 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest">Ronda</div>
                  <div style={{ fontFamily: "var(--font-bangers)", fontSize: "1.4rem", color: "#FFD700", letterSpacing: "0.05em" }}>
                    {currentRound}
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest">Tiros restantes</div>
                  <div style={{ fontFamily: "var(--font-bangers)", fontSize: "1.4rem", color: "#FF8C00", letterSpacing: "0.05em" }}>
                    {remainingSpins} / {spinsAvailable}
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest">Premios</div>
                  <div style={{ fontFamily: "var(--font-bangers)", fontSize: "1.4rem", color: "#4ade80", letterSpacing: "0.05em" }}>
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

            {/* Circular wheel picker */}
            <WheelPicker
              availablePacks={unopened}
              allPacks={packs}
              onWinner={handleWinner}
              disabled={unopened.length === 0}
            />

            {/* Pack grid */}
            <PackGrid
              packs={packs}
              highlightedNumber={highlightedPack}
              onEditPack={openEditModal}
            />

            {/* History */}
            {history.length > 0 && (
              <div className="w-full glass-panel p-4">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Premios entregados esta sesión</div>
                <div className="flex flex-wrap gap-2">
                  {[...history].reverse().map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                      style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700" }}
                    >
                      <span style={{ fontFamily: "var(--font-bangers)" }}>#{h.packNumber}</span>
                      {h.winner && (
                        <span className="text-white/60">→ {h.winner}</span>
                      )}
                      {h.content && (
                        <span className="text-white/40" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {h.content}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVEAL ────────────────────────────────────────────── */}
        {phase === "reveal" && currentPack && (
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
        )}

        {/* ── BONUS (participant wheel) ──────────────────────────── */}
        {phase === "bonus" && (
          <ParticipantWheel
            participants={participants}
            onParticipantsChange={setParticipants}
            onResult={handleParticipantResult}
          />
        )}

        {/* ── SUMMARY ───────────────────────────────────────────── */}
        {phase === "summary" && (
          <div className="flex flex-col items-center gap-7 w-full">
            <div className="text-center">
              <h2 className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "clamp(1.8rem, 5vw, 2.8rem)", letterSpacing: "0.06em" }}>
                🏆 ¡SUBASTA COMPLETADA! 🏆
              </h2>
              <p className="text-white/50 mt-1">{history.length} premio{history.length !== 1 ? "s" : ""} entregado{history.length !== 1 ? "s" : ""} en {currentRound} ronda{currentRound !== 1 ? "s" : ""}</p>
            </div>

            {/* History table */}
            <div className="glass-panel w-full overflow-hidden">
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

            {/* Unopened packs */}
            {packs.filter((p) => !p.isOpened).length > 0 && (
              <div className="w-full">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-3 text-center">
                  Premios sin entregar ({packs.filter((p) => !p.isOpened).length})
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {packs.filter((p) => !p.isOpened).map((p) => (
                    <span
                      key={p.number}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
                    >
                      #{p.number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn-pokemon px-12 py-4 rounded-2xl"
              style={{ fontSize: "1.6rem", letterSpacing: "0.08em" }}
              onClick={() => setPhase("config")}
            >
              🔄 NUEVA SUBASTA
            </button>
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
