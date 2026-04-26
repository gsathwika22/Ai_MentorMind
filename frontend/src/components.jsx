import React from "react";

// ─── TOPIC BADGE ─────────────────────────────────────────────────────────────
const TOPIC_COLORS = {
  algebra:       { bg: "rgba(112,72,232,0.15)", border: "rgba(112,72,232,0.4)", text: "#a78bfa" },
  calculus:      { bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.35)", text: "#67e8f9" },
  geometry:      { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)", text: "#6ee7b7" },
  statistics:    { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fcd34d" },
  number_theory: { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)", text: "#fca5a5" },
  trigonometry:  { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.35)", text: "#f9a8d4" },
  vectors:       { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.35)", text: "#c7d2fe" },
};

export function TopicBadge({ topic }) {
  if (!topic) return null;
  const c = TOPIC_COLORS[topic] || { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.15)", text: "#94a3b8" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.07em",
      textTransform: "uppercase", padding: "2px 8px",
      borderRadius: 99, border: `1px solid ${c.border}`,
      background: c.bg, color: c.text, display: "inline-block",
    }}>
      {topic.replace("_", " ")}
    </span>
  );
}

// ─── TYPING INDICATOR ────────────────────────────────────────────────────────
export function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--purple-light)",
          animation: "pulse-dot 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
export function Avatar({ name, isAI, size = 34 }) {
  const initials = isAI ? "M" : (name?.[0]?.toUpperCase() || "S");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, letterSpacing: "-0.01em",
      background: isAI
        ? "linear-gradient(135deg, #7048e8, #06b6d4)"
        : "linear-gradient(135deg, #f59e0b, #ef4444)",
      color: "#fff",
      fontFamily: "var(--font-display)",
      boxShadow: isAI
        ? "0 2px 12px rgba(112,72,232,0.35)"
        : "0 2px 12px rgba(245,158,11,0.3)",
    }}>
      {initials}
    </div>
  );
}

// ─── ICON BUTTON ────────────────────────────────────────────────────────────
export function IconButton({ onClick, disabled, children, title, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "6px 10px",
        fontSize: 13,
        transition: "all 0.2s",
        opacity: disabled ? 0.4 : 1,
        fontFamily: "var(--font-display)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.borderColor = "var(--border-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {children}
    </button>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
export function MetricCard({ label, value, accent = "var(--purple-light)" }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      textAlign: "center",
      minWidth: 72,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = "var(--purple)" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: `linear-gradient(90deg, var(--purple), var(--cyan))`,
        borderRadius: 99, transition: "width 0.5s ease",
      }} />
    </div>
  );
}

// ─── SPINNER ────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(112,72,232,0.2)`,
      borderTopColor: "var(--purple)",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
    }} />
  );
}
