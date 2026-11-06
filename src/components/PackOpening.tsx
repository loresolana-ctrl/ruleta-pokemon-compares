"use client";
import { useState, useEffect } from "react";
import { PackType, PokemonCard, RARITY_CONFIG, generatePackCards, BonusType } from "@/lib/pokemon-data";

interface PackOpeningProps {
  pack: PackType;
  bonus: BonusType | null;
  onDone: (cards: PokemonCard[]) => void;
}

export default function PackOpening({ pack, bonus, onDone }: PackOpeningProps) {
  const [stage, setStage] = useState<"pack" | "cards">("pack");
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    const generated = generatePackCards(bonus ?? undefined);
    setCards(generated);
  }, [pack, bonus]);

  const openPack = () => {
    setStage("cards");
    cards.forEach((_, i) => {
      setTimeout(() => {
        setVisibleCards(i + 1);
      }, i * 150 + 100);
    });
  };

  const rarityClass = (card: PokemonCard) => {
    if (card.rarity === "secret-rare") return "secret-card holo-card";
    if (card.rarity === "ultra-rare") return "ultra-card holo-card";
    if (card.rarity === "rare-holo") return "holo-card";
    return "";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
      {stage === "pack" && (
        <div className="flex flex-col items-center gap-6 pack-reveal">
          {/* Pack visual */}
          <div
            className="relative cursor-pointer group"
            style={{ width: 200, height: 280 }}
            onClick={openPack}
          >
            {/* Pack card */}
            <div
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden holo-card"
              style={{
                background: `linear-gradient(135deg, ${pack.color} 0%, ${pack.accentColor}44 50%, ${pack.color} 100%)`,
                border: `3px solid ${pack.accentColor}`,
                boxShadow: `0 0 40px ${pack.accentColor}66, 0 0 80px ${pack.color}44`,
              }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, ${pack.accentColor} 0px, ${pack.accentColor} 1px, transparent 1px, transparent 12px)`,
                }} />

              <div className="relative z-10 flex flex-col items-center gap-2">
                <span style={{ fontSize: 64 }}>{pack.emoji}</span>
                <span
                  className="font-bangers text-white text-center px-3"
                  style={{
                    fontFamily: "var(--font-bangers)",
                    fontSize: "1.3rem",
                    letterSpacing: "0.06em",
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {pack.name}
                </span>
                <span className="text-sm opacity-70 text-white">{pack.year}</span>
              </div>

              {/* Pokeball watermark */}
              <div className="absolute bottom-3 right-3 opacity-20">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="19" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="1" y1="20" x2="39" y2="20" stroke="white" strokeWidth="2" />
                  <circle cx="20" cy="20" r="6" fill="white" />
                  <circle cx="20" cy="20" r="3" fill="#333" />
                </svg>
              </div>
            </div>

            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: `0 0 60px ${pack.accentColor}88` }}
            />
          </div>

          {bonus && bonus.effect !== "none" && (
            <div
              className="glass-panel px-5 py-3 flex items-center gap-3"
              style={{ border: `1px solid ${bonus.color}66` }}
            >
              <span style={{ fontSize: 28 }}>{bonus.emoji}</span>
              <div>
                <div className="font-bold text-sm" style={{ color: bonus.color, fontFamily: "var(--font-bangers)", letterSpacing: "0.05em", fontSize: "1rem" }}>
                  {bonus.name}
                </div>
                <div className="text-xs opacity-60 text-white">{bonus.description}</div>
              </div>
            </div>
          )}

          <button
            className="btn-pokemon text-xl px-10 py-3 rounded-2xl font-bold"
            style={{ fontSize: "1.4rem", letterSpacing: "0.08em" }}
            onClick={openPack}
          >
            ¡ABRIR SOBRE!
          </button>
        </div>
      )}

      {stage === "cards" && (
        <div className="flex flex-col items-center gap-6 w-full">
          <h3 className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "1.6rem", letterSpacing: "0.06em" }}>
            ¡Cartas de {pack.name}!
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 w-full">
            {cards.map((card, i) => {
              const cfg = RARITY_CONFIG[card.rarity];
              const isVisible = i < visibleCards;

              return (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden ${isVisible ? "card-fly-in" : "opacity-0"} ${rarityClass(card)}`}
                  style={{
                    "--card-delay": `0s`,
                    background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
                    border: `2px solid ${cfg.color}`,
                    boxShadow: isVisible ? `0 4px 20px ${cfg.color}55` : undefined,
                    minHeight: 120,
                    padding: "10px 8px",
                  } as React.CSSProperties}
                >
                  <div className="relative z-10 flex flex-col items-center gap-1 h-full">
                    {/* Rarity badge */}
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${cfg.color}33`,
                        color: cfg.color,
                        fontSize: "0.6rem",
                        letterSpacing: "0.05em",
                        fontFamily: "var(--font-bangers)",
                      }}
                    >
                      {cfg.label}
                    </span>

                    {/* Pokemon emoji */}
                    <span style={{ fontSize: 30, lineHeight: 1, marginTop: 4 }}>{card.emoji}</span>

                    {/* Name */}
                    <span
                      className="text-center text-white font-bold leading-tight"
                      style={{
                        fontFamily: "var(--font-bangers)",
                        fontSize: "0.75rem",
                        letterSpacing: "0.04em",
                        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      {card.name}
                    </span>

                    {/* Type */}
                    <span className="text-xs opacity-50 text-white" style={{ fontSize: "0.6rem" }}>
                      {card.type}
                    </span>

                    {/* HP */}
                    <span
                      className="mt-auto text-xs font-bold"
                      style={{ color: cfg.color, fontSize: "0.65rem", fontFamily: "var(--font-bangers)" }}
                    >
                      HP {card.hp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCards >= cards.length && (
            <button
              className="btn-pokemon text-xl px-10 py-3 rounded-2xl mt-2"
              style={{ fontSize: "1.3rem", letterSpacing: "0.08em" }}
              onClick={() => onDone(cards)}
            >
              ¡CONTINUAR!
            </button>
          )}
        </div>
      )}
    </div>
  );
}
