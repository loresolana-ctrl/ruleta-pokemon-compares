"use client";
import { useState, useRef } from "react";
import { Pack } from "@/lib/game-data";

const PAGE_SIZE = 20;

interface PackEditorProps {
  packs: Pack[];
  onChange: (packs: Pack[]) => void;
  onConfirm: () => void;
}

export default function PackEditor({ packs, onChange, onConfirm }: PackEditorProps) {
  const [page, setPage] = useState(0);
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [search, setSearch] = useState("");
  const [jumpTo, setJumpTo] = useState("");
  const inputsRef = useRef<Record<number, HTMLInputElement>>({});

  const totalPages = Math.ceil(packs.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;

  const filtered = search.trim()
    ? packs.filter((p) => String(p.number).includes(search.trim()))
    : packs.slice(start, start + PAGE_SIZE);

  const updatePack = (number: number, field: keyof Pack, value: string) => {
    onChange(packs.map((p) => (p.number === number ? { ...p, [field]: value } : p)));
  };

  const applyBulk = () => {
    onChange(packs.map((p) => ({ ...p, content: bulkText })));
    setShowBulk(false);
  };

  const clearAll = () => {
    onChange(packs.map((p) => ({ ...p, content: "" })));
  };

  const filledCount = packs.filter((p) => p.content.trim()).length;

  const jumpToPage = () => {
    const n = parseInt(jumpTo);
    if (n >= 1 && n <= packs.length) {
      const targetPage = Math.floor((n - 1) / PAGE_SIZE);
      setPage(targetPage);
      setJumpTo("");
      setSearch("");
      setTimeout(() => {
        inputsRef.current[n]?.focus();
        inputsRef.current[n]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  };

  return (
    <div className="glass-panel w-full max-w-2xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-gold" style={{ fontFamily: "var(--font-bangers)", fontSize: "1.8rem", letterSpacing: "0.06em" }}>
            EDITAR SOBRES
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            {filledCount}/{packs.length} sobres con contenido
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700" }}
            onClick={() => setShowBulk((v) => !v)}
          >
            ✏️ Llenar todos
          </button>
          <button
            className="text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff8080" }}
            onClick={clearAll}
          >
            🗑 Limpiar
          </button>
        </div>
      </div>

      {/* Bulk fill panel */}
      {showBulk && (
        <div className="p-4 rounded-xl flex gap-3 items-center" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)" }}>
          <input
            className="flex-1 bg-transparent text-white text-sm px-3 py-2 rounded-lg"
            style={{ border: "1px solid rgba(255,215,0,0.3)", outline: "none" }}
            placeholder="Contenido para todos los sobres…"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyBulk()}
          />
          <button className="btn-pokemon px-4 py-2 rounded-lg text-sm" onClick={applyBulk}>
            Aplicar
          </button>
        </div>
      )}

      {/* Search + jump */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-transparent text-white text-sm px-3 py-2 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.15)", outline: "none" }}
          placeholder="Buscar número de sobre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="bg-transparent text-white text-sm px-3 py-2 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.15)", outline: "none", width: 90 }}
          placeholder="Ir a #"
          type="number"
          value={jumpTo}
          onChange={(e) => setJumpTo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
        />
        <button
          className="text-sm px-3 py-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
          onClick={jumpToPage}
        >
          Ir
        </button>
      </div>

      {/* Pack list */}
      <div className="flex flex-col gap-2" style={{ maxHeight: 380, overflowY: "auto" }}>
        {filtered.map((pack) => (
          <div
            key={pack.number}
            className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Number badge */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-lg"
              style={{
                width: 48,
                height: 36,
                background: pack.content ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${pack.content ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)"}`,
                fontFamily: "var(--font-bangers)",
                fontSize: "1rem",
                color: pack.content ? "#FFD700" : "rgba(255,255,255,0.35)",
                letterSpacing: "0.04em",
              }}
            >
              #{pack.number}
            </div>

            {/* Content input */}
            <input
              ref={(el) => { if (el) inputsRef.current[pack.number] = el; }}
              className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 rounded-lg"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              placeholder={`Contenido del sobre #${pack.number}…`}
              value={pack.content}
              onChange={(e) => updatePack(pack.number, "content", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,215,0,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />

            {/* Clear single */}
            {pack.content && (
              <button
                className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity text-white"
                style={{ fontSize: 16 }}
                onClick={() => updatePack(pack.number, "content", "")}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!search.trim() && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            className="px-4 py-2 rounded-lg text-sm disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Anterior
          </button>
          <span className="text-white/40 text-sm">
            {page + 1} / {totalPages} — #{start + 1}–#{Math.min(start + PAGE_SIZE, packs.length)}
          </span>
          <button
            className="px-4 py-2 rounded-lg text-sm disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Confirm button */}
      <button
        className="btn-pokemon w-full py-4 rounded-2xl mt-1"
        style={{ fontSize: "1.6rem", letterSpacing: "0.1em" }}
        onClick={onConfirm}
      >
        ¡COMENZAR SUBASTA!
      </button>
    </div>
  );
}
