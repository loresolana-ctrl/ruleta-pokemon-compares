"use client";
import { Pack } from "@/lib/game-data";

interface PackGridProps {
  packs: Pack[];
  highlightedNumber: number | null;
  onEditPack?: (number: number) => void;
  fillHeight?: boolean;
}

export default function PackGrid({ packs, highlightedNumber, onEditPack, fillHeight }: PackGridProps) {
  const total = packs.length;

  // Tile size based on count
  const tileSize =
    total <= 20  ? 64 :
    total <= 50  ? 48 :
    total <= 100 ? 38 :
    total <= 200 ? 30 :
    total <= 500 ? 22 :
    16;

  const fontSize =
    total <= 20  ? "0.85rem" :
    total <= 50  ? "0.75rem" :
    total <= 100 ? "0.65rem" :
    total <= 200 ? "0.55rem" :
    total <= 500 ? "0.45rem" :
    "0.35rem";

  const gap = tileSize <= 22 ? 2 : 4;

  return (
    <div
      className="glass-panel p-4 w-full"
      style={fillHeight ? { height: "100%", overflowY: "auto" } : { maxHeight: 420, overflowY: "auto" }}
    >
      <div
        className="flex flex-wrap"
        style={{ gap }}
      >
        {packs.map((pack) => {
          const isHighlighted = pack.number === highlightedNumber;
          const isOpened = pack.isOpened;

          return (
            <div
              key={pack.number}
              title={pack.content ? `#${pack.number}: ${pack.content}` : `Premio #${pack.number}`}
              className="relative flex items-center justify-center rounded cursor-pointer select-none transition-all"
              style={{
                width: tileSize,
                height: tileSize,
                background: isHighlighted
                  ? "linear-gradient(135deg, #FFD700, #FF8C00)"
                  : isOpened
                  ? "rgba(255,255,255,0.06)"
                  : "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.1))",
                border: isHighlighted
                  ? "2px solid #FFD700"
                  : isOpened
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(255,215,0,0.3)",
                boxShadow: isHighlighted ? "0 0 20px rgba(255,215,0,0.8)" : "none",
                transform: isHighlighted ? "scale(1.2)" : "scale(1)",
                zIndex: isHighlighted ? 10 : 1,
                animation: isHighlighted ? "winner-glow 1s ease-in-out infinite" : "none",
                opacity: isOpened && !isHighlighted ? 0.35 : 1,
              }}
              onClick={() => !isOpened && onEditPack?.(pack.number)}
            >
              {/* Number */}
              <span
                style={{
                  fontSize,
                  fontFamily: "var(--font-bangers)",
                  color: isHighlighted ? "#1a0a00" : isOpened ? "rgba(255,255,255,0.3)" : "#FFD700",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                {pack.number}
              </span>

              {/* Opened checkmark */}
              {isOpened && tileSize >= 30 && (
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ fontSize: tileSize * 0.45, opacity: 0.5 }}
                >
                  ✓
                </span>
              )}

              {/* Has content indicator */}
              {!isOpened && pack.content && tileSize >= 38 && (
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#4ade80",
                    top: 2,
                    right: 2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(255,215,0,0.25)", border: "1px solid rgba(255,215,0,0.4)" }} />
          <span className="text-white/40 text-xs">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)" }} />
          <span className="text-white/40 text-xs">Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <span className="text-white/40 text-xs">Abierto</span>
        </div>
        {total <= 200 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "#4ade80" }} />
            <span className="text-white/40 text-xs">Con contenido</span>
          </div>
        )}
        <span className="ml-auto text-white/30 text-xs">
          {packs.filter((p) => p.isOpened).length}/{total} abiertos
        </span>
      </div>
    </div>
  );
}
