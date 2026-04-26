import { useState, useRef, useEffect } from "react";
import React from "react";
import { jsPDF } from "jspdf";

const API = "http://localhost:8000";

const TOPICS = {
  arrays_hashing: "Arrays & Hashing",
  two_pointers: "Two Pointers",
  sliding_window: "Sliding Window",
  binary_search: "Binary Search",
  linked_list: "Linked List",
  stack_queue: "Stack & Queue",
  trees: "Trees",
  graphs: "Graphs",
  dynamic_programming: "Dynamic Programming",
  backtracking: "Backtracking",
  heap_priority_queue: "Heap / Priority Queue",
  greedy: "Greedy",
};

const TOPIC_COLORS = {
  arrays_hashing: "#7F77DD",
  two_pointers: "#1D9E75",
  sliding_window: "#D85A30",
  binary_search: "#378ADD",
  linked_list: "#D4537E",
  stack_queue: "#BA7517",
  trees: "#639922",
  graphs: "#533AB7",
  dynamic_programming: "#185FA5",
  backtracking: "#993C1D",
  heap_priority_queue: "#0F6E56",
  greedy: "#A32D2D",
};

// ─── Storage helpers (from your second file) ───────────────────────────────
const STORAGE_KEY = "mentormind_history";

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSession(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─── PDF download helper (from your second file) ───────────────────────────
function downloadChatAsPDF(messages, studentName, mode) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MentorMind – Chat Export", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `Student: ${studentName}  ·  Mode: ${mode}  ·  ${new Date().toLocaleString()}`,
    margin,
    y
  );
  y += 10;

  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  messages.forEach((msg) => {
    const isUser = msg.role === "user";
    const label = isUser ? "You" : "MentorMind";
    const color = isUser ? [80, 60, 180] : [20, 130, 90];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(label, margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40);

    const lines = doc.splitTextToSize(msg.content, maxWidth);
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 6;
    });
    y += 4;
  });

  doc.save(`mentormind-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

// ─── Small components ──────────────────────────────────────────────────────
function TopicBadge({ topic, score }) {
  const color = TOPIC_COLORS[topic] || "#888";
  const label = TOPICS[topic] || topic;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: color + "18",
        border: `1px solid ${color}44`,
        color,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.2,
      }}
    >
      {label}
      {score !== undefined && (
        <span style={{ opacity: 0.7, fontSize: 10 }}>
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </span>
  );
}

function RAGPanel({ chunks }) {
  if (!chunks || chunks.length === 0) return null;
  return (
    <div
      style={{
        marginTop: 8,
        padding: "8px 12px",
        background: "var(--color-background-secondary)",
        borderRadius: 8,
        border: "0.5px solid var(--color-border-tertiary)",
        fontSize: 11,
      }}
    >
      <div
        style={{
          color: "var(--color-text-secondary)",
          fontWeight: 500,
          marginBottom: 6,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          fontSize: 10,
        }}
      >
        Retrieved knowledge chunks
      </div>
      {chunks.map((c, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "3px 0",
            borderBottom:
              i < chunks.length - 1
                ? "0.5px solid var(--color-border-tertiary)"
                : "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 4,
              borderRadius: 2,
              background: TOPIC_COLORS[c.topic] || "#888",
              opacity: 0.3 + c.score * 0.7,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--color-text-secondary)", flex: 1 }}>
            {TOPICS[c.topic] || c.topic}
            <span style={{ marginLeft: 6, opacity: 0.6, fontStyle: "italic" }}>
              {c.chunk_type}
            </span>
          </span>
          <span
            style={{
              color: TOPIC_COLORS[c.topic] || "#888",
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            {(c.score * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function Message({ msg, showRAG }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 10,
        marginBottom: 16,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: isUser ? "#7F77DD22" : "#1D9E7522",
          border: `1px solid ${isUser ? "#7F77DD44" : "#1D9E7544"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          color: isUser ? "#7F77DD" : "#1D9E75",
        }}
      >
        {isUser ? "U" : "M"}
      </div>
      <div style={{ maxWidth: "76%", minWidth: 60 }}>
        <div
          style={{
            background: isUser
              ? "var(--color-background-secondary)"
              : "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: isUser
              ? "16px 4px 16px 16px"
              : "4px 16px 16px 16px",
            padding: "10px 14px",
            fontSize: 14,
            lineHeight: 1.65,
            color: "var(--color-text-primary)",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.content}
        </div>
        {msg.topic && (
          <div style={{ marginTop: 5, paddingLeft: 4 }}>
            <TopicBadge topic={msg.topic} />
          </div>
        )}
        {!isUser && showRAG && msg.chunks && (
          <RAGPanel chunks={msg.chunks} />
        )}
      </div>
    </div>
  );
}

function ProgressBar({ topic, count, max }) {
  const color = TOPIC_COLORS[topic] || "#888";
  const pct = Math.min((count / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
          fontSize: 12,
        }}
      >
        <span
          style={{ color: "var(--color-text-primary)", fontWeight: 500 }}
        >
          {TOPICS[topic] || topic}
        </span>
        <span style={{ color: "var(--color-text-secondary)" }}>
          {count} {count === 1 ? "session" : "sessions"}
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "var(--color-background-secondary)",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            width: `${pct}%`,
            background: color,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function QuizQuestion({ q, index }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setReveal] = useState(false);

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setReveal(true);
  };

  const correctLetter = (q.answer || "").charAt(0).toUpperCase();

  return (
    <div
      style={{
        marginBottom: 20,
        padding: "16px",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          marginBottom: 8,
        }}
      >
        Q{index + 1}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--color-text-primary)",
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        {q.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(q.options || []).map((opt, oi) => {
          const letter = opt.charAt(0).toUpperCase();
          const isCorrect = letter === correctLetter;
          const isSelected = selected === opt;

          let bg = "transparent";
          let border = "0.5px solid var(--color-border-tertiary)";
          let color = "var(--color-text-primary)";

          if (revealed) {
            if (isCorrect) {
              bg = "#1D9E7518";
              border = "1px solid #1D9E7544";
              color = "#0F6E56";
            } else if (isSelected) {
              bg = "#E24B4A18";
              border = "1px solid #E24B4A44";
              color = "#A32D2D";
            }
          } else if (isSelected) {
            bg = "#7F77DD18";
            border = "1px solid #7F77DD44";
            color = "#534AB7";
          }

          return (
            <button
              key={oi}
              onClick={() => handleSelect(opt)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                textAlign: "left",
                fontSize: 13,
                cursor: revealed ? "default" : "pointer",
                background: bg,
                border,
                color,
                transition: "all 0.15s",
                lineHeight: 1.5,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && q.explanation && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#1D9E7512",
            border: "0.5px solid #1D9E7533",
            borderRadius: 8,
            fontSize: 13,
            color: "#0F6E56",
            lineHeight: 1.5,
          }}
        >
          {q.explanation}
        </div>
      )}
    </div>
  );
}

// ─── Quiz History Panel (NEW) ──────────────────────────────────────────────
function QuizHistoryPanel({ history }) {
  const entries = Object.entries(history).sort(([a], [b]) => Number(b) - Number(a));

  if (entries.length === 0) {
    return (
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
        No quiz history yet — complete a quiz first.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {entries.map(([id, entry]) => {
        const date = new Date(Number(id));
        const label = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const correct = entry.results
          ? entry.results.filter((r) => r.correct).length
          : null;
        const total = entry.results ? entry.results.length : null;

        return (
          <div
            key={id}
            style={{
              padding: "12px 14px",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 10,
              background: "var(--color-background-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                {entry.topic && <TopicBadge topic={entry.topic} />}
                {entry.level && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-secondary)",
                      padding: "2px 8px",
                      borderRadius: 20,
                      border: "0.5px solid var(--color-border-tertiary)",
                      textTransform: "capitalize",
                    }}
                  >
                    {entry.level}
                  </span>
                )}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}
              >
                {label}
              </div>
            </div>
            {correct !== null && total !== null && (
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color:
                    correct / total >= 0.7
                      ? "#1D9E75"
                      : correct / total >= 0.4
                      ? "#BA7517"
                      : "#A32D2D",
                  whiteSpace: "nowrap",
                }}
              >
                {correct}/{total}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [studentName, setStudentName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [mode, setMode] = useState("Beginner");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRAG, setShowRAG] = useState(true);
  const [tab, setTab] = useState("chat");
  const [progress, setProgress] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // ── NEW: persistent history (quiz results + chat sessions) ──
  const [history, setHistory] = useState(loadSession);
  const [quizHistoryTab, setQuizHistoryTab] = useState("current"); // "current" | "history"

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleStart = () => {
    if (!nameInput.trim()) return;
    setStudentName(nameInput.trim());
    setMessages([
      {
        role: "assistant",
        content: `Hey ${nameInput.trim()}! I'm MentorMind, your DSA tutor. Tell me which problem or topic you're stuck on — I'll guide you through it step by step without giving you the answer directly.\n\nWhat are you working on today?`,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
          student_name: studentName,
          learning_mode: mode,
        }),
      });
      const data = await res.json();
      const assistantMsg = {
        role: "assistant",
        content: data.answer,
        topic: data.topic,
        chunks: data.retrieved_chunks,
      };
      const updated = [...newMessages, assistantMsg];
      setMessages(updated);

      // ── Save chat session to history ──
      const sessionEntry = {
        messages: updated,
        topic: data.topic || null,
        level: mode,
        type: "chat",
      };
      const newHistory = { ...history, [Date.now()]: sessionEntry };
      saveSession(newHistory);
      setHistory(newHistory);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection error — is the API server running on localhost:8000?",
        },
      ]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const loadProgress = async () => {
    try {
      const res = await fetch(
        `${API}/progress/${encodeURIComponent(studentName)}`
      );
      const data = await res.json();
      setProgress(data);
    } catch {
      setProgress(null);
    }
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    setQuiz(null);
    try {
      const res = await fetch(
        `${API}/quiz/${encodeURIComponent(studentName)}`
      );
      const data = await res.json();
      let parsed = [];
      try {
        parsed = JSON.parse(data.quiz);
      } catch {
        parsed = [];
      }
      setQuiz({ ...data, parsed });
    } catch {
      setQuiz({ error: true });
    }
    setQuizLoading(false);
  };

  // ── NEW: save quiz results when user finishes ──
  const saveQuizResult = (quizData, results) => {
    const entry = {
      topic: quizData.topic || null,
      level: quizData.difficulty || mode,
      results,
      type: "quiz",
    };
    const newHistory = { ...history, [Date.now()]: entry };
    saveSession(newHistory);
    setHistory(newHistory);
  };

  useEffect(() => {
    if (tab === "progress" && studentName) loadProgress();
    if (tab === "quiz" && studentName && !quiz) loadQuiz();
  }, [tab]);

  // ── NEW: Download chat as PDF ──
  const handleDownloadChat = () => {
    if (messages.length === 0) return;
    downloadChatAsPDF(messages, studentName, mode);
  };

  if (!studentName) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7F77DD22, #1D9E7522)",
              border: "0.5px solid #7F77DD44",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 26,
            }}
          >
            🧠
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 500,
              marginBottom: 8,
              color: "var(--color-text-primary)",
              letterSpacing: -0.5,
            }}
          >
            MentorMind
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Your Socratic DSA tutor — powered by real RAG.
            <br />
            No answers given. Only the right questions.
          </p>
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="Your name to get started"
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: 15,
              borderRadius: 10,
              border: "0.5px solid var(--color-border-secondary)",
              background: "var(--color-background-primary)",
              color: "var(--color-text-primary)",
              marginBottom: 12,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["Beginner", "Intermediate", "Advanced"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  fontSize: 13,
                  border:
                    mode === m
                      ? "1px solid #7F77DD"
                      : "0.5px solid var(--color-border-tertiary)",
                  background: mode === m ? "#7F77DD18" : "transparent",
                  color:
                    mode === m ? "#7F77DD" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontWeight: mode === m ? 500 : 400,
                  transition: "all 0.15s",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={handleStart}
            disabled={!nameInput.trim()}
            style={{
              width: "100%",
              padding: "11px 0",
              background: nameInput.trim()
                ? "#7F77DD"
                : "var(--color-background-secondary)",
              color: nameInput.trim()
                ? "#fff"
                : "var(--color-text-tertiary)",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              cursor: nameInput.trim() ? "pointer" : "default",
              transition: "all 0.15s",
            }}
          >
            Start learning
          </button>
          <p
            style={{
              marginTop: 16,
              fontSize: 12,
              color: "var(--color-text-tertiary)",
            }}
          >
            ChromaDB · sentence-transformers · Groq Llama 3.1
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--color-background-tertiary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#7F77DD18",
            border: "0.5px solid #7F77DD44",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          🧠
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 500,
              fontSize: 15,
              color: "var(--color-text-primary)",
              lineHeight: 1.2,
            }}
          >
            MentorMind
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {studentName} · {mode}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* ── NEW: Download Chat PDF button ── */}
          {tab === "chat" && messages.length > 1 && (
            <button
              onClick={handleDownloadChat}
              title="Download chat as PDF"
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 20,
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ↓ PDF
            </button>
          )}
          <button
            onClick={() => setShowRAG((v) => !v)}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 20,
              border: showRAG
                ? "1px solid #1D9E7544"
                : "0.5px solid var(--color-border-tertiary)",
              background: showRAG ? "#1D9E7518" : "transparent",
              color: showRAG ? "#1D9E75" : "var(--color-text-secondary)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            RAG
          </button>
          {["chat", "progress", "quiz"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontSize: 12,
                padding: "5px 12px",
                borderRadius: 20,
                border:
                  tab === t
                    ? "1px solid #7F77DD44"
                    : "0.5px solid var(--color-border-tertiary)",
                background: tab === t ? "#7F77DD18" : "transparent",
                color: tab === t ? "#7F77DD" : "var(--color-text-secondary)",
                cursor: "pointer",
                textTransform: "capitalize",
                fontWeight: tab === t ? 500 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Chat tab ── */}
        {tab === "chat" && (
          <>
            <div
              style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}
            >
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} showRAG={showRAG} />
              ))}
              {loading && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#1D9E7522",
                      border: "1px solid #1D9E7544",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1D9E75",
                      flexShrink: 0,
                    }}
                  >
                    M
                  </div>
                  <div
                    style={{
                      background: "var(--color-background-primary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "4px 16px 16px 16px",
                      padding: "12px 16px",
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#1D9E75",
                          animation: "bounce 1.2s infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div
              style={{
                padding: "12px 20px 16px",
                background: "var(--color-background-primary)",
                borderTop: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Describe your DSA problem or ask a concept question…"
                  rows={2}
                  style={{
                    flex: 1,
                    resize: "none",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "0.5px solid var(--color-border-secondary)",
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 44,
                    borderRadius: 10,
                    border: "none",
                    background:
                      input.trim() && !loading
                        ? "#7F77DD"
                        : "var(--color-background-secondary)",
                    color:
                      input.trim() && !loading
                        ? "#fff"
                        : "var(--color-text-tertiary)",
                    fontSize: 18,
                    cursor:
                      input.trim() && !loading ? "pointer" : "default",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}
                >
                  ↑
                </button>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  marginTop: 6,
                  paddingLeft: 2,
                }}
              >
                Enter to send · Shift+Enter for newline
              </div>
            </div>
          </>
        )}

        {/* ── Progress tab ── */}
        {tab === "progress" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 16,
                }}
              >
                Topic history
              </div>
              {progress ? (
                progress.topic_stats.length > 0 ? (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      {[
                        {
                          label: "Questions asked",
                          value: progress.message_count,
                        },
                        {
                          label: "Topics explored",
                          value: progress.topic_stats.length,
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          style={{
                            background: "var(--color-background-secondary)",
                            borderRadius: 8,
                            padding: "12px 16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              marginBottom: 4,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 500,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                    {progress.topic_stats.map((s) => (
                      <ProgressBar
                        key={s.topic}
                        topic={s.topic}
                        count={s.count}
                        max={progress.topic_stats[0].count}
                      />
                    ))}
                  </>
                ) : (
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: 14,
                    }}
                  >
                    No sessions yet. Start asking questions in the chat tab.
                  </p>
                )
              ) : (
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: 14,
                  }}
                >
                  Loading…
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Quiz tab ── */}
        {tab === "quiz" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {/* ── NEW: sub-tabs for current quiz vs history ── */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["current", "history"].map((t) => (
                <button
                  key={t}
                  onClick={() => setQuizHistoryTab(t)}
                  style={{
                    fontSize: 12,
                    padding: "5px 14px",
                    borderRadius: 20,
                    border:
                      quizHistoryTab === t
                        ? "1px solid #7F77DD44"
                        : "0.5px solid var(--color-border-tertiary)",
                    background:
                      quizHistoryTab === t ? "#7F77DD18" : "transparent",
                    color:
                      quizHistoryTab === t
                        ? "#7F77DD"
                        : "var(--color-text-secondary)",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    fontWeight: quizHistoryTab === t ? 500 : 400,
                  }}
                >
                  {t === "current" ? "Quiz" : "History"}
                </button>
              ))}
            </div>

            {quizHistoryTab === "current" && (
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Adaptive quiz
                  </div>
                  <button
                    onClick={loadQuiz}
                    style={{
                      fontSize: 12,
                      padding: "5px 12px",
                      borderRadius: 20,
                      border: "0.5px solid var(--color-border-secondary)",
                      background: "transparent",
                      color: "var(--color-text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    New quiz ↻
                  </button>
                </div>
                {quizLoading && (
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: 14,
                    }}
                  >
                    Generating quiz…
                  </p>
                )}
                {quiz?.error && (
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: 14,
                    }}
                  >
                    No quiz available yet — chat about some DSA topics first.
                  </p>
                )}
                {quiz && !quiz.error && !quizLoading && (
                  <>
                    <div
                      style={{ marginBottom: 16, display: "flex", gap: 8 }}
                    >
                      <TopicBadge topic={quiz.topic} />
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-secondary)",
                          padding: "2px 8px",
                          borderRadius: 20,
                          border: "0.5px solid var(--color-border-tertiary)",
                          textTransform: "capitalize",
                        }}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                    <QuizWithTracking
                      quiz={quiz}
                      onComplete={(results) => saveQuizResult(quiz, results)}
                    />
                  </>
                )}
              </div>
            )}

            {quizHistoryTab === "history" && (
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  Quiz history
                  <button
                    onClick={() => {
                      clearSession();
                      setHistory({});
                    }}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 20,
                      border: "0.5px solid #A32D2D44",
                      background: "transparent",
                      color: "#A32D2D",
                      cursor: "pointer",
                    }}
                  >
                    Clear all
                  </button>
                </div>
                <QuizHistoryPanel
                  history={Object.fromEntries(
                    Object.entries(history).filter(
                      ([, e]) => e.type === "quiz"
                    )
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── QuizWithTracking wraps QuizQuestion and collects results ──────────────
// NEW component — replaces the bare quiz.parsed.map() so we can record scores
function QuizWithTracking({ quiz, onComplete }) {
  const total = quiz.parsed.length;
  const [answers, setAnswers] = useState({}); // { index: { opt, correct } }
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (index, opt, correct) => {
    if (submitted || answers[index]) return;
    const updated = { ...answers, [index]: { opt, correct } };
    setAnswers(updated);
    if (Object.keys(updated).length === total && !submitted) {
      setSubmitted(true);
      onComplete(Object.values(updated));
    }
  };

  const score = Object.values(answers).filter((a) => a.correct).length;

  return (
    <>
      {quiz.parsed.map((q, qi) => (
        <QuizQuestionTracked
          key={qi}
          q={q}
          index={qi}
          onAnswer={(opt, correct) => handleAnswer(qi, opt, correct)}
        />
      ))}
      {submitted && (
        <div
          style={{
            marginTop: 8,
            padding: "12px 16px",
            background:
              score / total >= 0.7 ? "#1D9E7512" : "#BA751712",
            border: `0.5px solid ${
              score / total >= 0.7 ? "#1D9E7533" : "#BA751733"
            }`,
            borderRadius: 10,
            fontSize: 13,
            color:
              score / total >= 0.7 ? "#0F6E56" : "#BA7517",
            fontWeight: 500,
          }}
        >
          You scored {score}/{total} —{" "}
          {score / total >= 0.7
            ? "Great job! 🎉"
            : score / total >= 0.4
            ? "Good effort, keep practicing."
            : "Review the topic and try again."}
        </div>
      )}
    </>
  );
}

// Variant of QuizQuestion that calls onAnswer callback
function QuizQuestionTracked({ q, index, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setReveal] = useState(false);

  const correctLetter = (q.answer || "").charAt(0).toUpperCase();

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setReveal(true);
    const letter = opt.charAt(0).toUpperCase();
    onAnswer(opt, letter === correctLetter);
  };

  return (
    <div
      style={{
        marginBottom: 20,
        padding: "16px",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          marginBottom: 8,
        }}
      >
        Q{index + 1}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--color-text-primary)",
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        {q.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(q.options || []).map((opt, oi) => {
          const letter = opt.charAt(0).toUpperCase();
          const isCorrect = letter === correctLetter;
          const isSelected = selected === opt;

          let bg = "transparent";
          let border = "0.5px solid var(--color-border-tertiary)";
          let color = "var(--color-text-primary)";

          if (revealed) {
            if (isCorrect) {
              bg = "#1D9E7518";
              border = "1px solid #1D9E7544";
              color = "#0F6E56";
            } else if (isSelected) {
              bg = "#E24B4A18";
              border = "1px solid #E24B4A44";
              color = "#A32D2D";
            }
          } else if (isSelected) {
            bg = "#7F77DD18";
            border = "1px solid #7F77DD44";
            color = "#534AB7";
          }

          return (
            <button
              key={oi}
              onClick={() => handleSelect(opt)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                textAlign: "left",
                fontSize: 13,
                cursor: revealed ? "default" : "pointer",
                background: bg,
                border,
                color,
                transition: "all 0.15s",
                lineHeight: 1.5,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && q.explanation && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#1D9E7512",
            border: "0.5px solid #1D9E7533",
            borderRadius: 8,
            fontSize: 13,
            color: "#0F6E56",
            lineHeight: 1.5,
          }}
        >
          {q.explanation}
        </div>
      )}
    </div>
  );
}

