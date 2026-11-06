"use client";
import { useState } from "react";
import { Pack } from "@/lib/game-data";

interface PackRevealProps {
  pack: Pack;
  onEdit: (content: string) => void;
  onClose: () => void;
}

export default function PackReveal({ pack, onEdit, onClose }: PackRevealProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(pack.content);

  const saveEdit = () => {
    onEdit(editValue);
    setEditing(false);
  };

  return (
    <div className="pack-reveal flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      {/* Pack number badge */}
      <div
        className="flex items-center gap-3 px-6 py-3 rounded-2xl winner-glow"
        style={{
          background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.1))",
          border: "2px solid rgba(255,215,0,0.6)",
        }}
      >
        <span style={{ fontSize: 36 }}>🎁</span>
        <div>
          <div className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "2rem", letterSpacing: "0.06em", lineHeight: 1 }}>
            PREMIO #{pack.number}
          </div>
          <div className="text-white/40 text-xs text-center">¡GANADO!</div>
        </div>
      </div>

      {/* Content */}
      <div
        className="w-full rounded-2xl p-5"
        style={{
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          minHeight: 100,
        }}
      >
        {editing ? (
          <div className="flex flex-col gap-3">
            <textarea
              className="w-full bg-transparent text-white text-base resize-none px-2 py-1 rounded-lg"
              style={{
                border: "1px solid rgba(255,215,0,0.5)",
                outline: "none",
                minHeight: 80,
              }}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                className="btn-pokemon flex-1 py-2 rounded-xl text-sm"
                style={{ fontSize: "1rem", letterSpacing: "0.05em" }}
                onClick={saveEdit}
              >
                Guardar
              </button>
              <button
                className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
                onClick={() => { setEditing(false); setEditValue(pack.content); }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pack.content ? (
              <p
                className="text-white text-center leading-relaxed"
                style={{ fontSize: "1.1rem", whiteSpace: "pre-wrap" }}
              >
                {pack.content}
              </p>
            ) : (
              <p className="text-white/30 text-center italic text-sm">
                Sin contenido definido
              </p>
            )}
            <button
              className="self-center text-xs px-3 py-1 rounded-lg opacity-50 hover:opacity-90 transition-opacity"
              style={{ color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", background: "transparent" }}
              onClick={() => setEditing(true)}
            >
              ✏️ Editar contenido
            </button>
          </div>
        )}
      </div>

      <button
        className="btn-pokemon w-full py-3 rounded-2xl"
        style={{ fontSize: "1.4rem", letterSpacing: "0.08em" }}
        onClick={onClose}
      >
        ¡CONTINUAR!
      </button>
    </div>
  );
}
