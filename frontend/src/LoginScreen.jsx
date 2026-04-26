import React, { useState } from "react";

const TOPICS = ["Algebra", "Calculus", "Geometry", "Statistics", "Trigonometry", "Vectors", "Number Theory"];

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) onLogin(name.trim());
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
      background: "radial-gradient(ellipse at 30% 20%, rgba(112,72,232,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.08) 0%, transparent 60%), var(--bg-0)",
    }}>
      {/* Floating math symbols */}
      {["∫", "∑", "π", "√", "∞", "θ", "Δ"].map((sym, i) => (
        <div key={i} style={{
          position: "fixed",
          top: `${15 + i * 12}%`,
          left: `${5 + (i % 3) * 30}%`,
          fontSize: 28, opacity: 0.04,
          color: i % 2 === 0 ? "var(--purple)" : "var(--cyan)",
          fontFamily: "var(--font-mono)",
          animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          pointerEvents: "none", userSelect: "none",
        }}>
          {sym}
        </div>
      ))}

      <div style={{
        maxWidth: 420, width: "100%", textAlign: "center",
        animation: "fadeUp 0.6s ease both",
      }}>
        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
          background: "linear-gradient(135deg, #7048e8, #06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 38,
          boxShadow: "0 0 40px rgba(112,72,232,0.3)",
          animation: "float 4s ease-in-out infinite",
        }}>
          🧠
        </div>

        <h1 style={{
          fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em",
          background: "linear-gradient(90deg, #a78bfa 0%, #06b6d4 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 10,
        }}>
          MentorMind
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
          Your Socratic math mentor.<br />
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            I guide you to the answer — I never hand it over.
          </span>
        </p>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          border: `1px solid ${focused ? "var(--border-accent)" : "var(--border)"}`,
          borderRadius: "var(--radius-xl)", padding: "28px 28px 24px",
          transition: "border-color 0.3s",
          backdropFilter: "blur(10px)",
        }}>
          <label style={{ display: "block", textAlign: "left", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Your Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. Arjun, Priya, Alex..."
            autoFocus
            style={{
              width: "100%", padding: "13px 16px",
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)", fontSize: 15,
              outline: "none", marginBottom: 16,
              fontFamily: "var(--font-display)",
              transition: "border-color 0.2s",
            }}
            onFocusCapture={(e) => { e.target.style.borderColor = "var(--purple)"; }}
            onBlurCapture={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              width: "100%", padding: "14px",
              background: name.trim()
                ? "linear-gradient(135deg, #7048e8, #06b6d4)"
                : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: "var(--radius-md)",
              color: name.trim() ? "#fff" : "var(--text-muted)",
              fontSize: 15, fontWeight: 600,
              cursor: name.trim() ? "pointer" : "not-allowed",
              transition: "all 0.3s",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => { if (name.trim()) e.currentTarget.style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
          >
            Start Learning →
          </button>
        </div>

        {/* Topic pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 24 }}>
          {TOPICS.map((t) => (
            <span key={t} style={{
              fontSize: 11, padding: "4px 10px",
              background: "rgba(112,72,232,0.1)",
              border: "1px solid rgba(112,72,232,0.2)",
              borderRadius: 99, color: "var(--purple-light)",
            }}>
              {t}
            </span>
          ))}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 20 }}>
          Powered by Claude · Real-time streaming · Socratic method
        </p>
      </div>
    </div>
  );
}
