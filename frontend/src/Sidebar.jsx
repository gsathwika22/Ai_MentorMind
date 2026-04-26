import React from "react";
import { MetricCard, ProgressBar } from "./components";

const MODES = [
  { id: "Beginner",     icon: "🟢", desc: "Step-by-step with analogies" },
  { id: "Intermediate", icon: "🟡", desc: "Hints & probing questions" },
  { id: "Advanced",     icon: "🔴", desc: "Concise & challenging" },
];

export default function Sidebar({
  studentName,
  learningMode,
  setLearningMode,
  topicStats,
  totalQuestions,
  onClearChat,
  onSwitchUser,
}) {
  const sorted = Object.entries(topicStats).sort(([, a], [, b]) => b - a).slice(0, 6);
  const maxCount = sorted[0]?.[1] || 1;

  return (
    <aside style={{
      width: 230,
      flexShrink: 0,
      background: "var(--bg-1)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 14px",
      gap: 22,
      overflowY: "auto",
    }}>
      {/* Brand */}
      <div>
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em",
          background: "linear-gradient(90deg, #a78bfa, #06b6d4)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontFamily: "var(--font-display)",
        }}>
          MentorMind
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          Socratic Math Tutor · v2
        </div>
      </div>

      {/* Student chip */}
      <div style={{
        background: "linear-gradient(135deg, rgba(112,72,232,0.12), rgba(6,182,212,0.08))",
        border: "1px solid var(--border-accent)",
        borderRadius: "var(--radius-md)", padding: "10px 12px",
      }}>
        <div style={{ fontSize: 10, color: "var(--purple-light)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
          Student
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
          {studentName}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8 }}>
        <MetricCard label="Questions" value={totalQuestions} accent="var(--purple-light)" />
        <MetricCard label="Topics" value={Object.keys(topicStats).length} accent="var(--cyan)" />
      </div>

      {/* Learning Mode */}
      <div>
        <SectionLabel>Learning Mode</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {MODES.map(({ id, icon, desc }) => {
            const active = learningMode === id;
            return (
              <button key={id} onClick={() => setLearningMode(id)} style={{
                textAlign: "left", padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                border: active ? "1px solid var(--border-accent)" : "1px solid transparent",
                background: active ? "rgba(112,72,232,0.12)" : "transparent",
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "var(--font-display)",
              }}>
                <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {icon} {id}
                </div>
                {active && (
                  <div style={{ fontSize: 10, color: "var(--purple-light)", marginTop: 2 }}>
                    {desc}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Activity */}
      {sorted.length > 0 && (
        <div>
          <SectionLabel>Topic Activity</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {sorted.map(([topic, count]) => (
              <div key={topic}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                    {topic.replace("_", " ")}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {count}
                  </span>
                </div>
                <ProgressBar value={count} max={maxCount} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Tip */}
      {sorted.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "var(--radius-md)", padding: "10px 12px",
        }}>
          <div style={{ fontSize: 11, color: "#fcd34d", marginBottom: 4 }}>💡 Focus Area</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Keep pushing on <strong style={{ color: "var(--text-primary)" }}>
              {sorted[0][0].replace("_", " ")}
            </strong> — consistency builds intuition!
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        <SidebarButton onClick={onClearChat} danger>
          🗑 Clear Chat
        </SidebarButton>
        <SidebarButton onClick={onSwitchUser}>
          ↩ Switch User
        </SidebarButton>
      </div>
    </aside>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
      textTransform: "uppercase", letterSpacing: "0.1em",
    }}>
      {children}
    </div>
  );
}

function SidebarButton({ children, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 12,
      fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
      textAlign: "center", fontFamily: "var(--font-display)",
      background: danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
      border: danger ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)",
      color: danger ? "#fca5a5" : "var(--text-secondary)",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
    >
      {children}
    </button>
  );
}
